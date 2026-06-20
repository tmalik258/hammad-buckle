"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

const toasterStyle = {
  "--normal-bg": "#ffffff",
  "--normal-text": "#18181b",
  "--normal-border": "#e4e4e7",
  "--success-bg": "#ecfdf5",
  "--success-text": "#065f46",
  "--success-border": "#a7f3d0",
  "--error-bg": "#fef2f2",
  "--error-text": "#991b1b",
  "--error-border": "#fecaca",
  "--warning-bg": "#fffbeb",
  "--warning-text": "#92400e",
  "--warning-border": "#fde68a",
  "--info-bg": "#fafafa",
  "--info-text": "#18181b",
  "--info-border": "#e4e4e7",
} as React.CSSProperties;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      richColors
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-zinc-900 group-[.toaster]:border-zinc-200 group-[.toaster]:shadow-md",
          description: "group-[.toast]:text-zinc-600",
          title: "group-[.toast]:text-zinc-900",
          actionButton:
            "group-[.toast]:bg-zinc-900 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-900",
          closeButton:
            "group-[.toast]:bg-white group-[.toast]:text-zinc-500 group-[.toast]:border-zinc-200",
        },
      }}
      style={toasterStyle}
      {...props}
    />
  );
};

export { Toaster };
