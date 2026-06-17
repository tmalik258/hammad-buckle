'use client';

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Filter, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFilters, usePriceStatistics } from "@/lib/hooks/useFilters";

interface PriceRange {
  label: string;
  value: string;
}

interface ProductFiltersProps {
  className?: string;
  filters: {
    search: string;
    category: string;
    genderTarget: string;
    status: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    minPrice?: number;
    maxPrice?: number;
  };
  onFilterChange: (filters: Partial<ProductFiltersProps['filters']>) => void;
}

const ProductFilters = ({
  className = "",
  filters,
  onFilterChange
}: ProductFiltersProps) => {
  const { filterSections, isLoading, hasError } = useFilters();
  const { data: priceStats, isLoading: priceStatsLoading } = usePriceStatistics();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");

  // Initialize selected filters from URL params or props
  useEffect(() => {
    const urlCategory = searchParams.get('category') || '';
    const urlMinPrice = searchParams.get('minPrice');
    const urlMaxPrice = searchParams.get('maxPrice');
    
    setSelectedFilters({
      categories: urlCategory || filters.category || "",
    });

    // Set price range from URL params
    if (urlMinPrice && urlMaxPrice) {
      setSelectedPriceRange(`${urlMinPrice}-${urlMaxPrice}`);
    }
  }, [searchParams, filters.category]);
  
  // Generate price ranges based on real data or fallback to defaults
  const generatePriceRanges = (min: number = 15, max: number = 300): PriceRange[] => {
    // Use real price data if available
    if (priceStats && !priceStatsLoading) {
      const realMin = priceStats.min;
      const realMax = priceStats.max;
      
      // Use the dynamic price ranges from the API if available
      if (priceStats.priceRanges && priceStats.priceRanges.length > 0) {
        return priceStats.priceRanges.map((range, index) => ({
          label: range.label,
          value: `${range.min}-${range.max === realMax ? 'max' : range.max}`,
        }));
      }
      
      // Fallback to calculated ranges based on real min/max
      const step = Math.ceil((realMax - realMin) / 5);
      return [
        { label: `Under ${realMin + step} KWD`, value: `${realMin}-${realMin + step}` },
        { label: `${realMin + step} - ${realMin + step * 2} KWD`, value: `${realMin + step}-${realMin + step * 2}` },
        { label: `${realMin + step * 2} - ${realMin + step * 3} KWD`, value: `${realMin + step * 2}-${realMin + step * 3}` },
        { label: `${realMin + step * 3} - ${realMin + step * 4} KWD`, value: `${realMin + step * 3}-${realMin + step * 4}` },
        { label: `${realMin + step * 4}+ KWD`, value: `${realMin + step * 4}-max` },
      ];
    }
    
    // Fallback to hardcoded ranges if no real data available
    const ranges: PriceRange[] = [
      { label: 'All Prices', value: `${min}-${max}` },
    ];
    
    const step = Math.ceil((max - min) / 4);
    if (step > 0) {
      ranges.push(
        { label: `Under ${min + step} KWD`, value: `${min}-${min + step}` },
        { label: `${min + step} - ${min + step * 2} KWD`, value: `${min + step}-${min + step * 2}` },
        { label: `${min + step * 2} - ${min + step * 3} KWD`, value: `${min + step * 2}-${min + step * 3}` },
        { label: `Over ${min + step * 3} KWD`, value: `${min + step * 3}-${max}` },
      );
    }
    
    return ranges;
  };
  
  const priceRanges: PriceRange[] = generatePriceRanges(15, 300);

  const handleFilterChange = (filterId: string, value: string) => {
    const newFilters = { ...selectedFilters, [filterId]: value };
    setSelectedFilters(newFilters);
    
    // Update URL parameters
    const params = new URLSearchParams(searchParams);
    
    // Handle different filter types based on section ID
    switch (filterId) {
      case 'categories':
        if (value) {
          params.set('category', value);
        } else {
          params.delete('category');
        }
        onFilterChange({ category: value });
        break;
    }
    
    // Update URL without page reload
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePriceRangeChange = (range: string) => {
    setSelectedPriceRange(range);
    
    // Update URL parameters
    const params = new URLSearchParams(searchParams);
    
    // Parse price range and update filters
    const [minStr, maxStr] = range.split('-');
    const min = parseFloat(minStr);
    
    if (!isNaN(min)) {
      params.set('minPrice', min.toString());
      
      // Handle 'max' value or numeric max
      if (maxStr === 'max') {
        // Use the actual max price from stats or a high default
        const maxPrice = priceStats?.max || 10000;
        params.set('maxPrice', maxPrice.toString());
        onFilterChange({ minPrice: min, maxPrice: maxPrice });
      } else {
        const max = parseFloat(maxStr);
        if (!isNaN(max)) {
          params.set('maxPrice', max.toString());
          onFilterChange({ minPrice: min, maxPrice: max });
        } else {
          // Clear max if invalid
          params.delete('maxPrice');
          onFilterChange({ minPrice: min, maxPrice: undefined });
        }
      }
    } else {
      // Clear price filters if range is invalid
      params.delete('minPrice');
      params.delete('maxPrice');
      onFilterChange({ minPrice: undefined, maxPrice: undefined });
    }
    
    // Update URL without page reload
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleClearAllFilters = () => {
    // Reset all filter states
    setSelectedFilters({
      categories: "",
    });
    setSelectedPriceRange("");
    
    // Clear all URL parameters except search
    const params = new URLSearchParams();
    const searchValue = searchParams.get('search');
    if (searchValue) {
      params.set('search', searchValue);
    }
    
    // Reset all filters to default values
    onFilterChange({
      category: "",
      genderTarget: "",
      minPrice: undefined,
      maxPrice: undefined,
    });
    
    // Update URL without page reload
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      selectedFilters.categories ||
      selectedPriceRange ||
      filters.genderTarget
    );
  };

  const FilterContent = () => (
    <div className="space-y-4 lg:space-y-6 h-full">
      <div className="flex items-center justify-between top-0 py-2">
        <h2 className="text-lg lg:text-xl font-bold">Filters</h2>
        {hasActiveFilters() && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAllFilters}
            className="border-red-400 text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors duration-200 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Shop for</Label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "All", value: "" },
            { label: "Women's", value: "WOMENS" },
            { label: "Men's", value: "MENS" },
            { label: "Unisex", value: "UNISEX" },
          ].map((opt) => (
            <button
              key={opt.value || "all"}
              type="button"
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition cursor-pointer md:text-sm",
                filters.genderTarget === opt.value
                  ? "border-black bg-black text-white"
                  : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400"
              )}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                if (opt.value) {
                  params.set("genderTarget", opt.value);
                } else {
                  params.delete("genderTarget");
                }
                onFilterChange({ genderTarget: opt.value });
                router.push(`?${params.toString()}`, { scroll: false });
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Sections */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3 bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      ) : (
        filterSections.map((section) => (
          <div key={section.id} className="content-rounded-2xl">
            <div className="p-4 space-y-2 lg:space-y-3 bg-black/10 rounded-2xl">
              <h3 className="text-sm font-semibold">{section.name}</h3>
              <RadioGroup
                value={selectedFilters[section.id] || ""}
                onValueChange={(value) => handleFilterChange(section.id, value)}
                className="space-y-1 lg:space-y-2"
              >
                {section.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      className="w-4 h-4 text-black focus:ring-black"
                    />
                    <Label
                      htmlFor={option.id}
                      className={`text-sm cursor-pointer ${
                        selectedFilters[section.id] === option.id
                          ? "text-black"
                          : "text-gray-800"
                      }`}
                    >
                      {option.name} {option.count && option?.count > 0 && `(${option.count})`}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        ))
      )}

      {/* Price Range Filter */}
      <div className="content-rounded-2xl">
        <div className="rounded-2xl bg-black/10 p-4 space-y-2 lg:space-y-3">
          <h3 className="text-xs lg:text-sm font-semibold">
            Price Range: {priceStats && !priceStatsLoading 
              ? `${priceStats.min} KWD → ${priceStats.max}+ KWD`
              : "15 KWD → 300 KWD+"
            }
          </h3>
          {/* <div className="px-2">
            <div className="relative">
              <div className="h-2 bg-gray-700 rounded-full">
                <div
                  className="h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
                  style={{width: '60%'}}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>15 KWD</span>
                <span>300 KWD+</span>
              </div>
            </div>
          </div> */}
          <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-1 lg:gap-2 mt-2 lg:mt-4">
            {priceRanges.map((range) => (
              <Button
                key={range.value}
                variant="outline"
                size="sm"
                onClick={() => handlePriceRangeChange(range.value)}
                className={`text-xs lg:text-xs border-black hover:bg-black/10 px-2 py-1 ${
                  selectedPriceRange === range.value
                    ? "bg-black/20 text-black"
                    : "text-black"
                }`}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Sheet */}
      <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-black hover:bg-black/10 mb-4"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background content-w-80 flex flex-col z-[4001]">
              <div className="flex-1 overflow-y-auto px-4">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn("hidden lg:flex w-full lg:w-80 lg:flex-shrink-0 h-full", className)}>
        <div className="content-rounded-lg flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <FilterContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductFilters;
export type { PriceRange, ProductFiltersProps };
