"use client";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useProfileStore } from "@/store/profileStore";
import { Progress } from "@/components/ui/progress";
import { z } from "zod";
import { useCreateApartment } from "@/hooks/apartments";
import { Apartment } from "@/types/apartments";
import { useRouter } from "next/navigation";
import BasicInfoStep from "@/components/apartment/createApartment/BasicInfoStep";
import LocationStep from "@/components/apartment/createApartment/LocationStep";
import FeaturesStep from "@/components/apartment/createApartment/FeaturesStep";
import PhotosStep from "@/components/apartment/createApartment/PhotosStep";
import TermsStep from "@/components/apartment/TermsStep";

const apartmentSchema = z.object({
  apartment_name: z
    .string()
    .min(3, { message: "Apartment name must be at least 3 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  price_per_month: z
    .number()
    .positive({ message: "Price must be a positive number" }),
  area: z.number().positive({ message: "Area must be a positive number" }),
  number_of_rooms: z
    .number()
    .positive({ message: "Number of rooms must be a positive number" }),
  max_users: z
    .number()
    .positive({ message: "Maximum users must be a positive number" }),
  address: z.object({
    street: z.string().min(3, { message: "Street is required" }),
    house_number: z.string().min(1, { message: "House number is required" }),
    apartment_number: z.string().optional(),
    entrance: z.string().optional(),
    has_intercom: z.boolean().optional(),
    landmark: z.string().optional(),
  }),
  district_name: z.string().min(1, { message: "District is required" }),
  contact_phone: z
    .string()
    .min(1, { message: "At least one contact method is required" }),
  contact_telegram: z
    .string()
    .min(1, { message: "At least one contact method is required" }),
});

export default function CreateApartmentPage() {
  const { profile } = useProfileStore();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("basic-info");
  const [formProgress, setFormProgress] = useState(0);
  const [previewImages, setPreviewImages] = useState<
    { url: string; file: File | null }[]
  >([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const router = useRouter();

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Tabs validation state
  const [tabsValid, setTabsValid] = useState({
    "basic-info": false,
    location: false,
    features: true, // Optional fields can be valid by default
    photos: false,
    terms: false,
  });

  // Мутация для создания апартаментов
  const createApartmentMutation = useCreateApartment({
    onSuccess: (data) => {
      toast.success("Apartment created successfully!", {
        position: "top-right",
        autoClose: 5000,
      });
      setIsSubmitting(false);
      router.push("/apartment");
    },
    onError: (error) => {
      toast.error(`Failed to create apartment: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
      setIsSubmitting(false);
    },
  });

  // Начальное состояние формы
  const [apartmentData, setApartmentData] = useState<Apartment>({
    apartment_name: "",
    description: "",
    address: {
      street: "",
      house_number: "",
      apartment_number: "",
      entrance: "",
      has_intercom: false,
      landmark: "",
    },
    district_name: "",
    latitude: 0,
    longitude: 0,
    price_per_month: 0,
    area: 0,
    kitchen_area: 0,
    floor: 0,
    number_of_rooms: 0,
    max_users: 0,
    available_from: new Date().toISOString().split("T")[0],
    available_until: new Date(Date.now() + 31536000000)
      .toISOString()
      .split("T")[0], // +1 год
    university_nearby: "none", // По умолчанию none
    pictures: [],
    is_promoted: false,
    is_pet_allowed: false,
    rental_type: "entire_apartment",
    roommate_preferences: "",
    included_utilities: [],
    rules: [],
    contact_phone: profile?.phone || "",
    contact_telegram: profile?.social_links?.telegram || "",
    is_active: true,
  });

  // Обработка изменений полей формы
  const handleChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setApartmentData({
        ...apartmentData,
        [parent]: {
          ...(apartmentData[parent as keyof typeof apartmentData] as Record<
            string,
            any
          >),
          [child]: value,
        },
      });
    } else {
      setApartmentData({
        ...apartmentData,
        [field]: value,
      });
    }

    // Clear validation error for the field when it changes
    if (validationErrors[field]) {
      setValidationErrors({
        ...validationErrors,
        [field]: "",
      });
    } else if (field.includes(".")) {
      const fullFieldName = field;
      if (validationErrors[fullFieldName]) {
        setValidationErrors({
          ...validationErrors,
          [fullFieldName]: "",
        });
      }
    }
  };

  // Навигация между шагами
  const nextStep = () => {
    const steps = ["basic-info", "location", "features", "photos", "terms"];
    const currentIndex = steps.indexOf(activeTab);

    if (currentIndex < steps.length - 1) {
      // Проверка валидности текущего шага перед переходом
      if (validateTab(activeTab)) {
        setActiveTab(steps[currentIndex + 1]);
      } else {
        // Показать тост с ошибками валидации
        toast.error("Please correct all errors before proceeding", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  const prevStep = () => {
    const steps = ["basic-info", "location", "features", "photos", "terms"];
    const currentIndex = steps.indexOf(activeTab);

    if (currentIndex > 0) {
      setActiveTab(steps[currentIndex - 1]);
    }
  };

  // Загрузка изображений
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Проверка размера файлов
    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB

    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        toast.error(`File "${file.name}" exceeds the 10MB limit`, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error(`File "${file.name}" is not an image`, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    const newImages: { url: string; file: File | null }[] = [...previewImages];

    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        newImages.push({ url: base64String, file });
        setPreviewImages([...newImages]);

        setApartmentData({
          ...apartmentData,
          pictures: newImages.map((img) => img.url), // base64 строки
        });

        if (validationErrors["pictures"]) {
          setValidationErrors({
            ...validationErrors,
            pictures: "",
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Удаление изображения
  const handleRemoveImage = (index: number) => {
    const newImages = [...previewImages];
    newImages.splice(index, 1);
    setPreviewImages(newImages);

    setApartmentData({
      ...apartmentData,
      pictures: newImages.map((img) => img.url),
    });

    // Check if we need to set validation error for photos
    if (newImages.length === 0) {
      setValidationErrors({
        ...validationErrors,
        pictures: "At least one photo is required",
      });
    }
  };

  // Проверка валидности вкладки
  const validateTab = (tab: string): boolean => {
    try {
      const newErrors: Record<string, string> = {};

      switch (tab) {
        case "basic-info":
          try {
            const basicData = {
              apartment_name: apartmentData.apartment_name,
              description: apartmentData.description,
              price_per_month: apartmentData.price_per_month,
              area: apartmentData.area,
              number_of_rooms: apartmentData.number_of_rooms,
              max_users: apartmentData.max_users,
            };

            // Using zod to validate and capture specific errors
            apartmentSchema
              .pick({
                apartment_name: true,
                description: true,
                price_per_month: true,
                area: true,
                number_of_rooms: true,
                max_users: true,
              })
              .parse(basicData);

            // Clear any existing errors for these fields
            Object.keys(basicData).forEach((field) => {
              if (validationErrors[field]) {
                newErrors[field] = "";
              }
            });
          } catch (error) {
            if (error instanceof z.ZodError) {
              error.errors.forEach((err) => {
                const field = err.path.join(".");
                newErrors[field] = err.message;
              });
            }
            setValidationErrors({ ...validationErrors, ...newErrors });
            return Object.keys(newErrors).length === 0;
          }
          return true;

        case "location":
          try {
            const locationData = {
              address: apartmentData.address,
              district_name: apartmentData.district_name,
            };

            apartmentSchema
              .pick({
                address: true,
                district_name: true,
              })
              .parse(locationData);

            // Clear existing errors
            if (validationErrors["district_name"]) {
              newErrors["district_name"] = "";
            }
            if (validationErrors["address.street"]) {
              newErrors["address.street"] = "";
            }
            if (validationErrors["address.house_number"]) {
              newErrors["address.house_number"] = "";
            }
          } catch (error) {
            if (error instanceof z.ZodError) {
              error.errors.forEach((err) => {
                const field = err.path.join(".");
                newErrors[field] = err.message;
              });
            }
            setValidationErrors({ ...validationErrors, ...newErrors });
            return Object.keys(newErrors).length === 0;
          }
          return true;

        case "features":
          return true; // Опциональные поля

        case "photos":
          if (apartmentData.pictures.length === 0) {
            newErrors["pictures"] = "At least one photo is required";
            setValidationErrors({ ...validationErrors, ...newErrors });
            return false;
          }
          return true;

        case "terms":
          try {
            apartmentSchema
              .pick({
                contact_phone: true,
                contact_telegram: true,
              })
              .refine(
                (data) =>
                  data.contact_phone.length > 0 ||
                  data.contact_telegram.length > 0,
                {
                  message: "At least one contact method is required",
                  path: ["contact"],
                },
              )
              .parse({
                contact_phone: apartmentData.contact_phone,
                contact_telegram: apartmentData.contact_telegram,
              });

            // Clear existing errors
            if (validationErrors["contact"]) {
              newErrors["contact"] = "";
            }
          } catch (error) {
            if (error instanceof z.ZodError) {
              error.errors.forEach((err) => {
                newErrors["contact"] = err.message;
              });
            }
            setValidationErrors({ ...validationErrors, ...newErrors });
            return Object.keys(newErrors).length === 0;
          }
          return true;

        default:
          return false;
      }
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  };

  // Обновление прогресса заполнения формы
  useEffect(() => {
    const validTabs = Object.entries(tabsValid).filter(
      ([_, isValid]) => isValid,
    ).length;
    const progress = Math.floor((validTabs / 5) * 100);
    setFormProgress(progress);
  }, [tabsValid]);

  // Проверка валидности текущей вкладки при изменении данных
  useEffect(() => {
    const isValid = validateTab(activeTab);
    setTabsValid({
      ...tabsValid,
      [activeTab]: isValid,
    });
  }, [apartmentData, activeTab]);

  const handleSubmit = async () => {
    // Проверка всех вкладок перед отправкой
    let isValid = true;
    const tabs = ["basic-info", "location", "features", "photos", "terms"];

    for (const tab of tabs) {
      if (!validateTab(tab)) {
        isValid = false;
        setActiveTab(tab);
        toast.error(
          `Please correct errors in the ${tab.replace("-", " ")} section`,
          {
            position: "top-right",
            autoClose: 3000,
          },
        );
        break;
      }
    }

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const base64Images = previewImages.map((image) => image.url);

      // Создаем данные для отправки
      const currentDate = new Date().toISOString();
      const submitData = {
        ...apartmentData,
        ownerId: profile?.userId,
        pictures: base64Images,
        created_at: currentDate,
        updated_at: currentDate,
      };

      console.log("Submitting apartment data:", submitData);

      // Вызываем мутацию
      createApartmentMutation.mutate(submitData as any);
    } catch (error) {
      console.error("Error creating apartment:", error);
      toast.error("An error occurred. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsSubmitting(false);
    }
  };
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
            <p className="text-gray-700">Creating your apartment listing...</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
            Create New Apartment Listing
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to list your apartment for rent
          </p>

          <div className="mt-6 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Completion Progress
              </span>
              <span className="text-sm font-medium text-gray-700">
                {formProgress}%
              </span>
            </div>
            <Progress value={formProgress} className="h-2 bg-gray-200" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Tabs
            defaultValue="basic-info"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-2 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger
                value="basic-info"
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  tabsValid["basic-info"]
                    ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-green-500 data-[state=active]:text-white"
                    : "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                }`}
              >
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="location"
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  tabsValid["location"]
                    ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-green-500 data-[state=active]:text-white"
                    : "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                }`}
              >
                Location
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  tabsValid["features"]
                    ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-green-500 data-[state=active]:text-white"
                    : "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                }`}
              >
                Features
              </TabsTrigger>
              <TabsTrigger
                value="photos"
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  tabsValid["photos"]
                    ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-green-500 data-[state=active]:text-white"
                    : "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                }`}
              >
                Photos
              </TabsTrigger>
              <TabsTrigger
                value="terms"
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  tabsValid["terms"]
                    ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-green-500 data-[state=active]:text-white"
                    : "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                }`}
              >
                Terms
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Step */}
            <TabsContent value="basic-info">
              <Card className="shadow-lg border-0 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Basic Information
                  </h2>
                  <BasicInfoStep
                    apartmentData={apartmentData}
                    handleChange={handleChange}
                    nextStep={nextStep}
                    isValid={tabsValid["basic-info"]}
                    validationErrors={validationErrors}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Location Step */}
            <TabsContent value="location">
              <Card className="shadow-lg border-0 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Location Details
                  </h2>
                  <LocationStep
                    apartmentData={apartmentData}
                    handleChange={handleChange}
                    nextStep={nextStep}
                    prevStep={prevStep}
                    isValid={tabsValid["location"]}
                    validationErrors={validationErrors}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features Step */}
            <TabsContent value="features">
              <Card className="shadow-lg border-0 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Features & Amenities
                  </h2>
                  <FeaturesStep
                    apartmentData={apartmentData}
                    handleChange={handleChange}
                    nextStep={nextStep}
                    prevStep={prevStep}
                    isValid={tabsValid["features"]}
                    validationErrors={validationErrors}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Photos Step */}
            <TabsContent value="photos">
              <Card className="shadow-lg border-0 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Photos
                  </h2>
                  <PhotosStep
                    apartmentData={apartmentData}
                    previewImages={previewImages}
                    handleImageUpload={handleImageUpload}
                    handleRemoveImage={handleRemoveImage}
                    nextStep={nextStep}
                    prevStep={prevStep}
                    isValid={tabsValid["photos"]}
                    validationErrors={validationErrors}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Terms Step */}
            <TabsContent value="terms">
              <Card className="shadow-lg border-0 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Contact & Terms
                  </h2>
                  <TermsStep
                    apartmentData={apartmentData}
                    handleChange={handleChange}
                    previewImages={previewImages}
                    prevStep={prevStep}
                    handleSubmit={handleSubmit}
                    isValid={tabsValid["terms"]}
                    isSubmitting={isSubmitting}
                    previewDialogOpen={previewDialogOpen}
                    setPreviewDialogOpen={setPreviewDialogOpen}
                    validationErrors={validationErrors}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
