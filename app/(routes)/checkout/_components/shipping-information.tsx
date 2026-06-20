"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Zap } from "lucide-react";

interface ShippingInformationProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    area: string;
    postalCode: string;
  };
  formErrors: {
    name?: string;
    email?: string;
    phone?: string;
    street?: string;
    city?: string;
    area?: string;
    postalCode?: string;
  };
  handleInputChange: (field: string, value: string) => void;
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

const inputClassName =
  "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900";

export const ShippingInformation = ({
  formData,
  formErrors,
  handleInputChange,
  selectedMethod,
  onMethodChange,
}: ShippingInformationProps) => {
  return (
    <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-zinc-900">
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
            1
          </div>
          Shipping Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900">Personal Information</h3>

          {/* Full Name */}
          <div>
            <Label htmlFor="name" className="text-zinc-700">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`${inputClassName} ${
                formErrors.name ? "border-red-500 focus:border-red-500" : ""
              }`}
              placeholder="John Doe"
              required
            />
            {formErrors.name && (
              <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
            )}
          </div>

          {/* Phone and Email Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="phone" className="text-zinc-700">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`${inputClassName} ${
                  formErrors.phone ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="(123) 456-7890"
                required
              />
              {formErrors.phone && (
                <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email" className="text-zinc-700">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`${inputClassName} ${
                  formErrors.email ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="your@email.com"
                required
              />
              {formErrors.email && (
                <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Address Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900">Shipping Address</h3>

          {/* Street Address */}
          <div className="space-y-2">
            <Label htmlFor="street" className="text-sm font-medium text-zinc-700">
              Street Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="street"
              type="text"
              value={formData.street}
              onChange={(e) => handleInputChange("street", e.target.value)}
              className={`${inputClassName} ${
                formErrors.street ? "border-red-500 focus:border-red-500" : ""
              }`}
              placeholder="123 Main Street"
              required
            />
            {formErrors.street && (
              <p className="mt-1 text-xs text-red-500">{formErrors.street}</p>
            )}
          </div>

          {/* City, Area, Postal Code */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium text-zinc-700">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className={`${inputClassName} ${
                  formErrors.city ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="Kuwait City"
                required
              />
              {formErrors.city && (
                <p className="mt-1 text-xs text-red-500">{formErrors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="area" className="text-sm font-medium text-zinc-700">
                Area <span className="text-red-500">*</span>
              </Label>
              <Input
                id="area"
                type="text"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
                className={`${inputClassName} ${
                  formErrors.area ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="Salmiya"
                required
              />
              {formErrors.area && (
                <p className="mt-1 text-xs text-red-500">{formErrors.area}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-sm font-medium text-zinc-700">
                Postal Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="postalCode"
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                className={`${inputClassName} ${
                  formErrors.postalCode ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="12345"
                required
              />
              {formErrors.postalCode && (
                <p className="mt-1 text-xs text-red-500">{formErrors.postalCode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Method Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900">Shipping Method</h3>

          <div
            className={`flex cursor-pointer items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition-all hover:border-zinc-900 ${
              selectedMethod === "standard" ? "border-zinc-900 ring-2 ring-zinc-900" : ""
            }`}
            onClick={() => onMethodChange("standard")}
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-zinc-400">
                {selectedMethod === "standard" && (
                  <div className="h-3 w-3 rounded-full bg-zinc-900" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-zinc-600" />
                <span className="text-base font-medium text-zinc-900">
                  Standard Shipping (2-3 days)
                </span>
              </div>
            </div>
            <span className="text-sm font-medium text-zinc-600">KWD 3.00</span>
          </div>

          <div
            className={`flex cursor-pointer items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition-all hover:border-zinc-900 ${
              selectedMethod === "express" ? "border-zinc-900 ring-2 ring-zinc-900" : ""
            }`}
            onClick={() => onMethodChange("express")}
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-zinc-400">
                {selectedMethod === "express" && (
                  <div className="h-3 w-3 rounded-full bg-zinc-900" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-zinc-600" />
                <span className="text-base font-medium text-zinc-900">
                  Express Shipping (Same day in Kuwait City)
                </span>
              </div>
            </div>
            <span className="text-sm font-medium text-zinc-600">KWD 5.00</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
