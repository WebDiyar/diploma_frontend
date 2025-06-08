import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, ChevronLeft, AlertCircle, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Apartment } from "@/types/apartments";

interface LocationStepProps {
  apartmentData: Apartment;
  handleChange: (field: string, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  isValid: boolean;
  validationErrors: Record<string, string>;
}

export default function LocationStep({
  apartmentData,
  handleChange,
  nextStep,
  prevStep,
  isValid,
  validationErrors,
}: LocationStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label
            htmlFor="street"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Street*
          </Label>
          <Input
            id="street"
            placeholder="Street name"
            value={apartmentData.address.street}
            onChange={(e) => handleChange("address.street", e.target.value)}
            className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
              validationErrors["address.street"]
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
          />
          {validationErrors["address.street"] && (
            <div className="mt-1 text-red-500 flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {validationErrors["address.street"]}
            </div>
          )}
        </div>

        <div>
          <Label
            htmlFor="house_number"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            House Number*
          </Label>
          <Input
            id="house_number"
            placeholder="House/Building number"
            value={apartmentData.address.house_number}
            onChange={(e) =>
              handleChange("address.house_number", e.target.value)
            }
            className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
              validationErrors["address.house_number"]
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
          />
          {validationErrors["address.house_number"] && (
            <div className="mt-1 text-red-500 flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {validationErrors["address.house_number"]}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label
            htmlFor="apartment_number"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Apartment Number
          </Label>
          <Input
            id="apartment_number"
            placeholder="Apartment number"
            value={apartmentData.address.apartment_number}
            onChange={(e) =>
              handleChange("address.apartment_number", e.target.value)
            }
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label
            htmlFor="entrance"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Entrance
          </Label>
          <Input
            id="entrance"
            placeholder="Entrance number or letter"
            value={apartmentData.address.entrance}
            onChange={(e) => handleChange("address.entrance", e.target.value)}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 pt-8">
          <Switch
            id="has_intercom"
            checked={apartmentData.address.has_intercom}
            onCheckedChange={(checked) =>
              handleChange("address.has_intercom", checked)
            }
            className="data-[state=checked]:bg-blue-500"
          />
          <Label htmlFor="has_intercom" className="cursor-pointer">
            Has Intercom
          </Label>
        </div>
      </div>

      <div>
        <Label
          htmlFor="district_name"
          className="text-sm font-medium text-gray-700 mb-1 block"
        >
          District/Neighborhood*
        </Label>
        <Select
          value={apartmentData.district_name}
          onValueChange={(value) => handleChange("district_name", value)}
        >
          <SelectTrigger
            id="district_name"
            className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white ${
              validationErrors["district_name"]
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
          >
            <SelectValue placeholder="Select district" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 shadow-lg rounded-md max-h-60">
            <SelectItem value="Esil" className="hover:bg-blue-50">
              Esil District
            </SelectItem>
            <SelectItem value="Almaty" className="hover:bg-blue-50">
              Almaty District
            </SelectItem>
            <SelectItem value="Saryarka" className="hover:bg-blue-50">
              Saryarka District
            </SelectItem>
            <SelectItem value="Baikonur" className="hover:bg-blue-50">
              Baikonur District
            </SelectItem>
            <SelectItem value="Nura" className="hover:bg-blue-50">
              Nura District
            </SelectItem>
            <SelectItem value="Downtown" className="hover:bg-blue-50">
              Downtown
            </SelectItem>
            <SelectItem value="University Area" className="hover:bg-blue-50">
              University Area
            </SelectItem>
            <SelectItem value="Left Bank" className="hover:bg-blue-50">
              Left Bank
            </SelectItem>
            <SelectItem value="Right Bank" className="hover:bg-blue-50">
              Right Bank
            </SelectItem>
            <SelectItem value="Triumph" className="hover:bg-blue-50">
              Triumph Area
            </SelectItem>
          </SelectContent>
        </Select>
        {validationErrors["district_name"] && (
          <div className="mt-1 text-red-500 flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {validationErrors["district_name"]}
          </div>
        )}
      </div>

      <div>
        <Label
          htmlFor="landmark"
          className="text-sm font-medium text-gray-700 mb-1 block"
        >
          Landmark (optional)
        </Label>
        <Input
          id="landmark"
          placeholder="Nearby landmark to help find the location"
          value={apartmentData.address.landmark}
          onChange={(e) => handleChange("address.landmark", e.target.value)}
          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <Label
          htmlFor="university_nearby"
          className="text-sm font-medium text-gray-700 mb-1 block"
        >
          Nearby University (if applicable)
        </Label>
        <Select
          value={apartmentData.university_nearby}
          onValueChange={(value) => handleChange("university_nearby", value)}
        >
          <SelectTrigger
            id="university_nearby"
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
          >
            <SelectValue placeholder="Select university" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 shadow-lg rounded-md max-h-60">
            <SelectItem value="none" className="hover:bg-blue-50">
              Not applicable
            </SelectItem>
            <SelectItem
              value="Astana IT University"
              className="hover:bg-blue-50"
            >
              Astana IT University (AITU)
            </SelectItem>
            <SelectItem
              value="Nazarbayev University"
              className="hover:bg-blue-50"
            >
              Nazarbayev University
            </SelectItem>
            <SelectItem
              value="Eurasian National University"
              className="hover:bg-blue-50"
            >
              Eurasian National University
            </SelectItem>
            <SelectItem
              value="Kazakh Agro Technical University"
              className="hover:bg-blue-50"
            >
              Kazakh Agro Technical University
            </SelectItem>
            <SelectItem
              value="Astana Medical University"
              className="hover:bg-blue-50"
            >
              Astana Medical University
            </SelectItem>
            <SelectItem
              value="Kazakh University of Economics"
              className="hover:bg-blue-50"
            >
              Kazakh University of Economics
            </SelectItem>
            <SelectItem
              value="Kazakh Humanitarian Law University"
              className="hover:bg-blue-50"
            >
              Kazakh Humanitarian Law University
            </SelectItem>
            <SelectItem
              value="Kazakh University of Technology and Business"
              className="hover:bg-blue-50"
            >
              Kazakh University of Technology and Business
            </SelectItem>
            <SelectItem
              value="International University of Astana"
              className="hover:bg-blue-50"
            >
              International University of Astana
            </SelectItem>
            <SelectItem value="Other" className="hover:bg-blue-50">
              Other
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-8 flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="flex items-center border-gray-300 hover:bg-gray-50 shadow-sm"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Button
          type="button"
          onClick={nextStep}
          className="flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-200 shadow-md hover:shadow-lg px-6 py-2"
          disabled={!isValid}
        >
          Next: Features <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
