/**
 * Comprehensive error handling utilities for the my-account CRUD integration
 * Provides network error handling, validation error display, graceful fallbacks,
 * and proper error logging with user feedback
 */

import { toast } from 'sonner';
import { z } from 'zod';

// Error types and interfaces
export interface NetworkError extends Error {
  status?: number;
  code?: string;
  details?: string;
  retryable?: boolean;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: string | ValidationErrorDetail[];
  code?: string;
  status?: number;
}

export interface ErrorContext {
  operation: string;
  userId?: string;
  timestamp: number;
  userAgent?: string;
  url?: string;
  method?: string;
  details?: Record<string, unknown>;
  fallbackKey?: string;
  attempt?: number;
  maxAttempts?: number;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableStatuses: number[];
}

// Default retry configuration
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

// Error classification
export class ErrorClassifier {
  static isNetworkError(error: unknown): error is NetworkError {
    return error instanceof Error && (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      'status' in error
    );
  }

  static isValidationError(error: unknown): boolean {
    return error instanceof z.ZodError ||
           (error instanceof Error && error.message.includes('Validation failed'));
  }

  static isAuthenticationError(error: unknown): boolean {
    return error instanceof Error && (
      error.message.includes('Unauthorized') ||
      error.message.includes('401') ||
      error.message.includes('Authentication')
    );
  }

  static isRetryableError(error: unknown, config: RetryConfig = DEFAULT_RETRY_CONFIG): boolean {
    if (!this.isNetworkError(error)) return false;
    
    const status = error.status;
    if (!status) return true; // Network errors without status are retryable
    
    return config.retryableStatuses.includes(status);
  }

  static getErrorSeverity(error: unknown): 'low' | 'medium' | 'high' | 'critical' {
    if (this.isValidationError(error)) return 'low';
    if (this.isAuthenticationError(error)) return 'medium';
    if (this.isNetworkError(error)) {
      const networkError = error as NetworkError;
      if (networkError.status && networkError.status >= 500) return 'high';
      return 'medium';
    }
    return 'critical';
  }
}

