import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ChevronLeft,
  Trash2,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Star,
} from "lucide-react";
import { Apartment } from "@/types/apartments";
import { toast } from "react-toastify";

interface PhotosStepProps {
  apartmentData: Apartment;
  previewImages: { url: string; file: File | null }[];
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  isValid: boolean;
  validationErrors: Record<string, string>;
}

export default function PhotosStep({
  apartmentData,
  previewImages,
  handleImageUpload,
  handleRemoveImage,
  nextStep,
  prevStep,
  isValid,
  validationErrors,
}: PhotosStepProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  // Handle drag and drop functionality
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileInput = imageInputRef.current;
      if (fileInput) {
        fileInput.files = e.dataTransfer.files;
        const event = new Event("change", { bubbles: true });
        fileInput.dispatchEvent(event);
      }
    }
  };

  const generatePlaceholderUrl = (index: number) => {
    return `https://picsum.photos/800/600?random=${Date.now()}-${index}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium text-gray-700 block mb-2">
          Upload Apartment Photos*
        </Label>

        <div
          className={`border-2 border-dashed ${dragging ? "border-blue-500 bg-blue-50" : validationErrors.pictures ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-blue-400"} rounded-md p-8 text-center transition-colors duration-200`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />

          <div className="space-y-4">
            <div className="mx-auto h-16 w-16 text-gray-400 flex items-center justify-center bg-gray-100 rounded-full">
              <ImageIcon className="h-8 w-8" />
            </div>
            <div className="text-gray-600">
              <p className="font-medium">Drop your images here, or</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => imageInputRef.current?.click()}
                className="relative mt-2 hover:bg-blue-50 border-blue-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                Browse for files
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              PNG, JPG, GIF up to 10MB. First uploaded image will be the main
              photo.
            </p>
          </div>
        </div>

        {validationErrors.pictures && (
          <div className="mt-2 text-red-500 flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {validationErrors.pictures}
          </div>
        )}
      </div>

      {/* Превью изображений */}
      {previewImages.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <Label className="text-sm font-medium text-gray-700 block">
              Preview ({previewImages.length} photos)
            </Label>

            <div className="text-sm text-blue-600">
              <span className="font-medium">Tip:</span> The first photo will be
              featured in search results
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3">
            {previewImages.map((image, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden shadow-md border border-gray-200 transition-all duration-200 hover:shadow-lg"
              >
                <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                  <img
                    src={image.url}
                    alt={`Apartment preview ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-0 group-hover:opacity-60 transition-opacity duration-200"></div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8"
                  onClick={() => handleRemoveImage(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Main Photo
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm flex items-center p-4 bg-blue-50 rounded-md text-blue-700">
            <div className="mr-3 text-blue-500 bg-blue-100 rounded-full p-1">
              <Star className="h-4 w-4" />
            </div>
            <p>
              Quality photos increase interest by 80%. Use well-lit images that
              showcase your apartment's best features.
            </p>
          </div>
        </div>
      )}

      {previewImages.length === 0 && (
        <div className="bg-yellow-50 p-4 rounded-md border-l-4 border-yellow-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Attention</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Apartments with photos get 10x more inquiries. Please add at
                  least one photo of your property.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
          Next: Terms <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
