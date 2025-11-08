'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Edit, 
  MoreHorizontal, 
  Trash2, 
  Eye, 
  Star,
  Search,
  Plus,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import ProductDeleteModal from './product-delete-modal';
import ProductFormModal from './product-form-modal';
import { ValidationErrorsModal } from './validation-errors-modal';
import { ProductWithRelations } from '@/lib/hooks/useProductQueries';
import { useProducts } from '@/lib/hooks/useProducts';
import { useCategories } from '@/lib/hooks/useCategories';

interface ProductsTableProps {
  page: number;
  search: string;
  category: string;
  status: string;
  sort: string;
}

export default function ProductsTable({
  page,
  search,
  category,
  status,
  sort,
}: ProductsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localSearch, setLocalSearch] = useState(search);
  
  // Data fetching
  const { data: productsData, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts({
    page,
    search,
    category: category !== 'all' ? category : '',
    status: status !== 'all' ? status : '',
    sortBy: sort.split('_')[0],
    sortOrder: sort.split('_')[1] as 'asc' | 'desc',
    limit: 20
  });
  
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
    limit: 100
  });
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isValidationErrorsModalOpen, setIsValidationErrorsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null);
  
  // Extract data with fallbacks
  const products = productsData?.products || [];
  const totalProducts = productsData?.pagination?.totalCount || 0;
  const totalPages = productsData?.pagination?.totalPages || 0;
  const currentPage = productsData?.pagination?.page || 1;
  const categories = categoriesData?.categories || [];

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const handleEditProduct = (product: ProductWithRelations) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleDeleteProduct = (product: ProductWithRelations) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsDeleteModalOpen(false);
    setIsFormModalOpen(false);
    setIsValidationErrorsModalOpen(false);
    setEditingProduct(null);
    setSelectedProduct(null);
  };

  const handleDeleteSuccess = () => {
    // Refetch products data when delete is successful
    refetchProducts();
    handleCloseModals();
  };

  const handleFormSuccess = () => {
    // Refetch products data when create/update is successful
    refetchProducts();
    handleCloseModals();
  };

  const handleViewValidationErrors = (product: ProductWithRelations) => {
    setSelectedProduct(product);
    setIsValidationErrorsModalOpen(true);
  };

  const handleSearch = () => {
    updateSearchParams('search', localSearch);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={category} onValueChange={(value) => updateSearchParams('category', value)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={status} onValueChange={(value) => updateSearchParams('status', value)}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="inStock">In Stock</SelectItem>
              <SelectItem value="outOfStock">Out of Stock</SelectItem>
              <SelectItem value="lowStock">Low Stock</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sort} onValueChange={(value) => updateSearchParams('sort', value)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt_desc">Newest First</SelectItem>
              <SelectItem value="createdAt_asc">Oldest First</SelectItem>
              <SelectItem value="name_asc">Name A-Z</SelectItem>
              <SelectItem value="name_desc">Name Z-A</SelectItem>
              <SelectItem value="price_asc">Price Low-High</SelectItem>
              <SelectItem value="price_desc">Price High-Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Sale</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {productsLoading ? (
              // Loading skeleton rows
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-12 w-12 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                </TableRow>
              ))
            ) : productsError ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-8 w-8" />
                    <p>Failed to load products. Please try again.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Search className="h-8 w-8" />
                    <p>No products found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                return (
                  <TableRow key={product.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <Eye className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Link 
                          href={`/admin/products/${product.id}`}
                          className="font-medium hover:underline cursor-pointer"
                        >
                          {product.name}
                        </Link>
                        {product.sku && (
                          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">${product.price.toFixed(2)}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.stockQuantity}</span>
                        <Badge 
                          variant={product.inStock ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {product.inStock ? "In Stock" : "Out"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{product.averageRating?.toFixed(1) || "0.0"}</span>
                        <span className="text-xs text-muted-foreground">({product.reviewCount || 0})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                    <Badge variant={product.featured ? "default" : "secondary"}>
                      {product.featured ? "Featured" : "Regular"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.onSale ? "destructive" : "outline"}>
                      {product.onSale ? "On Sale" : "Regular"}
                    </Badge>
                  </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleEditProduct(product)}
                            className="cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteProduct(product)}
                            className="cursor-pointer text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          Showing {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, totalProducts)} of {totalProducts} products
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage <= 1}
            onClick={() => updateSearchParams('page', (currentPage - 1).toString())}
            className="cursor-pointer"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage >= totalPages}
            onClick={() => updateSearchParams('page', (currentPage + 1).toString())}
            className="cursor-pointer"
          >
            Next
          </Button>
        </div>
      </div>

      <ProductDeleteModal
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModals();
        }}
        onDeleteSuccess={handleDeleteSuccess}
        product={selectedProduct}
      />

      <ProductFormModal
        open={isFormModalOpen}
        onOpenChange={(open: boolean) => {
          if (!open) handleCloseModals();
        }}
        onFormSuccess={handleFormSuccess}
        product={editingProduct}
        mode={editingProduct ? "edit" : "create"}
      />

      <ValidationErrorsModal
        open={isValidationErrorsModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModals();
        }}
        product={selectedProduct}
      />
    </div>
  );
}