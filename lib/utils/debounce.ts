/**
 * Debounce utility for performance optimization
 * Prevents excessive function calls by delaying execution until after a specified delay
 */

export type AnyFn = (...args: unknown[]) => unknown;

export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export type DebouncedFunction<TArgs extends unknown[], TReturn> = {
  (...args: TArgs): void;
  cancel: () => void;
  flush: () => TReturn;
  pending: () => boolean;
};

/**
 * Creates a debounced version of the provided function
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @param options - Additional options for debouncing behavior
 */
export function debounce<TArgs extends unknown[], TReturn>(
  func: (...args: TArgs) => TReturn,
  delay: number,
  options: DebounceOptions = {}
): DebouncedFunction<TArgs, TReturn> {
  const { leading = false, trailing = true, maxWait } = options;
  
  let timeoutId: NodeJS.Timeout | null = null;
  let maxTimeoutId: NodeJS.Timeout | null = null;
  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;
  let lastArgs: TArgs | null = null;
  let result: TReturn;

  function invokeFunc(time: number): TReturn {
    const args = lastArgs!;
    lastArgs = null;
    lastInvokeTime = time;
    result = func(...args) as TReturn;
    return result;
  }

  function leadingEdge(time: number): TReturn {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timeoutId = setTimeout(timerExpired, delay);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = delay - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (
      lastCallTime === null ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired(): void {
    const time = Date.now();
    if (shouldInvoke(time)) {
      trailingEdge(time);
    } else {
      // Restart the timer.
      timeoutId = setTimeout(timerExpired, remainingWait(time));
    }
  }

  function trailingEdge(time: number): TReturn {
    timeoutId = null;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = null;
    return result;
  }

  function cancel(): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId !== null) {
      clearTimeout(maxTimeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = null;
    lastCallTime = null;
    timeoutId = null;
    maxTimeoutId = null;
  }

  function flush(): TReturn {
    return timeoutId === null ? result : trailingEdge(Date.now());
  }

  function pending(): boolean {
    return timeoutId !== null;
  }

  function debounced(...args: TArgs): void {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === null) {
        leadingEdge(lastCallTime);
      } else if (maxWait !== undefined) {
        // Handle invocations in a tight loop.
        timeoutId = setTimeout(timerExpired, delay);
        maxTimeoutId = setTimeout(() => invokeFunc(lastCallTime!), maxWait);
        invokeFunc(lastCallTime);
      }
    } else if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, delay);
    }
  }

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;

  return debounced;
}

/**
 * Creates a throttled version of the provided function
 * Ensures the function is called at most once per specified interval
 */
export function throttle<TArgs extends unknown[], TReturn>(
  func: (...args: TArgs) => TReturn,
  delay: number,
  options: Omit<DebounceOptions, 'maxWait'> = {}
): DebouncedFunction<TArgs, TReturn> {
  return debounce(func, delay, {
    leading: true,
    trailing: true,
    maxWait: delay,
    ...options,
  });
}

/**
 * Debounced validation hook for form fields
 * Optimizes form validation by reducing validation calls
 */
export function createDebouncedValidator<T>(
  validator: (value: T) => Promise<string | undefined> | string | undefined,
  delay: number = 300
) {
  const validatorWrapper = async (value: unknown, callback: unknown) => {
    try {
      const result = await validator(value as T);
      (callback as (error?: string) => void)(result);
    } catch (error) {
      (callback as (error?: string) => void)(error instanceof Error ? error.message : 'Validation error');
    }
  };

  const debouncedValidate = debounce(
    validatorWrapper,
    delay,
    { leading: false, trailing: true }
  );

  return {
    validate: (value: T): Promise<string | undefined> => {
      return new Promise((resolve) => {
        debouncedValidate(value, resolve);
      });
    },
    cancel: debouncedValidate.cancel,
    flush: debouncedValidate.flush,
    pending: debouncedValidate.pending,
  };
}

/**
 * Debounced search function for better performance
 */
export function createDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  delay: number = 300
) {
  let currentQuery = '';
  let abortController: AbortController | null = null;

  const searchWrapper = async (query: unknown, callback: unknown) => {
    // Cancel previous request if still pending
    if (abortController) {
      abortController.abort();
    }

    // Create new abort controller for this request
    abortController = new AbortController();
    currentQuery = query as string;

    try {
      const results = await searchFn(query as string);
      
      // Only call callback if this is still the current query
      if (currentQuery === query && !abortController.signal.aborted) {
        (callback as (results: T[], error?: Error) => void)(results);
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        (callback as (results: T[], error?: Error) => void)([], error instanceof Error ? error : new Error('Search failed'));
      }
    }
  };

  const debouncedSearch = debounce(
    searchWrapper,
    delay,
    { leading: false, trailing: true }
  );

  return {
    search: (query: string): Promise<{ results: T[]; error?: Error }> => {
      return new Promise((resolve) => {
        debouncedSearch(query, (results: T[], error?: Error) => {
          resolve({ results, error });
        });
      });
    },
    cancel: () => {
      debouncedSearch.cancel();
      if (abortController) {
        abortController.abort();
        abortController = null;
      }
    },
    pending: debouncedSearch.pending,
  };
}

/**
 * Debounced API call utility
 * Prevents rapid successive API calls to the same endpoint
 */
export function createDebouncedApiCall<TArgs extends unknown[], TResult>(
  apiCall: (...args: TArgs) => Promise<TResult>,
  delay: number = 500
) {
  const pendingCalls = new Map<string, Promise<TResult>>();

  const apiCallWrapper = async (...args: unknown[]) => {
    const [key, apiArgs, resolve, reject] = args;
    try {
      const result = await apiCall(...(apiArgs as TArgs));
      pendingCalls.delete(key as string);
      (resolve as (value: TResult) => void)(result);
    } catch (error) {
      pendingCalls.delete(key as string);
      (reject as (error: unknown) => void)(error);
    }
  };

  const debouncedCall = debounce(
    apiCallWrapper,
    delay,
    { leading: false, trailing: true }
  );

  return (...args: TArgs): Promise<TResult> => {
    const key = JSON.stringify(args);
    
    // Return existing promise if call is already pending
    if (pendingCalls.has(key)) {
      return pendingCalls.get(key)!;
    }

    const promise = new Promise<TResult>((resolve, reject) => {
      debouncedCall(key, args, resolve, reject);
    });

    pendingCalls.set(key, promise);
    return promise;
  };
}