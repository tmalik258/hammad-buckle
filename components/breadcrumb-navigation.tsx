"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function BreadcrumbNavigation({ items, className = "" }: BreadcrumbNavigationProps) {
  return (
    <div className={`container mx-auto ${className}`}>
      <Breadcrumb>
        <BreadcrumbList className="text-purple-200">
          {items.map((item, index) => (
            <div key={index} className="flex items-center">
              <BreadcrumbItem>
                {item.isActive ? (
                  <BreadcrumbPage className="text-white font-medium">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    href={item.href || "/"} 
                    className="text-purple-200 hover:text-white cursor-pointer"
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 && (
                <BreadcrumbSeparator className="text-purple-300 ml-2 mr-2" />
              )}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}