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

export const ShippingInformation = ({
  formData,
  formErrors,
  handleInputChange,
  selectedMethod,
  onMethodChange,
}: ShippingInformationProps) => {
  return (
    <Card className="bg-white/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
            1
          </div>
          Shipping Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <h3 className="text-purple-200 text-lg font-semibold">Personal Information</h3>
          
          {/* Full Name */}
          <div>
            <Label htmlFor="name" className="text-purple-200">
              Full Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`bg-black/50 border-purple-400/50 text-white placeholder:text-gray-400 focus:border-purple-400 ${
                formErrors.name ? "border-red-500 focus:border-red-500" : ""
              }`}
              placeholder="John Doe"
              required
            />
            {formErrors.name && (
              <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* Phone and Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="text-purple-200">
                Phone Number <span className="text-red-400">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`bg-black/50 border-purple-400/50 text-white placeholder:text-gray-400 focus:border-purple-400 ${
                  formErrors.phone ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="(123) 456-7890"
                required
              />
              {formErrors.phone && (
                <p className="text-red-400 text-xs mt-1">{formErrors.phone}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email" className="text-purple-200">
                Email Address <span className="text-red-400">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`bg-black/50 border-purple-400/50 text-white placeholder:text-gray-400 focus:border-purple-400 ${
                  formErrors.email ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="your@email.com"
                required
              />
              {formErrors.email && (
                <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Address Section */}
        <div className="space-y-4">
          <h3 className="text-purple-200 text-lg font-semibold">Shipping Address</h3>
          
          {/* Street Address */}
          <div className="space-y-2">
            <Label htmlFor="street" className="text-purple-200 text-sm font-medium">
              Street Address <span className="text-red-400">*</span>
            </Label>
            <Input
              id="street"
              type="text"
              value={formData.street}
              onChange={(e) => handleInputChange("street", e.target.value)}
              className={`bg-black/50 border-purple-400/50 text-white placeholder:text-gray-400 focus:border-purple-400 ${
                formErrors.street ? "border-red-500 focus:border-red-500" : ""
              }`}
              placeholder="123 Main Street"
              required
            />
            {formErrors.street && (
              <p className="text-red-400 text-xs mt-1">{formErrors.street}</p>
            )}
          </div>

          {/* City, Area, Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city" className="text-purple-200 text-sm font-medium">
                City <span className="text-red-400">*</span>
              </Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className={`bg-black/50 border-purple-400/50 text-white placeholder:text-gray-400 focus:border-purple-400 ${
                  formErrors.city ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="Kuwait City"
                required
              />
              {formErrors.city && (
                <p className="text-red-400 text-xs mt-1">{formErrors.city}</p>
              )}
            </div>

            {/* Area */}
            <div className="space-y-2">
              <Label htmlFor="area" className="text-purple-200 text-sm font-medium">
                Area <span className="text-red-400">*</span>
              </Label>
              <Input
                id="area"
                type="text"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
                className={`bg-black/50 border-purple-400/50 text-white placeholder:text-gray-400 focus:border-purple-400 ${
                  formErrors.area ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="Salmiya"
                required
              />
              {formErrors.area && (
                <p className="text-red-400 text-xs mt-1">{formErrors.area}</p>
              )}
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-purple-200 text-sm font-medium">
                Postal Code <span className="text-red-400">*</span>
              </Label>
              <Input
                id="postalCode"
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                className={`bg-black/50 border-purple-400/50 text-white placeholder:text-gray-400 focus:border-purple-400 ${
                  formErrors.postalCode ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="12345"
                required
              />
              {formErrors.postalCode && (
                <p className="text-red-400 text-xs mt-1">{formErrors.postalCode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Method Section */}
        <div className="space-y-4">
          <h3 className="text-purple-200 text-lg font-semibold">Shipping Method</h3>
          
          {/* Standard Shipping Option */}
          <div 
            className={`bg-black/50 border border-purple-400/50 rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all hover:border-purple-400 ${
              selectedMethod === 'standard' ? 'ring-2 ring-purple-500 border-purple-500' : ''
            }`}
            onClick={() => onMethodChange('standard')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full border-2 border-purple-400 flex items-center justify-center">
                {selectedMethod === 'standard' && (
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-purple-400" />
                <span className="text-white text-base font-medium">
                  Standard Shipping (2-3 days)
                </span>
              </div>
            </div>
            <span className="text-purple-200 text-sm font-medium">
              KWD 3.00
            </span>
          </div>
          
          {/* Express Shipping Option */}
          <div 
            className={`bg-black/50 border border-purple-400/50 rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all hover:border-purple-400 ${
              selectedMethod === 'express' ? 'ring-2 ring-purple-500 border-purple-500' : ''
            }`}
            onClick={() => onMethodChange('express')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full border-2 border-purple-400 flex items-center justify-center">
                {selectedMethod === 'express' && (
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-white text-base font-medium">
                  Express Shipping (Same day in Kuwait City)
                </span>
              </div>
            </div>
            <span className="text-purple-200 text-sm font-medium">
              KWD 5.00
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};