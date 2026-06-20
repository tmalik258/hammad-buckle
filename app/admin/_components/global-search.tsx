"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, ShoppingCart, Users, Tag, Star, Loader2, X } from "lucide-react";
import { debounce } from "@/lib/utils/debounce";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  name?: string;
  email?: string;
  orderNumber?: string;
  code?: string;
  content?: string;
  price?: number;
  totalAmount?: number;
  rating?: number;
  category?: { name: string };
  user?: { name: string; email: string };
  product?: { name: string };
  status?: string;
  role?: string;
  isActive?: boolean;
  sku?: string;
  description?: string;
  discountType?: string;
  discountValue?: number;
  createdAt?: string;
  _count?: { products: number };
}

interface SearchResults {
  products: SearchResult[];
  orders: SearchResult[];
  customers: SearchResult[];
  categories: SearchResult[];
  promoCodes: SearchResult[];
  reviews: SearchResult[];
  totalResults: number;
}

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce(performSearch, 300),
    [performSearch]
  );

  // Handle search input
  const handleSearch = (value: string) => {
    setQuery(value);
    setIsOpen(value.length >= 2);
    setSelectedIndex(-1);
    debouncedSearch(value);
  };

  // Clear search
  const clearSearch = () => {
    setQuery("");
    setResults(null);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Navigate to result
  const navigateToResult = (result: SearchResult, type: string) => {
    let path = "";
    switch (type) {
      case "products":
        path = `/admin/products?search=${result.name}`;
        break;
      case "orders":
        path = `/admin/orders?search=${result.orderNumber}`;
        break;
      case "customers":
        path = `/admin/customers?search=${result.email}`;
        break;
      case "categories":
        path = `/admin/categories?search=${result.name}`;
        break;
      case "promoCodes":
        path = `/admin/promo-codes?search=${result.code}`;
        break;
      case "reviews":
        path = `/admin/reviews?search=${result.id}`;
        break;
    }
    if (path) {
      router.push(path);
      setIsOpen(false);
      clearSearch();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results || !isOpen) return;

    const allResults = [
      ...results.products.map(r => ({ ...r, type: 'products' })),
      ...results.orders.map(r => ({ ...r, type: 'orders' })),
      ...results.customers.map(r => ({ ...r, type: 'customers' })),
      ...results.categories.map(r => ({ ...r, type: 'categories' })),
      ...results.promoCodes.map(r => ({ ...r, type: 'promoCodes' })),
      ...results.reviews.map(r => ({ ...r, type: 'reviews' }))
    ];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && allResults[selectedIndex]) {
          navigateToResult(allResults[selectedIndex], allResults[selectedIndex].type);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderResultItem = (result: SearchResult, type: string, index: number) => {
    const isSelected = selectedIndex === index;
    
    const getIcon = () => {
      switch (type) {
        case 'products': return <Package className="h-4 w-4" />;
        case 'orders': return <ShoppingCart className="h-4 w-4" />;
        case 'customers': return <Users className="h-4 w-4" />;
        case 'categories': return <Tag className="h-4 w-4" />;
        case 'promoCodes': return <Tag className="h-4 w-4" />;
        case 'reviews': return <Star className="h-4 w-4" />;
        default: return null;
      }
    };

    const getTitle = () => {
      switch (type) {
        case 'products': return result.name;
        case 'orders': return result.orderNumber;
        case 'customers': return result.name || result.email;
        case 'categories': return result.name;
        case 'promoCodes': return result.code;
        case 'reviews': return `${result.product?.name} - ${result.user?.name}`;
        default: return '';
      }
    };

    const getSubtitle = () => {
      switch (type) {
        case 'products': return `${result.category?.name} • $${result.price}`;
        case 'orders': return `${result.user?.name} • $${result.totalAmount}`;
        case 'customers': return result.email;
        case 'categories': return `${result._count?.products || 0} products`;
        case 'promoCodes': return `${result.discountValue}% ${result.discountType}`;
        case 'reviews': return `${result.rating} stars`;
        default: return '';
      }
    };

    return (
      <div
        key={`${type}-${result.id}`}
        className={cn(
          "flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-zinc-100",
          isSelected && "bg-zinc-100"
        )}
        onClick={() => navigateToResult(result, type)}
      >
        <div className="text-muted-foreground">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="truncate text-sm font-medium text-foreground">{getTitle()}</div>
          <div className="truncate text-xs text-muted-foreground">{getSubtitle()}</div>
        </div>
      </div>
    );
  };

  const renderSection = (title: string, results: SearchResult[], type: string, startIndex: number) => {
    if (!results.length) return null;

    return (
      <div key={type}>
        <div className="border-b border-border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
          {title} ({results.length})
        </div>
        {results.map((result, index) => 
          renderResultItem(result, type, startIndex + index)
        )}
      </div>
    );
  };

  let currentIndex = 0;

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products, orders, customers... (Ctrl+K)"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-10 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg"
        >
          {!results && !isSearching && query.length >= 2 && (
            <div className="px-4 py-8 text-center text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}
          
          {results && results.totalResults === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {results && results.totalResults > 0 && (
            <div>
              {renderSection("Products", results.products, "products", currentIndex)}
              {currentIndex += results.products.length}
              {renderSection("Orders", results.orders, "orders", currentIndex)}
              {currentIndex += results.orders.length}
              {renderSection("Customers", results.customers, "customers", currentIndex)}
              {currentIndex += results.customers.length}
              {renderSection("Categories", results.categories, "categories", currentIndex)}
              {currentIndex += results.categories.length}
              {renderSection("Promo Codes", results.promoCodes, "promoCodes", currentIndex)}
              {currentIndex += results.promoCodes.length}
              {renderSection("Reviews", results.reviews, "reviews", currentIndex)}
            </div>
          )}

          {results && results.totalResults > 0 && (
            <div className="border-t border-border bg-muted px-4 py-2 text-xs text-muted-foreground">
              Press Enter to select, ↑↓ to navigate, Esc to close
            </div>
          )}
        </div>
      )}
    </div>
  );
}
