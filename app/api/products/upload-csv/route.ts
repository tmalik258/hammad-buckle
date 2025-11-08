import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { productFormSchema } from '@/lib/validations/product-schema';
import { z } from 'zod';

// CSV row validation schema (rating fields removed from CSV processing)
const csvRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  originalPrice: z.coerce.number().min(0).optional().nullable().transform(val => 
    val === 0 || String(val) === '' || val === null || val === undefined ? null : val
  ),
  categoryName: z.string().min(1, 'Category name is required'),
  typeName: z.string().min(1, 'Type name is required'),
  occasionName: z.string().min(1, 'Occasion name is required'),
  image: z.url('Image must be a valid URL'),
  // Accept images separated by comma, semicolon, or pipe
  images: z.string().optional().transform(val => 
    val ? val.split(/[,;|]/).map(img => img.trim()).filter(Boolean) : []
  ),
  stockQuantity: z.coerce.number().int().min(0, 'Stock quantity must be non-negative'),
  // Accept case-insensitive and common representations for booleans
  inStock: z.preprocess((val) => parseBooleanAny(val, true), z.boolean().optional().default(true)),
  sku: z.string().optional(),
  weight: z.coerce.number().min(0).optional().nullable(),
  dimensions: z.string().optional(),
  featured: z.preprocess((val) => parseBooleanAny(val, false), z.boolean().optional().default(false)),
  isNew: z.preprocess((val) => parseBooleanAny(val, false), z.boolean().optional().default(false)),
  onSale: z.preprocess((val) => parseBooleanAny(val, false), z.boolean().optional().default(false)),
  isActive: z.preprocess((val) => parseBooleanAny(val, true), z.boolean().optional().default(true)),
});

// Maximum rows allowed per upload
const MAX_ROWS_PER_UPLOAD = 5000;
const BATCH_SIZE = 50;

interface CsvRow {
  [key: string]: string;
}

interface UploadMetrics {
  batchesProcessed: number;
  batchSize: number;
  estimatedQueriesBefore: number;
  actualQueries: number;
  processingTimeMs: number;
  errorsPerBatch: number[];
}

interface UploadResult {
  success: boolean;
  message: string;
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
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  metrics?: UploadMetrics;
}

// Helper: robust boolean parser (true/false, yes/no, 1/0, case-insensitive)
function parseBooleanAny(val: unknown, defaultVal: boolean): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    if (['true', 't', 'yes', 'y', '1'].includes(s)) return true;
    if (['false', 'f', 'no', 'n', '0'].includes(s)) return false;
  }
  return defaultVal;
}

// Helper: strip BOM and normalize keys
function stripBOM(s: string): string { return s.replace(/^\uFEFF/, ''); }
function normalizeKey(s: string): string { return stripBOM(s).toLowerCase().replace(/\s+/g, ''); }

// Map normalized header keys to canonical keys used by the validator
const CanonicalHeaderMap: Record<string, string> = {
  name: 'name',
  description: 'description',
  price: 'price',
  originalprice: 'originalPrice',
  categoryname: 'categoryName',
  typename: 'typeName',
  occasionname: 'occasionName',
  image: 'image',
  images: 'images',
  stockquantity: 'stockQuantity',
  instock: 'inStock',
  sku: 'sku',
  weight: 'weight',
  dimensions: 'dimensions',
  featured: 'featured',
  isnew: 'isNew',
  onsale: 'onSale',
  isactive: 'isActive',
};

// Detect delimiter from header line (comma, semicolon, or tab)
function detectDelimiter(headerLine: string): string {
  const comma = (headerLine.match(/,/g) || []).length;
  const semicolon = (headerLine.match(/;/g) || []).length;
  const tab = (headerLine.match(/\t/g) || []).length;
  if (semicolon > comma && semicolon >= tab) return ';';
  if (tab > comma && tab >= semicolon) return '\t';
  return ',';
}

// Split CSV text into rows, respecting quoted newlines
function splitCSVRows(csvText: string): string[] {
  const text = stripBOM(csvText);
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
}

function parseCSV(csvText: string): CsvRow[] {
  const lines = splitCSVRows(csvText).filter(line => line.trim());
  if (lines.length < 2) return [];

  // Parse CSV header with auto-detected delimiter and canonicalize keys
  const delimiter = detectDelimiter(lines[0]);
  const rawHeaders = parseCSVLine(lines[0], delimiter);
  const headers = rawHeaders.map(h => CanonicalHeaderMap[normalizeKey(h)] || stripBOM(h).trim());

  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter);
    if (values.length !== rawHeaders.length) {
      console.log(`Row ${i + 1}: Expected ${rawHeaders.length} columns, got ${values.length}`);
      continue;
    }

    const row: CsvRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

