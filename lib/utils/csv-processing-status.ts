// Shared utilities for CSV row processing status tracking and reporting

export interface UploadMetrics {
  batchesProcessed: number;
  batchSize: number;
  estimatedQueriesBefore: number;
  actualQueries: number;
  processingTimeMs: number;
  errorsPerBatch: number[];
}

export interface UploadResult {
  success: boolean;
  message?: string;
  error?: string;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  skippedRows: number;
  skippedProducts: Array<{
    row: number;
    sku: string;
    name: string;
    reason: string;
  }>;
  errors?: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  metrics?: UploadMetrics;
}

export interface RowProcessingStatus {
  total: number;
  success: number;
  skipped: number;
  failed: number;
}

export interface RowStatusReport {
  totals: RowProcessingStatus;
  failedRows: number[];
  skippedRows: number[];
  successRows: number[];
}

export interface UploadErrorLike {
  message?: string;
  error?: string;
  errors?: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

export const extractErrorMessage = (result: Partial<UploadResult> | UploadErrorLike): string => {
  const base = result?.message || result?.error;
  if (base) return String(base);
  if (Array.isArray(result?.errors) && result.errors.length > 0) {
    const first = result.errors[0];
    return `Row ${first.row}: ${first.field} - ${first.message}`;
  }
  return 'Upload failed';
};

// Robust CSV row splitter to count rows client-side for error stats
export const splitCsvRowsClient = (csvText: string): string[] => {
  const text = csvText.replace(/^\uFEFF/, '');
  const rows: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '""';
        i += 2;
        continue;
      } else {
        inQuotes = !inQuotes;
        current += char;
        i++;
        continue;
      }
    }
    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      rows.push(current);
      current = '';
      i++;
      continue;
    }
    current += char;
    i++;
  }
  if (current.trim().length > 0) rows.push(current);
  return rows;
};

export const computeCsvRowCount = async (file: File): Promise<number> => {
  const text = await file.text();
  const lines = splitCsvRowsClient(text).filter(l => l.trim());
  // subtract header
  return Math.max(lines.length - 1, 0);
};

// Derive accurate totals from result payload, falling back to arrays if needed
export const computedTotals = (res: UploadResult | null): RowProcessingStatus => {
  if (!res) return { total: 0, success: 0, skipped: 0, failed: 0 };
  const failed = typeof res.failedRows === 'number' ? Number(res.failedRows) : Number(res.errors?.length || 0);
  const skipped = typeof res.skippedRows === 'number' ? Number(res.skippedRows) : Number(res.skippedProducts?.length || 0);
  const total = typeof res.totalRows === 'number'
    ? Number(res.totalRows)
    : Number((typeof res.successfulRows === 'number' ? res.successfulRows : 0) + failed + skipped);
  const success = typeof res.successfulRows === 'number'
    ? Number(res.successfulRows)
    : Math.max(total - failed - skipped, 0);
  return { total, success, skipped, failed };
};

// Build a detailed report of per-row statuses
export const deriveRowStatusReport = (res: UploadResult): RowStatusReport => {
  const totals = computedTotals(res);
  const failedRows = (res.errors || []).map(e => e.row).filter(n => Number.isFinite(n));
  const skippedRows = (res.skippedProducts || []).map(s => s.row).filter(n => Number.isFinite(n));
  const known = new Set<number>([...failedRows, ...skippedRows]);
  const successRows: number[] = [];
  if (Number.isFinite(totals.total) && totals.total > 0) {
    for (let r = 1; r <= totals.total; r++) {
      if (!known.has(r)) successRows.push(r);
    }
  }
  return { totals, failedRows, skippedRows, successRows };
};

// Normalize/complete counts on an UploadResult using client information when available
export const normalizeUploadResult = async (
  result: UploadResult,
  opts: { file?: File; csvText?: string } = {}
): Promise<UploadResult> => {
  let total = typeof result.totalRows === 'number' ? result.totalRows : 0;
  if (!total) {
    if (opts.file) {
      total = await computeCsvRowCount(opts.file);
    } else if (opts.csvText) {
      const lines = splitCsvRowsClient(opts.csvText).filter(l => l.trim());
      total = Math.max(lines.length - 1, 0);
    }
  }

  const failed = typeof result.failedRows === 'number' ? result.failedRows : Number(result.errors?.length || 0);
  const skipped = typeof result.skippedRows === 'number' ? result.skippedRows : Number(result.skippedProducts?.length || 0);
  const success = typeof result.successfulRows === 'number' ? result.successfulRows : Math.max(total - failed - skipped, 0);

  return {
    ...result,
    totalRows: total,
    failedRows: failed,
    skippedRows: skipped,
    successfulRows: success,
  };
};