'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Download, FileText, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CsvUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

import { UploadResult, extractErrorMessage, computeCsvRowCount, computedTotals, normalizeUploadResult } from '@/lib/utils/csv-processing-status';

interface ReferenceData {
  categories: Array<{ id: string; name: string }>;
  types: Array<{ id: string; name: string }>;
  occasions: Array<{ id: string; name: string }>;
}

export default function CsvUploadModal({ open, onOpenChange }: CsvUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null);
  const [isLoadingReference, setIsLoadingReference] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: false,
    types: false,
    occasions: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch reference data when modal opens
  useEffect(() => {
    if (open && !referenceData) {
      setIsLoadingReference(true);
      fetch('/api/products/csv-reference')
        .then(res => res.json())
        .then(data => {
          setReferenceData(data);
          setIsLoadingReference(false);
        })
        .catch(err => {
          console.error('Failed to fetch reference data:', err);
          setIsLoadingReference(false);
        });
    }
  }, [open, referenceData]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setUploadResult(null);
      } else {
        toast.error('Please select a valid CSV file');
      }
    }
  };





  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/products/upload-csv', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      let result: UploadResult | null = null;
      try {
        result = await response.json();
      } catch (e) {
        // Non-JSON response
        result = {
          success: false,
          message: 'Upload failed',
          totalRows: 0,
          successfulRows: 0,
          failedRows: 0,
          skippedRows: 0,
          skippedProducts: [],
        };
      }

      if (response.ok) {
        setUploadResult(result);
        toast.success(`Successfully uploaded ${result?.successfulRows} products`);
      } else {
        try {
          result = await normalizeUploadResult(result as UploadResult, { file });
        } catch {}
        setUploadResult(result);
        const msg = extractErrorMessage(result ?? { message: 'Upload failed' });
        toast.error(msg);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      // Cleanup progress state to ensure UI reset
      setTimeout(() => setUploadProgress(0), 250);
    }
  };

  const handleDownloadTemplate = () => {
    if (!referenceData) {
      toast.error('Reference data not loaded yet');
      return;
    }

    const csvContent = `name,description,price,originalPrice,categoryName,typeName,occasionName,image,images,stockQuantity,inStock,sku,weight,dimensions,featured,isNew,onSale,isActive\n"Wireless Bluetooth Headphones","High-quality wireless headphones with noise cancellation and 30-hour battery life",199.99,249.99,"Electronics","Premium","Everyday Use","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400,https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",50,true,"WBH-001",0.5,"20x15x8 cm",true,true,true,true\n"Smart Fitness Watch","Advanced fitness tracker with heart rate monitor and GPS",299.99,,"Electronics","Smart","Fitness & Sports","https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400","https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400,https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",25,true,"SFW-002",0.08,"4x4x1.2 cm",true,true,false,true\n"Organic Cotton T-Shirt","Comfortable organic cotton t-shirt in various colors",29.99,39.99,"Fashion & Clothing","Eco-Friendly","Everyday Use","https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400","https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400,https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400",100,true,"OCT-003",0.2,"S/M/L/XL",false,false,true,true\n"Professional Laptop Bag","Durable laptop bag with multiple compartments",89.99,,"Fashion & Clothing","Professional","Work & Office","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",30,true,"PLB-004",1.2,"45x35x15 cm",false,false,false,true\n"Smart Home Speaker","Voice-controlled smart speaker with built-in assistant",129.99,179.99,"Electronics","Smart","Home & Personal","https://images.unsplash.com/photo-1543512214-318c7553f230?w=400","https://images.unsplash.com/photo-1543512214-318c7553f230?w=400",40,true,"SHS-005",1.8,"18x18x12 cm",true,false,true,true\n"Yoga Mat Premium","Non-slip yoga mat made from eco-friendly materials",49.99,,"Sports & Outdoors","Eco-Friendly","Fitness & Sports","https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400","https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",60,true,"YMP-006",2.5,"183x61x0.6 cm",false,true,false,true`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const toggleSection = (section: 'categories' | 'types' | 'occasions') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleClose = () => {
    setFile(null);
    setUploadResult(null);
    setUploadProgress(0);
    setIsLoadingReference(false);
    setExpandedSections({
      categories: false,
      types: false,
      occasions: false
    });
    onOpenChange(false);
  };

  const computedMessage = (res: UploadResult | null): string => {
    if (!res) return '';
    return res.message || res.error || '';
  };



  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Products via CSV
          </DialogTitle>
          <DialogDescription>
            Upload multiple products at once using a CSV file. Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">CSV Template</span>
            </div>
            {isLoadingReference ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                disabled={!referenceData}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select CSV File</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-20 border-dashed"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6" />
                <span>{file ? file.name : 'Click to select CSV file'}</span>
              </div>
            </Button>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className="space-y-3">
              {uploadResult.success ? (
                <Alert className="border-green-200 bg-green-50">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="font-medium">
                      {computedMessage(uploadResult)}
                    </AlertDescription>
                  </div>
                </Alert>
              ) : (
                <div className="w-full flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 font-medium break-words">{computedMessage(uploadResult)}</span>
                </div>
              )}

              {(() => {
                const stats = computedTotals(uploadResult);
                return (
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-white">{stats.total}</div>
                      <div className="text-sm text-muted-foreground">Total Rows</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-white">{stats.success}</div>
                      <div className="text-sm text-muted-foreground">Successful</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-orange-600">{stats.skipped}</div>
                      <div className="text-sm text-muted-foreground">Skipped</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                  </div>
                );
              })()}

              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-600">Errors:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {uploadResult.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        Row {error.row}: {error.field} - {error.message}
                      </div>
                    ))}
                    {uploadResult.errors.length > 10 && (
                      <div className="text-xs text-muted-foreground">
                        ... and {uploadResult.errors.length - 10} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}

              {uploadResult.skippedProducts && uploadResult.skippedProducts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-orange-600">Skipped Products:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {uploadResult.skippedProducts.slice(0, 10).map((product, index) => (
                      <div key={index} className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                        Row {product.row}: {product.name} (SKU: {product.sku}) - {product.reason}
                      </div>
                    ))}
                    {uploadResult.skippedProducts.length > 10 && (
                      <div className="text-xs text-muted-foreground">
                        ... and {uploadResult.skippedProducts.length - 10} more skipped products
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Field Reference */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Acceptable Fields:</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <Badge variant="secondary">name</Badge>
              <Badge variant="secondary">price</Badge>
              <Badge variant="secondary">categoryName</Badge>
              <Badge variant="secondary">typeName</Badge>
              <Badge variant="secondary">occasionName</Badge>
              <Badge variant="secondary">image</Badge>
              <Badge variant="outline">description</Badge>
              <Badge variant="outline">originalPrice</Badge>
              <Badge variant="outline">stockQuantity</Badge>
              <Badge variant="outline">inStock</Badge>
              <Badge variant="outline">sku</Badge>
              <Badge variant="outline">weight</Badge>
              <Badge variant="outline">dimensions</Badge>
              <Badge variant="outline">featured</Badge>
              <Badge variant="outline">isNew</Badge>
              <Badge variant="outline">onSale</Badge>
              <Badge variant="outline">isActive</Badge>
            </div>

            {/* Reference Data */}
            {isLoadingReference ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-64" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <div className="space-y-1">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-28" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <div className="space-y-1">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-18" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <div className="space-y-1">
                      <Skeleton className="h-6 w-22" />
                      <Skeleton className="h-6 w-28" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ) : referenceData ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Available Values (use these in your CSV):</h4>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="font-medium text-muted-foreground mb-1">Categories:</div>
                    <div className="space-y-1">
                      {(expandedSections.categories ? referenceData.categories : referenceData.categories.slice(0, 5)).map(cat => (
                        <div key={cat.id} className="text-xs">
                          <span className="font-mono bg-muted px-1 rounded">{cat.name}</span>
                        </div>
                      ))}
                      {referenceData.categories.length > 5 && (
                        <div 
                          className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors text-xs"
                          onClick={() => toggleSection('categories')}
                        >
                          {expandedSections.categories 
                            ? 'Show less' 
                            : `... and ${referenceData.categories.length - 5} more`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground mb-1">Types:</div>
                    <div className="space-y-1">
                      {(expandedSections.types ? referenceData.types : referenceData.types.slice(0, 5)).map(type => (
                        <div key={type.id} className="text-xs">
                          <span className="font-mono bg-muted px-1 rounded">{type.name}</span>
                        </div>
                      ))}
                      {referenceData.types.length > 5 && (
                        <div 
                          className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors text-xs"
                          onClick={() => toggleSection('types')}
                        >
                          {expandedSections.types 
                            ? 'Show less' 
                            : `... and ${referenceData.types.length - 5} more`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground mb-1">Occasions:</div>
                    <div className="space-y-1">
                      {(expandedSections.occasions ? referenceData.occasions : referenceData.occasions.slice(0, 5)).map(occasion => (
                        <div key={occasion.id} className="text-xs">
                          <span className="font-mono bg-muted px-1 rounded">{occasion.name}</span>
                        </div>
                      ))}
                      {referenceData.occasions.length > 5 && (
                        <div 
                          className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors text-xs"
                          onClick={() => toggleSection('occasions')}
                        >
                          {expandedSections.occasions 
                            ? 'Show less' 
                            : `... and ${referenceData.occasions.length - 5} more`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Image URL Examples */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recommended Image URLs:</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• <span className="font-mono">https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400</span></div>
                <div>• <span className="font-mono">https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400</span></div>
                <div>• <span className="font-mono">https://picsum.photos/400/400</span></div>
                <div>• <span className="font-mono">https://via.placeholder.com/400x400</span></div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {uploadResult ? 'Close' : 'Cancel'}
          </Button>
          {file && !isUploading && (
            <Button onClick={handleUpload}>
              {uploadResult ? 'Re-upload' : 'Upload Products'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