// Enhanced error logger
export class ErrorLogger {
  private static logToConsole(level: 'error' | 'warn' | 'info', message: string, context?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage, context);
        break;
      case 'warn':
        console.warn(logMessage, context);
        break;
      case 'info':
        console.info(logMessage, context);
        break;
    }
  }

  static logError(error: unknown, context: Partial<ErrorContext> = {}) {
    const errorContext: ErrorContext = {
      operation: context.operation || 'unknown',
      timestamp: Date.now(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...context,
    };

    const severity = ErrorClassifier.getErrorSeverity(error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    this.logToConsole('error', `[${severity.toUpperCase()}] ${errorMessage}`, {
      error,
      context: errorContext,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // In production, you might want to send this to an external logging service
    if (process.env.NODE_ENV === 'production' && severity === 'critical') {
      // Example: Send to external logging service
      // this.sendToExternalLogger(error, errorContext);
    }
  }

  static logRetry(attempt: number, maxAttempts: number, error: unknown, context: Partial<ErrorContext> = {}) {
    this.logToConsole('warn', `Retry attempt ${attempt}/${maxAttempts} for ${context.operation}`, {
      error: error instanceof Error ? error.message : String(error),
      context,
    });
  }

  static logSuccess(operation: string, duration?: number, context: Partial<ErrorContext> = {}) {
    this.logToConsole('info', `Operation '${operation}' completed successfully${duration ? ` in ${duration}ms` : ''}`, context);
  }
}

// Network error handler with retry logic
export class NetworkErrorHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    context: Partial<ErrorContext> = {}
  ): Promise<T> {
    const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    let lastError: unknown;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        const startTime = Date.now();
        const result = await operation();
        const duration = Date.now() - startTime;
        
        if (attempt > 1) {
          ErrorLogger.logSuccess(context.operation || 'retry-operation', duration, { ...context, attempt });
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt === retryConfig.maxAttempts || !ErrorClassifier.isRetryableError(error, retryConfig)) {
          ErrorLogger.logError(error, { ...context, attempt, maxAttempts: retryConfig.maxAttempts });
          throw error;
        }

        ErrorLogger.logRetry(attempt, retryConfig.maxAttempts, error, context);
        
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffFactor, attempt - 1),
          retryConfig.maxDelay
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  static createFetchWithRetry(config: Partial<RetryConfig> = {}) {
    return async (url: string, options: RequestInit = {}): Promise<Response> => {
      return this.withRetry(
        () => fetch(url, options),
        config,
        {
          operation: `fetch-${options.method || 'GET'}`,
          url,
          method: options.method || 'GET',
        }
      );
    };
  }
}

// User feedback manager
export class UserFeedbackManager {
  private static getErrorMessage(error: unknown): string {
    if (ErrorClassifier.isValidationError(error)) {
      return 'Please check your input and try again.';
    }
    
    if (ErrorClassifier.isAuthenticationError(error)) {
      return 'Please log in to continue.';
    }
    
    if (ErrorClassifier.isNetworkError(error)) {
      const networkError = error as NetworkError;
      if (networkError.status === 429) {
        return 'Too many requests. Please wait a moment and try again.';
      }
      if (networkError.status && networkError.status >= 500) {
        return 'Server error. Please try again later.';
      }
      return 'Network error. Please check your connection and try again.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  }

  static showError(error: unknown, customMessage?: string) {
    const message = customMessage || this.getErrorMessage(error);
    toast.error(message);
    ErrorLogger.logError(error, { operation: 'user-feedback' });
  }

  static showValidationErrors(errors: ValidationErrorDetail[]) {
    if (errors.length === 1) {
      toast.error(errors[0].message);
    } else {
      toast.error(`Please fix ${errors.length} validation errors.`);
    }
    
    ErrorLogger.logError(new Error('Validation failed'), {
      operation: 'validation',
      details: { errors } as Record<string, unknown>,
    });
  }

  static showSuccess(message: string, operation?: string) {
    toast.success(message);
    if (operation) {
      ErrorLogger.logSuccess(operation);
    }
  }

  static showRetryPrompt(error: unknown, onRetry: () => void) {
    const isRetryable = ErrorClassifier.isRetryableError(error);
    
    if (isRetryable) {
      toast.error('Operation failed. Click to retry.', {
        action: {
          label: 'Retry',
          onClick: onRetry,
        },
      });
    } else {
      this.showError(error);
    }
  }
}

// Graceful fallback manager
export class FallbackManager {
  private static fallbackData = new Map<string, { data: unknown; timestamp: number }>();

  static setFallbackData(key: string, data: unknown) {
    this.fallbackData.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  static getFallbackData<T>(key: string, maxAge: number = 5 * 60 * 1000): T | null {
    const cached = this.fallbackData.get(key);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > maxAge) {
      this.fallbackData.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  static withFallback<T>(
    operation: () => Promise<T>,
    fallbackKey: string,
    defaultValue?: T
  ): Promise<T> {
    return operation().catch((error) => {
      ErrorLogger.logError(error, { operation: 'fallback-operation', fallbackKey });
      
      const fallbackData = this.getFallbackData<T>(fallbackKey);
      if (fallbackData) {
        UserFeedbackManager.showError(error, 'Using cached data due to network error.');
        return fallbackData;
      }
      
      if (defaultValue !== undefined) {
        UserFeedbackManager.showError(error, 'Using default data due to error.');
        return defaultValue;
      }
      
      throw error;
    });
  }
}

// Form error handler
export class FormErrorHandler {
  static handleValidationError(error: z.ZodError, setError: (field: string, error: { message: string }) => void) {
    error.issues.forEach((err) => {
      const fieldName = err.path.join('.');
      setError(fieldName, { message: err.message });
    });
    
    UserFeedbackManager.showValidationErrors(
      error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
    );
  }

  static handleApiError(error: unknown, setError?: (field: string, error: { message: string }) => void) {
    if (error instanceof z.ZodError && setError) {
      this.handleValidationError(error, setError);
      return;
    }

    // Handle API validation errors
    if (error instanceof Error) {
      try {
        const apiError: ApiErrorResponse = JSON.parse(error.message);
        if (apiError.details && Array.isArray(apiError.details) && setError) {
          apiError.details.forEach((detail: ValidationErrorDetail) => {
            setError(detail.field, { message: detail.message });
          });
          UserFeedbackManager.showValidationErrors(apiError.details);
          return;
        }
      } catch {
        // Not a JSON error, handle as regular error
      }
    }

    UserFeedbackManager.showError(error);
  }

  static clearErrors(clearErrors: () => void) {
    clearErrors();
    toast.dismiss();
  }
}

// API error parser
export class ApiErrorParser {
  static parseResponse(response: Response): Promise<ApiErrorResponse> {
    return response.json().then((data) => ({
      error: data.error || 'Unknown error',
      details: data.details,
      code: data.code,
      status: response.status,
    }));
  }

  static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await this.parseResponse(response);
      const error = new Error(JSON.stringify(errorData)) as NetworkError;
      error.status = response.status;
      error.code = errorData.code;
      error.retryable = ErrorClassifier.isRetryableError(error);
      throw error;
    }
    
    return response.json();
  }
}

// Enhanced fetch wrapper with comprehensive error handling
export const enhancedFetch = async <T>(
  url: string,
  options: RequestInit = {},
  retryConfig?: Partial<RetryConfig>
): Promise<T> => {
  const fetchWithRetry = NetworkErrorHandler.createFetchWithRetry(retryConfig);
  
  try {
    const response = await fetchWithRetry(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    return await ApiErrorParser.handleResponse<T>(response);
  } catch (error) {
    ErrorLogger.logError(error, {
      operation: 'enhanced-fetch',
      url,
      method: options.method || 'GET',
    });
    throw error;
  }
};

// Utility functions for common error handling patterns
export const withErrorHandling = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context: Partial<ErrorContext> = {}
) => {
  return async (...args: T): Promise<R> => {
    try {
      const startTime = Date.now();
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      
      ErrorLogger.logSuccess(context.operation || 'operation', duration, context);
      return result;
    } catch (error) {
      ErrorLogger.logError(error, context);
      throw error;
    }
  };
};

export const withUserFeedback = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  successMessage?: string,
  errorMessage?: string
) => {
  return async (...args: T): Promise<R> => {
    try {
      const result = await fn(...args);
      if (successMessage) {
        UserFeedbackManager.showSuccess(successMessage);
      }
      return result;
    } catch (error) {
      UserFeedbackManager.showError(error, errorMessage);
      throw error;
    }
  };
};