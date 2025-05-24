import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Phone,
  MessageCircle,
  MapPin,
  Eye,
  Star,
  Sparkles,
  ShieldAlert,
  BellRing,
} from "lucide-react";
import { Apartment } from "@/types/apartments";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Image } from "lucide-react";

interface TermsStepProps {
  apartmentData: Apartment;
  handleChange: (field: string, value: any) => void;
  previewImages: { url: string; file: File | null }[];
  prevStep: () => void;
  handleSubmit: () => void;
  isValid: boolean;
  isSubmitting: boolean;
  previewDialogOpen: boolean;
  setPreviewDialogOpen: (open: boolean) => void;
  validationErrors: Record<string, string>;
}

export default function TermsStep({
  apartmentData,
  handleChange,
  previewImages,
  prevStep,
  handleSubmit,
  isValid,
  isSubmitting,
  previewDialogOpen,
  setPreviewDialogOpen,
  validationErrors,
}: TermsStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label
            htmlFor="contact_phone"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Contact Phone*
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="contact_phone"
              placeholder="+7 (XXX) XXX-XXXX"
              value={apartmentData.contact_phone}
              onChange={(e) => handleChange("contact_phone", e.target.value)}
              className={`pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                validationErrors.contact
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
            />
          </div>
        </div>

        <div>
          <Label
            htmlFor="contact_telegram"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Telegram Username
          </Label>
          <div className="relative">
            <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="contact_telegram"
              placeholder="@username"
              value={apartmentData.contact_telegram}
              onChange={(e) => handleChange("contact_telegram", e.target.value)}
              className={`pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                validationErrors.contact
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
            />
          </div>
        </div>
      </div>

      {validationErrors.contact && (
        <div className="text-red-500 flex items-center text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {validationErrors.contact}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-8 h-8 rounded-full flex items-center justify-center">
              <Star className="h-4 w-4 text-white" />
            </div>
          </div>
          <div>
            <div className="space-x-2 flex items-center">
              <Switch
                id="is_promoted"
                checked={apartmentData.is_promoted}
                onCheckedChange={(checked) =>
                  handleChange("is_promoted", checked)
                }
                className="data-[state=checked]:bg-purple-500"
              />
              <Label
                htmlFor="is_promoted"
                className="cursor-pointer font-medium text-gray-900"
              >
                Promote Listing
              </Label>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Get 5x more views and priority placement in search results
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-8 h-8 rounded-full flex items-center justify-center">
              <BellRing className="h-4 w-4 text-white" />
            </div>
          </div>
          <div>
            <div className="space-x-2 flex items-center">
              <Switch
                id="is_active"
                checked={apartmentData.is_active}
                onCheckedChange={(checked) =>
                  handleChange("is_active", checked)
                }
                className="data-[state=checked]:bg-green-500"
              />
              <Label
                htmlFor="is_active"
                className="cursor-pointer font-medium text-gray-900"
              >
                Active Listing
              </Label>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Your listing will be visible to users immediately after creation
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-gray-300 h-12 font-medium"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Listing
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl text-center">
              Listing Preview
            </DialogTitle>
            <DialogDescription className="text-center">
              This is how your listing will appear to potential tenants
            </DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                {previewImages.length > 0 ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video shadow-lg border border-gray-200">
                    <img
                      src={previewImages[0].url}
                      alt={apartmentData.apartment_name}
                      className="w-full h-full object-cover"
                    />
                    {previewImages.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white text-sm px-3 py-1 rounded-full font-medium">
                        +{previewImages.length - 1} photos
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-200 rounded-xl aspect-video flex items-center justify-center shadow-md">
                    <Image className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                {apartmentData.apartment_name || "Apartment Title"}
              </h2>

              <div className="flex items-center text-gray-600 mt-2">
                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                <span>
                  {apartmentData.address.street}, {apartmentData.district_name}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 my-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <span className="block text-gray-500 text-sm">Price</span>
                  <span className="font-bold text-2xl text-gray-900">
                    {apartmentData.price_per_month
                      ? `₸${apartmentData.price_per_month.toLocaleString()}`
                      : "N/A"}
                  </span>
                  <span className="text-gray-500">/month</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <span className="block text-gray-500 text-sm">Area</span>
                  <span className="font-bold text-2xl text-gray-900">
                    {apartmentData.area ? `${apartmentData.area}` : "N/A"}
                  </span>
                  <span className="text-gray-500">m²</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <span className="block text-gray-500 text-sm">Rooms</span>
                  <span className="font-bold text-2xl text-gray-900">
                    {apartmentData.number_of_rooms || "N/A"}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                  <span className="bg-blue-100 p-1 rounded-md text-blue-500 mr-2">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  Description
                </h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {apartmentData.description || "No description provided"}
                </p>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                  <span className="bg-purple-100 p-1 rounded-md text-purple-500 mr-2">
                    <MapPin className="h-4 w-4" />
                  </span>
                  Details
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <span className="w-32 text-gray-500">Type:</span>
                    <span className="font-medium">
                      {apartmentData.rental_type === "entire_apartment"
                        ? "Entire Apartment"
                        : apartmentData.rental_type === "private_room"
                          ? "Private Room"
                          : "Shared Room"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-gray-500">Max Occupancy:</span>
                    <span className="font-medium">
                      {apartmentData.max_users || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-gray-500">Floor:</span>
                    <span className="font-medium">
                      {apartmentData.floor || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-gray-500">Kitchen Area:</span>
                    <span className="font-medium">
                      {apartmentData.kitchen_area
                        ? `${apartmentData.kitchen_area} m²`
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-gray-500">Pets Allowed:</span>
                    <span className="font-medium">
                      {apartmentData.is_pet_allowed ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-gray-500">Available:</span>
                    <span className="font-medium">
                      {apartmentData.available_from
                        ? new Date(
                            apartmentData.available_from,
                          ).toLocaleDateString()
                        : "Not specified"}
                    </span>
                  </div>
                </div>
              </div>

              {apartmentData.included_utilities.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                    <span className="bg-green-100 p-1 rounded-md text-green-500 mr-2">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    Included Utilities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {apartmentData.included_utilities.map((utility, index) => (
                      <span
                        key={index}
                        className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm border border-green-100"
                      >
                        {utility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {apartmentData.rules.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                    <span className="bg-red-100 p-1 rounded-md text-red-500 mr-2">
                      <ShieldAlert className="h-4 w-4" />
                    </span>
                    House Rules
                  </h3>
                  <ul className="bg-red-50 p-4 rounded-lg border border-red-100 space-y-2">
                    {apartmentData.rules.map((rule, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {apartmentData.roommate_preferences && (
                <div className="mt-8">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">
                    Roommate Preferences
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {apartmentData.roommate_preferences}
                  </p>
                </div>
              )}

              <div className="mt-8">
                <h3 className="font-semibold text-lg text-gray-900 mb-3">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apartmentData.contact_phone && (
                    <div className="flex items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="mr-3 bg-blue-100 p-2 rounded-full">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-blue-700">Phone:</div>
                        <div className="font-medium">
                          {apartmentData.contact_phone}
                        </div>
                      </div>
                    </div>
                  )}

                  {apartmentData.contact_telegram && (
                    <div className="flex items-center bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                      <div className="mr-3 bg-indigo-100 p-2 rounded-full">
                        <MessageCircle className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-sm text-indigo-700">Telegram:</div>
                        <div className="font-medium">
                          {apartmentData.contact_telegram}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setPreviewDialogOpen(false)}
            >
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-md font-semibold text-blue-800">
              Before you publish
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Ensure all information provided is accurate and up-to-date
                </li>
                <li>
                  You'll be notified when someone is interested in your listing
                </li>
                <li>You can edit or deactivate your listing at any time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="flex items-center border-gray-300 hover:bg-gray-50 shadow-sm"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreviewDialogOpen(true)}
            className="border-gray-300 hover:bg-gray-50 shadow-sm"
          >
            <Eye className="mr-2 h-4 w-4" /> Preview Listing
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all duration-200 shadow-md hover:shadow-lg px-6 py-2"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" /> Publish Listing
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
