'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Upload } from 'lucide-react';
import ProductsTable from './_components/products-table';
import ProductsTableSkeleton from './_components/products-table-skeleton';
import ProductsStats from './_components/products-stats';
import ProductFormModal from './_components/product-form-modal';
import CsvUploadModal from './_components/csv-upload-modal';

function AdminProductsContent() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCsvUploadModalOpen, setIsCsvUploadModalOpen] = useState(false);
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || 'createdAt_desc';

  const handleAddProduct = () => {
    setIsAddModalOpen(true);
  };

  const handleCsvUpload = () => {
    setIsCsvUploadModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleCsvUpload}
            className="cursor-pointer"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
          <Button onClick={handleAddProduct} className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <Suspense fallback={<ProductsStatsSkeleton />}>
        <ProductsStats />
      </Suspense>

      {/* Products Table */}
      <Card>
        <CardContent>
          <Suspense fallback={<ProductsTableSkeleton />}>
            <ProductsTable
              page={page}
              search={search}
              category={category}
              status={status}
              sort={sort}
            />
          </Suspense>
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <ProductFormModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        mode="create"
      />

      {/* CSV Upload Modal */}
      <CsvUploadModal
        open={isCsvUploadModalOpen}
        onOpenChange={setIsCsvUploadModalOpen}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsTableSkeleton />}>
      <AdminProductsContent />
    </Suspense>
  );
}

// Skeleton for products stats
function ProductsStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </CardTitle>
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            <p className="text-xs text-muted-foreground mt-1">
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
