'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { ORDER_STATUS_CONFIG } from '@/lib/types/order';
import type { OrderFilters, OrderStatus } from '@/lib/types/order';
import { 
  SearchIcon, 
  FilterIcon, 
  CalendarIcon,
  XIcon
} from 'lucide-react';
import { format } from 'date-fns';

interface OrdersFilterProps {
  filters: OrderFilters;
  onFiltersChange: (filters: Partial<OrderFilters>) => void;
  className?: string;
}

export const OrdersFilter = ({ 
  filters, 
  onFiltersChange, 
  className 
}: OrdersFilterProps) => {
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(
    filters.dateFrom ? new Date(filters.dateFrom) : undefined
  );
  const [dateTo, setDateTo] = React.useState<Date | undefined>(
    filters.dateTo ? new Date(filters.dateTo) : undefined
  );

  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value || undefined });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ 
      status: value === 'all' ? undefined : (value as OrderStatus)
    });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    onFiltersChange({ 
      dateFrom: date ? date.toISOString().split('T')[0] : undefined 
    });
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    onFiltersChange({ 
      dateTo: date ? date.toISOString().split('T')[0] : undefined 
    });
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    onFiltersChange({
      search: undefined,
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const hasActiveFilters = Boolean(
    filters.search || 
    filters.status || 
    filters.dateFrom || 
    filters.dateTo
  );

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Status Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search orders by number, product name..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => (
              <SelectItem key={status} value={status}>
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', config.color)} />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range and Clear Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Date Range Filters */}
        <div className="flex gap-2">
          {/* Date From */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-40 justify-start text-left font-normal',
                  !dateFrom && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, 'MMM dd, yyyy') : 'From date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={handleDateFromChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Date To */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-40 justify-start text-left font-normal',
                  !dateTo && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, 'MMM dd, yyyy') : 'To date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={handleDateToChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Active Filters and Clear */}
        <div className="flex items-center gap-2 flex-1">
          {hasActiveFilters && (
            <>
              <Badge variant="secondary" className="flex items-center gap-1">
                <FilterIcon className="w-3 h-3" />
                {getActiveFiltersCount()} filter{getActiveFiltersCount() > 1 ? 's' : ''}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                <XIcon className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="outline" className="flex items-center gap-1">
              Search: &quot;{filters.search}&quot;
              <button
                onClick={() => handleSearchChange('')}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.status && (
            <Badge variant="outline" className="flex items-center gap-1">
              Status: {ORDER_STATUS_CONFIG[filters.status as keyof typeof ORDER_STATUS_CONFIG]?.label}
              <button
                onClick={() => handleStatusChange('all')}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="outline" className="flex items-center gap-1">
              From: {format(new Date(filters.dateFrom), 'MMM dd, yyyy')}
              <button
                onClick={() => handleDateFromChange(undefined)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="outline" className="flex items-center gap-1">
              To: {format(new Date(filters.dateTo), 'MMM dd, yyyy')}
              <button
                onClick={() => handleDateToChange(undefined)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};