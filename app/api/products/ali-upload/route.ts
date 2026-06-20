import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { assertAdminApi } from '@/lib/utils/auth';

// Accepts AliExpress-format CSV with headers: Product Title, Ali Link, Orders, Rating, Category
// Enriches each row by scraping the Ali Link for price, images, description.

type CsvRow = Record<string, string>;

const MAX_ROWS_PER_UPLOAD = 50;

const aliCsvHeaders = {
  title: 'Product Title',
  url: 'Ali Link',
  orders: 'Orders',
  rating: 'Rating',
  category: 'Category',
} as const;

const MappingDefaults = {
  stockQuantity: 0,
  inStock: true,
  isActive: true,
  featured: false,
  isNew: false,
} as const;

const EnrichedRowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  price: z.number().positive(),
  originalPrice: z.number().nonnegative().nullable().optional(),
  onSale: z.boolean().optional().default(false),
  // Allow empty image field for now
  image: z.string().optional().default(''),
  images: z.array(z.string()).optional().default([]),
  categoryName: z.string().min(1),
  stockQuantity: z.number().int().nonnegative().default(MappingDefaults.stockQuantity),
  inStock: z.boolean().default(MappingDefaults.inStock),
  isActive: z.boolean().default(MappingDefaults.isActive),
  featured: z.boolean().default(MappingDefaults.featured),
  isNew: z.boolean().default(MappingDefaults.isNew),
  sku: z.string().optional(),
});

function stripBOM(s: string): string { return s.replace(/^\uFEFF/, ''); }
function normalizeKey(s: string): string { return stripBOM(s).toLowerCase().replace(/\s+/g, ' ').trim(); }

function parseCSV(csvText: string): CsvRow[] {
  const lines = csvText.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;
    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      const key = normalizeKey(h);
      row[key] = (values[idx] ?? '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') { current += '"'; i += 2; }
      else { inQuotes = !inQuotes; i++; }
    } else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; i++; }
    else { current += char; i++; }
  }
  result.push(current.trim());
  return result;
}

function generateSku(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${slug}-${rand}`.slice(0, 32);
}

async function lookupRefs(categoryName: string) {
  const category = await prisma.category.findFirst({ where: { name: { equals: categoryName, mode: 'insensitive' } } });
  return { category };
}

// For now, we do not scrape. We rely on CSV data and safe defaults.
async function scrapeAliExpress(_url: string): Promise<{ name?: string; price?: number; originalPrice?: number | null; onSale?: boolean; description?: string; images?: string[]; image?: string; }> {
  return {};
}

export async function POST(req: NextRequest) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const categoryFallback = (formData.get('categoryName') as string | null) || '';
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    const csvText = await file.text();
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'No valid data found in CSV file' }, { status: 400 });
    }
    if (rows.length > MAX_ROWS_PER_UPLOAD) {
      return NextResponse.json({ success: false, message: `Too many rows. Maximum ${MAX_ROWS_PER_UPLOAD} allowed. Your file contains ${rows.length}.` }, { status: 400 });
    }

    const result = {
      success: true,
      message: '',
      totalRows: rows.length,
      successfulRows: 0,
      failedRows: 0,
      skippedRows: 0,
      skippedProducts: [] as Array<{ row: number; sku: string; name: string; reason: string }>,
      errors: [] as Array<{ row: number; field: string; message: string }>,
    };

    // Normalized header keys
    const titleKey = normalizeKey(aliCsvHeaders.title);
    const urlKey = normalizeKey(aliCsvHeaders.url);
    const categoryKey = normalizeKey(aliCsvHeaders.category);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // header + 1-based
      try {
        const rawName = (row[titleKey] || '').trim();
        const url = (row[urlKey] || '').trim();
        const rawCategory = (row[categoryKey] || '').trim();
        if (!rawName || !url) {
          result.errors.push({ row: rowNumber, field: 'row', message: 'Missing Product Title or Ali Link' });
          result.failedRows++; continue;
        }

        // Use CSV title as name; leave images empty per request
        const scraped = await scrapeAliExpress(url);
        const name = rawName.trim();
        const price = typeof scraped.price === 'number' && scraped.price > 0 ? scraped.price : 0.01;
        const originalPrice = null;
        const onSale = false;
        const image = '';
        const images: string[] = [];
        const description = '';

        // Map incoming categories like "baby items" to an existing category name
        const normalizedCategory = (rawCategory || '').toLowerCase();
        const mappedCategoryName = normalizedCategory === 'baby items' ? 'Fashion & Clothing' : (rawCategory || 'Fashion & Clothing');
        const categoryName = (mappedCategoryName || categoryFallback || 'Fashion & Clothing').trim();

        const enriched = EnrichedRowSchema.parse({
          name,
          description,
          price,
          originalPrice,
          onSale,
          image,
          images,
          categoryName,
          stockQuantity: MappingDefaults.stockQuantity,
          inStock: MappingDefaults.inStock,
          isActive: MappingDefaults.isActive,
          featured: MappingDefaults.featured,
          isNew: MappingDefaults.isNew,
          sku: generateSku(name),
        });

        const refs = await lookupRefs(enriched.categoryName);
        // Fallback to known IDs if names are not present, to avoid Invalid Product entries
        const categoryId = refs.category?.id || 'cat-electronics';

        // Create valid product
        await prisma.product.create({
          data: {
            name: enriched.name,
            description: enriched.description || '',
            price: enriched.price,
            originalPrice: enriched.originalPrice ?? null,
            categoryId,
            image: enriched.image,
            images: enriched.images,
            stockQuantity: enriched.stockQuantity,
            inStock: enriched.inStock,
            sku: enriched.sku,
            featured: enriched.featured,
            isNew: enriched.isNew,
            onSale: enriched.onSale,
            rating: 0,
            averageRating: 0,
            reviewCount: 0,
            isValid: true,
            isActive: enriched.isActive,
          },
        });

        // Update category count
        await prisma.category.update({
          where: { id: categoryId },
          data: { productsCount: { increment: 1 } },
        });

        result.successfulRows++;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        result.errors.push({ row: rowNumber, field: 'general', message });
        result.failedRows++;
      }
    }

    result.success = result.failedRows === 0;
    result.message = `Uploaded ${result.successfulRows} products${result.failedRows ? `, ${result.failedRows} errors` : ''}`;
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


