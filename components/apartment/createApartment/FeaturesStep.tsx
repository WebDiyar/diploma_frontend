import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  ShieldAlert,
  Tag,
} from "lucide-react";
import { toast } from "react-toastify";
import { Apartment } from "@/types/apartments";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FeaturesStepProps {
  apartmentData: Apartment;
  handleChange: (field: string, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  isValid: boolean;
  validationErrors: Record<string, string>;
}

export default function FeaturesStep({
  apartmentData,
  handleChange,
  nextStep,
  prevStep,
  isValid,
  validationErrors,
}: FeaturesStepProps) {
  const [includeUtilityItem, setIncludeUtilityItem] = useState("");
  const [ruleItem, setRuleItem] = useState("");

  // Добавление included_utilities
  const handleAddUtility = () => {
    if (!includeUtilityItem.trim()) {
      toast.error("Please enter a utility to add", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (apartmentData.included_utilities.includes(includeUtilityItem.trim())) {
      toast.error("This utility is already in the list", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    handleChange("included_utilities", [
      ...apartmentData.included_utilities,
      includeUtilityItem.trim(),
    ]);
    setIncludeUtilityItem("");
  };

  // Удаление included_utilities
  const handleRemoveUtility = (index: number) => {
    const newUtilities = [...apartmentData.included_utilities];
    newUtilities.splice(index, 1);
    handleChange("included_utilities", newUtilities);
  };

  // Добавление правила
  const handleAddRule = () => {
    if (!ruleItem.trim()) {
      toast.error("Please enter a rule to add", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (apartmentData.rules.includes(ruleItem.trim())) {
      toast.error("This rule is already in the list", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    handleChange("rules", [...apartmentData.rules, ruleItem.trim()]);
    setRuleItem("");
  };

  // Удаление правила
  const handleRemoveRule = (index: number) => {
    const newRules = [...apartmentData.rules];
    newRules.splice(index, 1);
    handleChange("rules", newRules);
  };

  // Common utility suggestions
  const utilityOptions = [
    "Water",
    "Electricity",
    "Gas",
    "Internet",
    "WiFi",
    "Cable TV",
    "Heating",
    "Air Conditioning",
    "Garbage Collection",
    "Parking",
  ];

  // Common house rule suggestions
  const ruleOptions = [
    "No smoking",
    "No parties",
    "No pets",
    "Quiet hours after 10 PM",
    "No shoes inside",
    "Clean up common areas after use",
    "No overnight guests",
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <Label
            htmlFor="available_from"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Available From
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="available_from"
              type="date"
              value={apartmentData.available_from}
              onChange={(e) => handleChange("available_from", e.target.value)}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pl-10"
            />
          </div>
        </div>

        <div className="relative">
          <Label
            htmlFor="available_until"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Available Until
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="available_until"
              type="date"
              value={apartmentData.available_until}
              onChange={(e) => handleChange("available_until", e.target.value)}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pl-10"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 flex items-center space-x-3">
        <Switch
          id="is_pet_allowed"
          checked={apartmentData.is_pet_allowed}
          onCheckedChange={(checked) => handleChange("is_pet_allowed", checked)}
          className="data-[state=checked]:bg-blue-500"
        />
        <div>
          <Label
            htmlFor="is_pet_allowed"
            className="cursor-pointer font-medium text-blue-900"
          >
            Pets Allowed
          </Label>
          <p className="text-sm text-blue-700">
            Allow tenants to bring their pets
          </p>
        </div>
      </div>

      <div>
        <Label
          htmlFor="roommate_preferences"
          className="text-sm font-medium text-gray-700 mb-1 block"
        >
          Roommate Preferences
        </Label>
        <Textarea
          id="roommate_preferences"
          placeholder="Describe your ideal roommate or tenant. For example: students, professionals, non-smokers, etc."
          value={apartmentData.roommate_preferences}
          onChange={(e) => handleChange("roommate_preferences", e.target.value)}
          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-24"
        />
      </div>

      <Separator className="my-6" />

      {/* Included Utilities */}
      <div>
        <div className="flex items-center mb-4 space-x-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <Label className="text-lg font-medium text-gray-800">
            Included Utilities
          </Label>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <Input
                placeholder="Enter utility (e.g. Water, Electricity, Internet)"
                value={includeUtilityItem}
                onChange={(e) => setIncludeUtilityItem(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddUtility();
                  }
                }}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    aria-label="Show suggestions"
                  >
                    <Tag className="h-4 w-4 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Common utilities:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {utilityOptions.map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 bg-gray-50 hover:bg-blue-50"
                        onClick={() => setIncludeUtilityItem(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Button
              onClick={handleAddUtility}
              type="button"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {apartmentData.included_utilities.length > 0 ? (
            <div className="space-y-2 mt-3">
              {apartmentData.included_utilities.map((utility, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-blue-50 p-3 rounded-md border border-blue-100 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{utility}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUtility(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm mt-2 bg-gray-50 p-4 rounded-md border border-dashed border-gray-300">
              No utilities added yet. Add utilities that are included in the
              rent.
            </div>
          )}
        </div>
      </div>

      <Separator className="my-6" />

      {/* House Rules */}
      <div>
        <div className="flex items-center mb-4 space-x-2">
          <ShieldAlert className="h-5 w-5 text-blue-500" />
          <Label className="text-lg font-medium text-gray-800">
            House Rules
          </Label>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <Input
                placeholder="Enter a house rule"
                value={ruleItem}
                onChange={(e) => setRuleItem(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRule();
                  }
                }}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    aria-label="Show suggestions"
                  >
                    <Tag className="h-4 w-4 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Common rules:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ruleOptions.map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 bg-gray-50 hover:bg-blue-50"
                        onClick={() => setRuleItem(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Button
              onClick={handleAddRule}
              type="button"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {apartmentData.rules.length > 0 ? (
            <div className="space-y-2 mt-3">
              {apartmentData.rules.map((rule, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-red-50 p-3 rounded-md border border-red-100 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{rule}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRule(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm mt-2 bg-gray-50 p-4 rounded-md border border-dashed border-gray-300">
              No rules added yet. Add important rules for your tenants.
            </div>
          )}
        </div>
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
        >
          Next: Photos <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
