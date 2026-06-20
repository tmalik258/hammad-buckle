"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function BreadcrumbNavigation({
  items,
  className = "",
}: BreadcrumbNavigationProps) {
  return (
    <div className={`container mx-auto ${className}`}>
      <Breadcrumb>
        <BreadcrumbList className="text-zinc-500">
          {items.map((item, index) => (
            <div key={index} className="flex items-center">
              <BreadcrumbItem>
                {item.isActive ? (
                  <BreadcrumbPage className="font-medium text-zinc-900">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={item.href || "/"}
                    className="text-zinc-500 hover:text-zinc-900 cursor-pointer"
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 && (
                <BreadcrumbSeparator className="mx-2 text-zinc-300" />
              )}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
