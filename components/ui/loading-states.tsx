"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";
import { Loader2, Wifi, WifiOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "./alert";

// Enhanced loading spinner with different sizes and variants
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  variant = "default", 
  className,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  const variantClasses = {
    default: "text-gray-500",
    primary: "text-zinc-900",
    secondary: "text-blue-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500"
  };

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <Loader2 
        className={cn(
          "animate-spin",
          sizeClasses[size],
          variantClasses[variant]
        )} 
      />
      {text && (
        <span className={cn("text-sm", variantClasses[variant])}>
          {text}
        </span>
      )}
    </div>
  );
}

// Inline loading state for buttons and form elements
interface InlineLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary";
}

export function InlineLoading({ 
  isLoading, 
  children, 
  loadingText,
  size = "sm",
  variant = "default"
}: InlineLoadingProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size={size} variant={variant} />
      {loadingText && (
        <span className="text-sm text-gray-500">{loadingText}</span>
      )}
    </div>
  );
}

// Enhanced skeleton for form fields
interface FormFieldSkeletonProps {
  label?: boolean;
  required?: boolean;
  className?: string;
}

export function FormFieldSkeleton({ 
  label = true, 
  required = false, 
  className 
}: FormFieldSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center space-x-1">
          <Skeleton className="h-4 w-20" />
          {required && <Skeleton className="h-3 w-2" />}
        </div>
      )}
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

// Profile card skeleton with enhanced details
export function ProfileCardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Profile header */}
      <div className="flex items-center space-x-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Profile details */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex space-x-2 pt-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}

// Form skeleton for editing mode
export function ProfileFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormFieldSkeleton required />
        <FormFieldSkeleton required />
        <FormFieldSkeleton required />
        <FormFieldSkeleton />
        <FormFieldSkeleton className="md:col-span-2" />
      </div>
      
      <div className="flex space-x-4 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

// Loading overlay for async operations
interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  className?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({ 
  isLoading, 
  text = "Loading...", 
  className,
  children 
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 backdrop-blur-sm">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <LoadingSpinner variant="primary" text={text} />
          </div>
        </div>
      )}
    </div>
  );
}

// Progress indicator for multi-step operations
interface ProgressIndicatorProps {
  current: number;
  total: number;
  steps?: string[];
  className?: string;
}

export function ProgressIndicator({ 
  current, 
  total, 
  steps, 
  className 
}: ProgressIndicatorProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm text-zinc-600">
        <span>
          {steps && current <= steps.length ? steps[current - 1] : `Step ${current}`}
        </span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-200">
        <div 
          className="h-2 rounded-full bg-zinc-900 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Status indicator for operations
interface StatusIndicatorProps {
  status: "idle" | "loading" | "success" | "error";
  text?: string;
  className?: string;
}

export function StatusIndicator({ status, text, className }: StatusIndicatorProps) {
  const statusConfig = {
    idle: {
      icon: null,
      color: "text-gray-500",
      bgColor: "bg-gray-500/10"
    },
    loading: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    success: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    error: {
      icon: <AlertCircle className="h-4 w-4" />,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    }
  };

  const config = statusConfig[status];

  return (
    <div className={cn(
      "flex items-center space-x-2 px-3 py-1 rounded-full text-sm",
      config.color,
      config.bgColor,
      className
    )}>
      {config.icon}
      {text && <span>{text}</span>}
    </div>
  );
}
