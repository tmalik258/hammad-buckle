"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorComponentProps {
  title?: string;
  message?: string;
  error?: Error | string | null;
  onRefresh?: () => void;
  showRefresh?: boolean;
  className?: string;
}

export function ErrorComponent({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  error,
  onRefresh,
  showRefresh = true,
  className = ""
}: ErrorComponentProps) {
  const errorMessage = error 
    ? typeof error === 'string' 
      ? error 
      : error.message || "Unknown error occurred"
    : message;

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-lg font-semibold">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-gray-400">
          {errorMessage}
        </p>
        {showRefresh && onRefresh && (
          <Button 
            onClick={onRefresh}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Inline error component for smaller spaces
export function InlineErrorComponent({
  title = "Error",
  message = "Something went wrong",
  error,
  onRefresh,
  showRefresh = true,
  className = ""
}: ErrorComponentProps) {
  const errorMessage = error 
    ? typeof error === 'string' 
      ? error 
      : error.message || "Unknown error occurred"
    : message;

  return (
    <div className={`flex flex-col items-center justify-center py-8 text-center ${className}`}>
      <div className="text-red-400 mb-4">
        <AlertTriangle className="w-12 h-12 mx-auto" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-md">{errorMessage}</p>
      {showRefresh && onRefresh && (
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

// Full page error component
export function FullPageErrorComponent({
  title = "Oops! Something went wrong",
  message = "We encountered an unexpected error. Please refresh the page or try again later.",
  error,
  onRefresh,
  showRefresh = true,
  className = ""
}: ErrorComponentProps) {
  const errorMessage = error 
    ? typeof error === 'string' 
      ? error 
      : error.message || "Unknown error occurred"
    : message;

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 px-4 ${className}`}>
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 mb-8">{errorMessage}</p>
        {showRefresh && onRefresh && (
          <Button onClick={onRefresh} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}