'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit } from 'lucide-react';
import { useProduct } from '@/lib/hooks/useProductQueries';
import ProductFormModal from '../_components/product-form-modal';
import { useState } from 'react';

export default function AdminProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { data: product, isLoading, error } = useProduct(productId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleBack = () => router.push('/admin/products');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBack} className="cursor-pointer">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="w-full h-64 rounded" />
            <div className="md:col-span-2 space-y-3">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBack} className="cursor-pointer">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Product not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">We couldn&apos;t find this product. It may have been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack} className="cursor-pointer">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Button>
        <Button onClick={() => setIsEditModalOpen(true)} className="cursor-pointer">
          <Edit className="h-4 w-4 mr-2" /> Edit Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {product.name}
            <Badge variant={product.isActive ? 'default' : 'secondary'}>
              {product.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative w-full h-64 rounded overflow-hidden bg-muted">
            {product.images && product.images.length > 0 ? (
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
            ) : product.image ? (
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
            )}
          </div>
          <div className="md:col-span-2 space-y-3">
            <div className="text-2xl font-semibold">${product.price.toFixed(2)}</div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </div>
            )}
            <div className="text-sm text-muted-foreground">SKU: {product.sku || 'N/A'}</div>
            <div className="text-sm text-muted-foreground">Stock: {product.stockQuantity} ({product.inStock ? 'In Stock' : 'Out'})</div>
            <div className="prose prose-sm max-w-none">
              {product.description || 'No description provided.'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <ProductFormModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onFormSuccess={() => setIsEditModalOpen(false)}
        product={product}
        mode="edit"
      />
    </div>
  );
}