// Proper CSV line parser that handles quoted fields with commas/semicolons/tabs
function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 2;
      } else {
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  result.push(current.trim());

  return result;
}

// Convert names to IDs and validate references exist in database
async function convertNamesToIds(categoryName: string, typeName: string, occasionName: string) {
  console.log(`Looking up: Category='${categoryName}', Type='${typeName}', Occasion='${occasionName}'`);
  
  const [category, type, occasion] = await Promise.all([
    prisma.category.findFirst({ where: { name: { equals: categoryName, mode: 'insensitive' } } }),
    prisma.type.findFirst({ where: { name: { equals: typeName, mode: 'insensitive' } } }),
    prisma.occasion.findFirst({ where: { name: { equals: occasionName, mode: 'insensitive' } } })
  ]);

  console.log(`Found: Category=${category?.name || 'null'}, Type=${type?.name || 'null'}, Occasion=${occasion?.name || 'null'}`);

  const errors: string[] = [];
  if (!category) errors.push(`Category with name '${categoryName}' not found`);
  if (!type) errors.push(`Type with name '${typeName}' not found`);
  if (!occasion) errors.push(`Occasion with name '${occasionName}' not found`);

  return { 
    isValid: errors.length === 0, 
    errors,
    categoryId: category?.id,
    typeId: type?.id,
    occasionId: occasion?.id
  };
}

async function checkSkuExists(sku: string | undefined): Promise<boolean> {
  if (!sku) return false;
  
  const existingProduct = await prisma.product.findFirst({
    where: { sku: sku },
    select: { id: true }
  });
  
  return !!existingProduct;
}

