import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronRight, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Apartment } from "@/types/apartments";

interface BasicInfoStepProps {
  apartmentData: Apartment;
  handleChange: (field: string, value: any) => void;
  nextStep: () => void;
  isValid: boolean;
  validationErrors: Record<string, string>;
}

export default function BasicInfoStep({
  apartmentData,
  handleChange,
  nextStep,
  isValid,
  validationErrors,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label
          htmlFor="apartment_name"
          className="text-sm font-medium text-gray-700 mb-1 block"
        >
          Apartment Name*
        </Label>
        <Input
          id="apartment_name"
          placeholder="Enter a catchy title for your listing"
          value={apartmentData.apartment_name}
          onChange={(e) => handleChange("apartment_name", e.target.value)}
          className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
            validationErrors.apartment_name
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : ""
          }`}
        />
        {validationErrors.apartment_name && (
          <div className="mt-1 text-red-500 flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {validationErrors.apartment_name}
          </div>
        )}
      </div>

      <div>
        <Label
          htmlFor="description"
          className="text-sm font-medium text-gray-700 mb-1 block"
        >
          Description*
        </Label>
        <Textarea
          id="description"
          placeholder="Describe your apartment, its condition, and what makes it special..."
          value={apartmentData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-32 ${
            validationErrors.description
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : ""
          }`}
        />
        {validationErrors.description && (
          <div className="mt-1 text-red-500 flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {validationErrors.description}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label
            htmlFor="price_per_month"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Price per Month (KZT)*
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              ₸
            </span>
            <Input
              id="price_per_month"
              type="number"
              placeholder="Enter monthly rent"
              value={apartmentData.price_per_month || ""}
              onChange={(e) =>
                handleChange("price_per_month", Number(e.target.value))
              }
              className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 pl-10 ${
                validationErrors.price_per_month
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
            />
          </div>
          {validationErrors.price_per_month && (
            <div className="mt-1 text-red-500 flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {validationErrors.price_per_month}
            </div>
          )}
        </div>

        <div>
          <Label
            htmlFor="rental_type"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Rental Type*
          </Label>
          <Select
            value={apartmentData.rental_type}
            onValueChange={(value) => handleChange("rental_type", value)}
          >
            <SelectTrigger
              id="rental_type"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
            >
              <SelectValue placeholder="Select rental type" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-lg rounded-md">
              <SelectItem value="entire_apartment" className="hover:bg-blue-50">
                Entire Apartment
              </SelectItem>
              <SelectItem value="private_room" className="hover:bg-blue-50">
                Private Room
              </SelectItem>
              <SelectItem value="shared_room" className="hover:bg-blue-50">
                Shared Room
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label
            htmlFor="area"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Total Area (m²)*
          </Label>
          <div className="relative">
            <Input
              id="area"
              type="number"
              placeholder="Enter total area"
              value={apartmentData.area || ""}
              onChange={(e) => handleChange("area", Number(e.target.value))}
              className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10 ${
                validationErrors.area
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              m²
            </span>
          </div>
          {validationErrors.area && (
            <div className="mt-1 text-red-500 flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {validationErrors.area}
            </div>
          )}
        </div>

        <div>
          <Label
            htmlFor="kitchen_area"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Kitchen Area (m²)
          </Label>
          <div className="relative">
            <Input
              id="kitchen_area"
              type="number"
              placeholder="Enter kitchen area"
              value={apartmentData.kitchen_area || ""}
              onChange={(e) =>
                handleChange("kitchen_area", Number(e.target.value))
              }
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              m²
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label
            htmlFor="number_of_rooms"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Number of Rooms*
          </Label>
          <Input
            id="number_of_rooms"
            type="number"
            placeholder="Enter number of rooms"
            value={apartmentData.number_of_rooms || ""}
            onChange={(e) =>
              handleChange("number_of_rooms", Number(e.target.value))
            }
            className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
              validationErrors.number_of_rooms
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
          />
          {validationErrors.number_of_rooms && (
            <div className="mt-1 text-red-500 flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {validationErrors.number_of_rooms}
            </div>
          )}
        </div>

        <div>
          <Label
            htmlFor="floor"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Floor
          </Label>
          <Input
            id="floor"
            type="number"
            placeholder="Enter floor number"
            value={apartmentData.floor || ""}
            onChange={(e) => handleChange("floor", Number(e.target.value))}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label
            htmlFor="max_users"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Maximum Occupancy*
          </Label>
          <Input
            id="max_users"
            type="number"
            placeholder="Maximum number of tenants"
            value={apartmentData.max_users || ""}
            onChange={(e) => handleChange("max_users", Number(e.target.value))}
            className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
              validationErrors.max_users
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
          />
          {validationErrors.max_users && (
            <div className="mt-1 text-red-500 flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {validationErrors.max_users}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          type="button"
          onClick={nextStep}
          className="flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-200 shadow-md hover:shadow-lg px-6 py-2"
          disabled={!isValid}
        >
          Next: Location <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
