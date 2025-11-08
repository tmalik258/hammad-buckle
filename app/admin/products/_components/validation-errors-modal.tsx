"use client";

import { useState } from "react";
import { Prisma } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ValidationErrorDetail } from "@/lib/utils/error-handling";

// Product validation error structure
interface ProductValidationError {
  errors?: ValidationErrorDetail[];
  rowData?: Record<string, unknown>;
  [key: string]: unknown;
}

import { ProductWithRelations } from '@/lib/hooks/useProductQueries';

interface ValidationErrorsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithRelations | null;
}

export function ValidationErrorsModal({
  open,
  onOpenChange,
  product,
}: ValidationErrorsModalProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  if (!product || !product.validationErrors) {
    return null;
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderValidationErrors = () => {
    if (!product.validationErrors) return null;

    // Parse the validation errors
    let errors: Prisma.JsonValue = product.validationErrors;
    
    // If it's a string, try to parse it as JSON
    if (typeof errors === 'string') {
      const originalString = errors;
      try {
        errors = JSON.parse(errors);
      } catch {
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Validation Error</span>
            </div>
            <p className="text-sm text-muted-foreground">{originalString}</p>
          </div>
        );
      }
    }

    // If it's a ProductValidationError object, render it as JSON
    if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Validation Error</span>
          </div>
          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
            {JSON.stringify(errors, null, 2)}
          </pre>
        </div>
      );
    }

    // If it's an array of errors
    if (Array.isArray(errors)) {
      return (
        <div className="space-y-4">
          {errors.map((error, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Error {index + 1}</span>
              </div>
              <div className="pl-6 space-y-1">
                {typeof error === 'string' ? (
                  <p className="text-sm text-muted-foreground">{error}</p>
                ) : (
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // If it's an object with structured errors
    if (typeof errors === 'object' && errors !== null) {
      return (
        <div className="space-y-4">
          {Object.entries(errors).map(([key, value]) => {
            const isExpanded = expandedSections[key] ?? true;
            
            return (
              <Collapsible key={key} open={isExpanded} onOpenChange={() => toggleSection(key)}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 pt-2">
                  {typeof value === 'string' ? (
                    <p className="text-sm text-muted-foreground">{value}</p>
                  ) : Array.isArray(value) ? (
                    <div className="space-y-1">
                      {value.map((item, index) => (
                        <p key={index} className="text-sm text-muted-foreground">• {item}</p>
                      ))}
                    </div>
                  ) : (
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      );
    }

    // Fallback for any other format
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">Validation Errors</span>
        </div>
        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
          {JSON.stringify(errors, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Validation Errors
          </DialogTitle>
          <DialogDescription>
            Product: <span className="font-medium">{product.name}</span>
            {product.sku && (
              <span className="ml-2 text-xs">(SKU: {product.sku})</span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="destructive">Invalid</Badge>
            <Badge variant="secondary">Inactive</Badge>
          </div>
          
          <Separator />
          
          <ScrollArea className="max-h-[50vh]">
            <div className="space-y-4 pr-4">
              {renderValidationErrors()}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}