export async function POST(request: NextRequest) {
  try {
    const startedAt = Date.now();
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Determine dynamic batch size from form data or query string, fallback to constant
    const batchsizeFormValue = formData.get('batchsize');
    const batchsizeQueryValue = request.nextUrl?.searchParams?.get('batchsize') ?? null;
    const batchSizeCandidate = batchsizeFormValue ?? batchsizeQueryValue;
    let batchSize = BATCH_SIZE;
    if (batchSizeCandidate !== null && batchSizeCandidate !== undefined) {
      const n = Number(batchSizeCandidate);
      if (!Number.isNaN(n) && n > 0) {
        batchSize = Math.min(Math.max(1, Math.floor(n)), MAX_ROWS_PER_UPLOAD);
      }
    }

    const csvText = await file.text();
    const csvRows = parseCSV(csvText);

    if (csvRows.length === 0) {
      return NextResponse.json(
        { error: 'No valid data found in CSV file' },
        { status: 400 }
      );
    }

    // Check row limit
    if (csvRows.length > MAX_ROWS_PER_UPLOAD) {
      return NextResponse.json(
        {
          error: `Too many rows. Maximum ${MAX_ROWS_PER_UPLOAD} rows allowed per upload. Your file contains ${csvRows.length} rows.`
        },
        { status: 400 }
      );
    }

    const result: UploadResult = {
      success: true,
      message: '',
      totalRows: csvRows.length,
      successfulRows: 0,
      failedRows: 0,
      skippedRows: 0,
      skippedProducts: [],
      errors: [],
      metrics: {
        batchesProcessed: 0,
        batchSize,
        estimatedQueriesBefore: csvRows.length * 6,
        actualQueries: 0,
        processingTimeMs: 0,
        errorsPerBatch: [],
      },
    };

    // Detect duplicate SKUs in the CSV file
    const seenSkusInFile = new Set<string>();
    const duplicateIndexSet = new Set<number>();
    for (let i = 0; i < csvRows.length; i++) {
      const sku = (csvRows[i].sku || '').trim();
      if (!sku) continue;
      if (seenSkusInFile.has(sku)) {
        duplicateIndexSet.add(i);
      } else {
        seenSkusInFile.add(sku);
      }
    }
    // Add errors for duplicate SKUs within the file
    for (const idx of Array.from(duplicateIndexSet)) {
      result.errors.push({
        row: idx + 2, // +2 because CSV has header and 0-based index
        field: 'sku',
        message: 'Duplicate SKU found within the CSV file',
      });
    }

    // Prefetch category/type/occasion maps once
    const [categories, types, occasions] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.type.findMany({ select: { id: true, name: true } }),
      prisma.occasion.findMany({ select: { id: true, name: true } }),
    ]);
    result.metrics!.actualQueries += 3;
    const normalizeName = (s: string) => s.trim().toLowerCase();
    const catMap = new Map<string, string>();
    for (const c of categories) catMap.set(normalizeName(c.name), c.id);
    const typeMap = new Map<string, string>();
    for (const t of types) typeMap.set(normalizeName(t.name), t.id);
    const occMap = new Map<string, string>();
    for (const o of occasions) occMap.set(normalizeName(o.name), o.id);

    // Prefetch existing SKUs for the CSV rows in chunks of batchSize
    const uniqueCsvSkus = Array.from(seenSkusInFile);
    const existingSkus = new Set<string>();
    for (let i = 0; i < uniqueCsvSkus.length; i += batchSize) {
      const chunk = uniqueCsvSkus.slice(i, i + batchSize);
      if (chunk.length === 0) continue;
      const recs = await prisma.product.findMany({ where: { sku: { in: chunk } }, select: { sku: true } });
      result.metrics!.actualQueries += 1;
      for (const r of recs) if (r.sku) existingSkus.add(r.sku);
    }

    // Track category product count increments
    const categoryIncrementMap = new Map<string, number>();

    // Process rows in batches controlled by batchSize
    for (let start = 0; start < csvRows.length; start += batchSize) {
      const batch = csvRows.slice(start, start + batchSize);
      const validRecords: Prisma.ProductCreateManyInput[] = [];
      const invalidRecords: Prisma.ProductUncheckedCreateInput[] = [];

      const beforeErrors = result.errors.length;

      for (let i = 0; i < batch.length; i++) {
        const absoluteIndex = start + i;
        const rowNumber = absoluteIndex + 2; // +2 for header line
        const row = batch[i];

        // Skip if this row has a duplicate SKU within the file
        if (duplicateIndexSet.has(absoluteIndex)) {
          result.failedRows++;
          continue;
        }

        try {
          // Validate the row data
          const validatedData = csvRowSchema.parse(row);

          // Check if SKU already exists in database (prefetched)
          const sku = validatedData.sku?.trim();
          if (sku && existingSkus.has(sku)) {
            result.skippedRows++;
            result.skippedProducts.push({
              row: rowNumber,
              sku,
              name: validatedData.name,
              reason: 'SKU already exists in database'
            });
            continue;
          }

          // Convert names to IDs using maps and validate references
          const categoryId = catMap.get(normalizeName(validatedData.categoryName));
          const typeId = typeMap.get(normalizeName(validatedData.typeName));
          const occasionId = occMap.get(normalizeName(validatedData.occasionName));

          const missingRefs: string[] = [];
          if (!categoryId) missingRefs.push(`Category with name '${validatedData.categoryName}' not found`);
          if (!typeId) missingRefs.push(`Type with name '${validatedData.typeName}' not found`);
          if (!occasionId) missingRefs.push(`Occasion with name '${validatedData.occasionName}' not found`);

          if (missingRefs.length > 0) {
            // Prepare invalid record to insert individually
            const validationErrors = {
              errors: missingRefs.map(error => ({ field: 'references', message: error })),
              rowData: row,
            };

            invalidRecords.push({
              name: validatedData.name || 'Invalid Product',
              description: validatedData.description || '',
              price: Math.max(validatedData.price || 0, 0.01),
              originalPrice: validatedData.originalPrice,
              categoryId: categoryId || null,
              typeId: typeId || null,
              occasionId: occasionId || null,
              image: validatedData.image || '',
              images: validatedData.images || [],
              stockQuantity: validatedData.stockQuantity || 0,
              inStock: validatedData.inStock ?? true,
              sku: validatedData.sku,
              weight: validatedData.weight,
              dimensions: validatedData.dimensions,
              featured: validatedData.featured ?? false,
              isNew: validatedData.isNew ?? false,
              onSale: validatedData.onSale ?? false,
              rating: 0,
              averageRating: 0,
              reviewCount: 0,
              isValid: false,
              isActive: false,
              validationErrors,
            });

            for (const error of missingRefs) {
              result.errors.push({ row: rowNumber, field: 'references', message: error });
            }
            continue;
          }

          // Validate the full product using product form schema
          const productValidation = productFormSchema.safeParse({
            ...validatedData,
            categoryId,
            typeId,
            occasionId,
          });
          if (!productValidation.success) {
            for (const issue of productValidation.error.issues) {
              result.errors.push({ row: rowNumber, field: issue.path.join('.'), message: issue.message });
            }
            result.failedRows++;
            continue;
          }

          // Prepare valid record for batch insertion
          validRecords.push({
            name: validatedData.name,
            description: validatedData.description || '',
            price: validatedData.price,
            originalPrice: validatedData.originalPrice,
            categoryId,
            typeId,
            occasionId,
            image: validatedData.image,
            images: validatedData.images,
            stockQuantity: validatedData.stockQuantity || 0,
            inStock: validatedData.inStock ?? true,
            sku: validatedData.sku,
            weight: validatedData.weight,
            dimensions: validatedData.dimensions,
            featured: validatedData.featured ?? false,
            isNew: validatedData.isNew ?? false,
            onSale: validatedData.onSale ?? false,
            rating: 0,
            averageRating: 0,
            reviewCount: 0,
            isValid: true,
            isActive: validatedData.isActive ?? true,
            validationErrors: undefined,
          });

          // Aggregate category count
          if (categoryId) {
            categoryIncrementMap.set(categoryId, (categoryIncrementMap.get(categoryId) || 0) + 1);
          }
        } catch (error) {
          // Validation or general parse error handling
          if (error instanceof z.ZodError) {
            for (const issue of error.issues) {
              result.errors.push({ row: rowNumber, field: issue.path.join('.'), message: issue.message });
            }
          } else {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            result.errors.push({ row: rowNumber, field: 'general', message: errorMessage });
          }

          // Create invalid record payload mirroring legacy behavior
          invalidRecords.push({
            name: row.name || 'Invalid Product',
            description: row.description || '',
            price: Math.max(parseFloat(row.price) || 0, 0.01),
            originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
            categoryId: 'cat-electronics', // Default fallback category
            typeId: 'type-standard', // Default fallback type
            occasionId: 'occasion-everyday', // Default fallback occasion
            image: row.image || '',
            images: row.images ? row.images.split(',').map((img: string) => img.trim()) : [],
            stockQuantity: parseInt(row.stockQuantity) || 0,
            inStock: row.inStock === 'true',
            sku: row.sku,
            weight: row.weight ? parseFloat(row.weight) : null,
            dimensions: row.dimensions || null,
            featured: row.featured === 'true',
            isNew: row.isNew === 'true',
            onSale: row.onSale === 'true',
            rating: 0,
            averageRating: 0,
            reviewCount: 0,
            isValid: false,
            isActive: false,
            validationErrors: { rowData: row },
          });
        }
      }

      // Insert valid records in batch, fall back to per-row if needed
      if (validRecords.length > 0) {
        try {
          const createRes = await prisma.product.createMany({
            data: validRecords,
            skipDuplicates: true,
          });
          result.metrics!.actualQueries += 1;
          result.successfulRows += createRes.count;
        } catch (err) {
          // Per-row fallback when batch insert fails
          for (const rec of validRecords) {
            try {
              await prisma.product.create({ data: rec as Prisma.ProductUncheckedCreateInput });
              result.successfulRows++;
              result.metrics!.actualQueries += 1;
            } catch (innerErr) {
              result.failedRows++;
              const msg = innerErr instanceof Error ? innerErr.message : 'Unknown error in batch fallback';
              result.errors.push({ row: 0, field: 'general', message: msg });
            }
          }
        }
      }

      // Insert invalid records individually (legacy behavior)
      for (const rec of invalidRecords) {
        try {
          await prisma.product.create({ data: rec });
          result.successfulRows++; // Still count as processed
          result.metrics!.actualQueries += 1;
        } catch (innerErr) {
          result.failedRows++;
          const msg = innerErr instanceof Error ? innerErr.message : 'Unknown error inserting invalid record';
          result.errors.push({ row: 0, field: 'general', message: msg });
        }
      }

      const batchErrors = result.errors.length - beforeErrors;
      result.metrics!.errorsPerBatch.push(batchErrors);
      result.metrics!.batchesProcessed++;
    }

    // Update category product counts in chunks of batchSize
    const categoryEntries = Array.from(categoryIncrementMap.entries());
    for (let i = 0; i < categoryEntries.length; i += batchSize) {
      const chunk = categoryEntries.slice(i, i + batchSize);
      await Promise.all(
        chunk.map(([catId, count]) =>
          prisma.category.update({ where: { id: catId }, data: { productsCount: { increment: count } } })
        )
      );
      result.metrics!.actualQueries += chunk.length;
    }

    // Determine overall success and build message
    result.success = result.failedRows === 0;
    let message = `Uploaded ${result.successfulRows} products`;
    if (result.skippedRows > 0) {
      message += `, skipped ${result.skippedRows} products (already exist)`;
    }
    if (result.failedRows > 0) {
      message += `, ${result.failedRows} errors`;
    }
    result.message = message;

    result.metrics!.processingTimeMs = Date.now() - startedAt;

    return NextResponse.json(result);
  } catch (error) {
    console.error('CSV upload error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        totalRows: 0,
        successfulRows: 0,
        failedRows: 0,
        skippedRows: 0,
        skippedProducts: [],
        errors: [],
      },
      { status: 500 }
    );
  }
}
