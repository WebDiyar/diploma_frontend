"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Edit,
  Save,
  X,
  MapPin,
  Calendar,
  Home,
  Ruler,
  Users,
  Star,
  Eye,
  ArrowLeft,
  Upload,
  Trash2,
  Plus,
  Shield,
  CheckCircle,
  ZoomIn,
  Building2,
  Phone,
  MessageCircle,
  Settings,
  Navigation,
  DollarSign,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Activity,
  AlertCircle,
  Wifi,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useApartment, useUpdateApartment } from "@/hooks/apartments";
import {
  useApartmentStore,
  useLoadApartment,
  useSaveApartment,
} from "@/store/apartmentStore";
import { Apartment } from "@/types/apartments";

// Компонент статистики
const StatsCard = ({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}) => (
  <div
    className={`${bgColor} rounded-xl p-4 flex items-center space-x-3 transition-all duration-200 hover:shadow-md`}
  >
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

// Функции форматирования
const getImageUrl = (url: string) => {
  if (url?.startsWith("data:image")) {
    return url;
  }

  if (url?.startsWith("http://") || url?.startsWith("https://")) {
    if (url.includes("example.com")) {
      return `https://source.unsplash.com/random/800x600/?apartment&sig=${Math.random()}`;
    }
    return url;
  }

  if (url && url.length > 100 && url.match(/^[A-Za-z0-9+/=]+$/)) {
    return `data:image/jpeg;base64,${url}`;
  }

  return "https://source.unsplash.com/random/800x600/?apartment";
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("kk-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ApartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const apartmentId = params.id as string;

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewImages, setPreviewImages] = useState<
    { url: string; file: File | null }[]
  >([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newUtilityItem, setNewUtilityItem] = useState("");
  const [newRuleItem, setNewRuleItem] = useState("");

  const {
    apartment,
    editedApartment,
    isEditing,
    loading,
    error,
    startEditing,
    cancelEditing,
    updateField,
    hasChanges,
    getFullApartmentData,
  } = useApartmentStore();

  const { loadApartment } = useLoadApartment();
  const { saveChanges } = useSaveApartment();

  const {
    data: apartmentData,
    isLoading: isLoadingApartment,
    isError,
    error: fetchError,
  } = useApartment(apartmentId, {
    enabled: !!apartmentId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (apartmentData) {
      useApartmentStore.getState().setApartment(apartmentData);

      if (apartmentData.pictures && apartmentData.pictures.length > 0) {
        const imagesPreviews = apartmentData.pictures.map((url) => ({
          url: getImageUrl(url),
          file: null,
        }));
        setPreviewImages(imagesPreviews);
      }
    }
  }, [apartmentData]);

  // Мутация для обновления апартамента
  const updateMutation = useUpdateApartment({
    onSuccess: (data) => {
      toast.success("🎉 Apartment updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      useApartmentStore.getState().saveApartmentSuccess(data);
    },
    onError: (error) => {
      toast.error(`❌ Failed to update apartment: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });

  const handleSaveChanges = async () => {
    if (!hasChanges()) {
      toast.info("No changes to save", {
        position: "top-right",
        autoClose: 3000,
      });
      cancelEditing();
      return;
    }

    if (!apartmentId) {
      toast.error("Apartment ID is missing", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsSaving(true);

    try {
      const fullData = getFullApartmentData();

      // Generate HTTP URLs instead of base64
      const httpImageUrls = previewImages.map(
        (_, index) =>
          `https://picsum.photos/800/600?random=${Date.now()}-${index}`,
      );

      const dataToSend = {
        ...fullData,
        apartmentId: apartmentId,
        ownerId: fullData.ownerId || apartmentData?.ownerId || "",
        pictures: httpImageUrls,
      };

      console.log("Sending data to API:", dataToSend);

      await updateMutation.mutateAsync({
        apartmentId,
        apartmentData: dataToSend,
      });
    } catch (error) {
      console.error("Failed to update apartment:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024;

    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        toast.error(`File "${file.name}" exceeds the 10MB limit`);
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error(`File "${file.name}" is not an image`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    const newImages = [...previewImages];

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        newImages.push({ url: base64String, file });
        setPreviewImages([...newImages]);

        // Generate HTTP URLs for backend
        const httpUrls = newImages.map(
          (_, idx) =>
            `https://picsum.photos/800/600?random=${Date.now()}-${idx}`,
        );

        updateField("pictures", httpUrls);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...previewImages];
    newImages.splice(index, 1);
    setPreviewImages(newImages);

    // Generate HTTP URLs for backend
    const httpUrls = newImages.map(
      (_, idx) => `https://picsum.photos/800/600?random=${Date.now()}-${idx}`,
    );

    updateField("pictures", httpUrls);

    if (currentImageIndex >= newImages.length && newImages.length > 0) {
      setCurrentImageIndex(newImages.length - 1);
    } else if (newImages.length === 0) {
      setCurrentImageIndex(0);
    }
  };

  // Добавление утилиты
  const handleAddUtility = () => {
    if (!newUtilityItem.trim()) return;

    const currentUtilities = editedApartment?.included_utilities || [];
    if (currentUtilities.includes(newUtilityItem.trim())) {
      toast.error("This utility is already in the list");
      return;
    }

    updateField("included_utilities", [
      ...currentUtilities,
      newUtilityItem.trim(),
    ]);
    setNewUtilityItem("");
  };

  // Удаление утилиты
  const handleRemoveUtility = (index: number) => {
    const currentUtilities = editedApartment?.included_utilities || [];
    const newUtilities = [...currentUtilities];
    newUtilities.splice(index, 1);
    updateField("included_utilities", newUtilities);
  };

  // Добавление правила
  const handleAddRule = () => {
    if (!newRuleItem.trim()) return;

    const currentRules = editedApartment?.rules || [];
    if (currentRules.includes(newRuleItem.trim())) {
      toast.error("This rule is already in the list");
      return;
    }

    updateField("rules", [...currentRules, newRuleItem.trim()]);
    setNewRuleItem("");
  };

  // Удаление правила
  const handleRemoveRule = (index: number) => {
    const currentRules = editedApartment?.rules || [];
    const newRules = [...currentRules];
    newRules.splice(index, 1);
    updateField("rules", newRules);
  };

  // Обработка изменений адреса
  const handleAddressChange = (field: string, value: any) => {
    const currentAddress = editedApartment?.address ||
      apartment?.address || {
        street: "",
        house_number: "",
        apartment_number: "",
        entrance: "",
        has_intercom: false,
        landmark: "",
      };

    updateField("address", {
      ...currentAddress,
      [field]: value,
    });
  };

  // Состояния загрузки и ошибок
  if (isLoadingApartment || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Loading Property
          </h3>
          <p className="text-gray-600">
            Please wait while we fetch the apartment details...
          </p>
        </div>
      </div>
    );
  }

  if (isError || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-rose-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to Load Property
          </h3>
          <p className="text-gray-600 mb-6">
            We couldn't load the apartment details. Please try again.
          </p>
          <Button
            onClick={() => router.back()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!apartment && !apartmentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/30 to-slate-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Property Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The apartment you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const currentApartment = isEditing ? editedApartment : apartment;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="mt-16"
      />

      {isSaving && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm mx-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Saving Changes
            </h3>
            <p className="text-gray-600 text-center">
              Please wait while we update your property...
            </p>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center border-gray-200 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {currentApartment?.apartment_name || "Property Details"}
                </h1>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                  <span className="text-sm truncate">
                    {currentApartment?.district_name},{" "}
                    {currentApartment?.address?.street}
                  </span>
                </div>
              </div>
            </div>

            {!isEditing ? (
              <Button
                onClick={startEditing}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Property
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={isSaving}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  disabled={isSaving || !hasChanges()}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={DollarSign}
            label="Monthly Price"
            value={
              currentApartment?.price_per_month
                ? formatPrice(currentApartment.price_per_month)
                : "N/A"
            }
            color="bg-gradient-to-r from-green-500 to-emerald-500"
            bgColor="bg-green-50"
          />
          <StatsCard
            icon={Ruler}
            label="Total Area"
            value={
              currentApartment?.area ? `${currentApartment.area} m²` : "N/A"
            }
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            bgColor="bg-blue-50"
          />
          <StatsCard
            icon={Home}
            label="Rooms"
            value={currentApartment?.number_of_rooms || "N/A"}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            bgColor="bg-purple-50"
          />
          <StatsCard
            icon={Users}
            label="Max Occupancy"
            value={currentApartment?.max_users || "N/A"}
            color="bg-gradient-to-r from-amber-500 to-orange-500"
            bgColor="bg-amber-50"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="xl:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card className="overflow-hidden border-0 shadow-2xl">
              <CardContent className="p-0">
                {previewImages.length > 0 ? (
                  <div>
                    <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={previewImages[currentImageIndex]?.url}
                        alt={`Property image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                      {/* Status badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {currentApartment?.is_promoted && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <Badge
                          className={`shadow-lg border-0 ${
                            currentApartment?.is_active
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                              : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                          }`}
                        >
                          {currentApartment?.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {/* Full screen button */}
                      <div className="absolute top-4 right-4">
                        <Dialog
                          open={imageDialogOpen}
                          onOpenChange={setImageDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="bg-black/50 hover:bg-black/70 text-white border-0"
                            >
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl w-full h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>Property Gallery</DialogTitle>
                            </DialogHeader>
                            <div className="relative flex-1">
                              <img
                                src={previewImages[currentImageIndex]?.url}
                                alt={`Property image ${currentImageIndex + 1}`}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Navigation arrows */}
                      {previewImages.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                            onClick={() =>
                              setCurrentImageIndex((prev) =>
                                prev === 0
                                  ? previewImages.length - 1
                                  : prev - 1,
                              )
                            }
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                            onClick={() =>
                              setCurrentImageIndex((prev) =>
                                prev === previewImages.length - 1
                                  ? 0
                                  : prev + 1,
                              )
                            }
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </>
                      )}

                      {/* Image counter */}
                      {previewImages.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {previewImages.length}
                        </div>
                      )}
                    </div>

                    {/* Thumbnail gallery */}
                    {previewImages.length > 1 && (
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {previewImages.map((image, index) => (
                            <div key={index} className="relative flex-shrink-0">
                              <button
                                onClick={() => setCurrentImageIndex(index)}
                                className={`relative w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-200 ${
                                  currentImageIndex === index
                                    ? "border-blue-500 shadow-lg scale-105"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <img
                                  src={image.url}
                                  alt={`Thumbnail ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                              {isEditing && (
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full shadow-lg"
                                  onClick={() => handleRemoveImage(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}

                          {isEditing && (
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                            >
                              <Plus className="h-6 w-6 text-gray-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    {isEditing ? (
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Add Property Photos
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Upload high-quality images to showcase your property
                        </p>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Images
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          No Images Available
                        </h3>
                        <p className="text-gray-500">
                          Images will be displayed here once uploaded
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Essential details about the property
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="apartment_name"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Property Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id="apartment_name"
                        value={editedApartment?.apartment_name || ""}
                        onChange={(e) =>
                          updateField("apartment_name", e.target.value)
                        }
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-4 py-3 rounded-lg border border-gray-100">
                        {currentApartment?.apartment_name || "Not provided"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="rental_type"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Rental Type
                    </Label>
                    {isEditing ? (
                      <Select
                        value={editedApartment?.rental_type || ""}
                        onValueChange={(value) =>
                          updateField("rental_type", value)
                        }
                      >
                        <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white">
                          <SelectValue placeholder="Select rental type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entire_apartment">
                            Entire Apartment
                          </SelectItem>
                          <SelectItem value="private_room">
                            Private Room
                          </SelectItem>
                          <SelectItem value="shared_room">
                            Shared Room
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-4 py-3 rounded-lg border border-gray-100 capitalize">
                        {currentApartment?.rental_type?.replace("_", " ") ||
                          "Not provided"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Description
                  </Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={editedApartment?.description || ""}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      className="min-h-32 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      placeholder="Describe your property..."
                    />
                  ) : (
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-4 py-3 rounded-lg border border-gray-100 min-h-32">
                      {currentApartment?.description ||
                        "No description provided"}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="price_per_month"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Monthly Price
                    </Label>
                    {isEditing ? (
                      <div className="relative">
                        <Input
                          id="price_per_month"
                          type="number"
                          value={editedApartment?.price_per_month || ""}
                          onChange={(e) =>
                            updateField(
                              "price_per_month",
                              Number(e.target.value),
                            )
                          }
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white pl-12"
                        />
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50/30 px-4 py-3 rounded-lg border border-green-100 font-bold text-green-700">
                        {currentApartment?.price_per_month
                          ? formatPrice(currentApartment.price_per_month)
                          : "Not provided"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="area"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Area (m²)
                    </Label>
                    {isEditing ? (
                      <Input
                        id="area"
                        type="number"
                        value={editedApartment?.area || ""}
                        onChange={(e) =>
                          updateField("area", Number(e.target.value))
                        }
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 px-4 py-3 rounded-lg border border-blue-100 font-semibold text-blue-700">
                        {currentApartment?.area
                          ? `${currentApartment.area} m²`
                          : "Not provided"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="number_of_rooms"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Rooms
                    </Label>
                    {isEditing ? (
                      <Input
                        id="number_of_rooms"
                        type="number"
                        value={editedApartment?.number_of_rooms || ""}
                        onChange={(e) =>
                          updateField("number_of_rooms", Number(e.target.value))
                        }
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50/30 px-4 py-3 rounded-lg border border-purple-100 font-semibold text-purple-700">
                        {currentApartment?.number_of_rooms || "Not provided"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="max_users"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Max Occupancy
                    </Label>
                    {isEditing ? (
                      <Input
                        id="max_users"
                        type="number"
                        value={editedApartment?.max_users || ""}
                        onChange={(e) =>
                          updateField("max_users", Number(e.target.value))
                        }
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50/30 px-4 py-3 rounded-lg border border-amber-100 font-semibold text-amber-700">
                        {currentApartment?.max_users || "Not provided"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="kitchen_area"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Kitchen Area (m²)
                    </Label>
                    {isEditing ? (
                      <Input
                        id="kitchen_area"
                        type="number"
                        value={editedApartment?.kitchen_area || ""}
                        onChange={(e) =>
                          updateField("kitchen_area", Number(e.target.value))
                        }
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-4 py-3 rounded-lg border border-gray-100">
                        {currentApartment?.kitchen_area
                          ? `${currentApartment.kitchen_area} m²`
                          : "Not provided"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="floor"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Floor
                    </Label>
                    {isEditing ? (
                      <Input
                        id="floor"
                        type="number"
                        value={editedApartment?.floor || ""}
                        onChange={(e) =>
                          updateField("floor", Number(e.target.value))
                        }
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-4 py-3 rounded-lg border border-gray-100">
                        {currentApartment?.floor || "Not provided"}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
              <CardHeader className="bg-gradient-to-r from-green-50/50 to-emerald-50/50">
                <CardTitle className="flex items-center">
                  <Navigation className="h-5 w-5 mr-2 text-green-600" />
                  Location Details
                </CardTitle>
                <CardDescription>
                  Address and location information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="street"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Street
                    </Label>
                    {isEditing ? (
                      <Input
                        id="street"
                        value={editedApartment?.address?.street || ""}
                        onChange={(e) =>
                          handleAddressChange("street", e.target.value)
                        }
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-gray-50 to-green-50/30 px-4 py-3 rounded-lg border border-gray-100">
                        {currentApartment?.address?.street || "Not provided"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="house_number"
                      className="text-sm font-semibold text-gray-700"
                    >
                      House Number
                    </Label>
                    {isEditing ? (
                      <Input
                        id="house_number"
                        value={editedApartment?.address?.house_number || ""}
                        onChange={(e) =>
                          handleAddressChange("house_number", e.target.value)
                        }
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-gray-50 to-green-50/30 px-4 py-3 rounded-lg border border-gray-100">
                        {currentApartment?.address?.house_number ||
                          "Not provided"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="apartment_number"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Apartment Number
                    </Label>
                    {isEditing ? (
                      <Input
                        id="apartment_number"
                        value={editedApartment?.address?.apartment_number || ""}
                        onChange={(e) =>
                          handleAddressChange(
                            "apartment_number",
                            e.target.value,
                          )
                        }
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-gray-50 to-green-50/30 px-4 py-3 rounded-lg border border-gray-100">
                        {currentApartment?.address?.apartment_number ||
                          "Not provided"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="entrance"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Entrance
                    </Label>
                    {isEditing ? (
                      <Input
                        id="entrance"
                        value={editedApartment?.address?.entrance || ""}
                        onChange={(e) =>
                          handleAddressChange("entrance", e.target.value)
                        }
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-gray-50 to-green-50/30 px-4 py-3 rounded-lg border border-gray-100">
                        {currentApartment?.address?.entrance || "Not provided"}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-end">
                    {isEditing ? (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Switch
                          id="has_intercom"
                          checked={
                            editedApartment?.address?.has_intercom || false
                          }
                          onCheckedChange={(checked) =>
                            handleAddressChange("has_intercom", checked)
                          }
                        />
                        <Label
                          htmlFor="has_intercom"
                          className="text-sm font-medium"
                        >
                          Has Intercom
                        </Label>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-gray-50 to-green-50/30 px-4 py-3 rounded-lg border border-gray-100">
                        <div className="flex items-center">
                          {currentApartment?.address?.has_intercom ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400 mr-2" />
                          )}
                          Intercom:{" "}
                          {currentApartment?.address?.has_intercom
                            ? "Available"
                            : "Not Available"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="district_name"
                      className="text-sm font-semibold text-gray-700"
                    >
                      District
                    </Label>
                    {isEditing ? (
                      <Select
                        value={editedApartment?.district_name || ""}
                        onValueChange={(value) =>
                          updateField("district_name", value)
                        }
                      >
                        <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white">
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Esil">Esil District</SelectItem>
                          <SelectItem value="Almaty">
                            Almaty District
                          </SelectItem>
                          <SelectItem value="Saryarka">
                            Saryarka District
                          </SelectItem>
                          <SelectItem value="Baikonur">
                            Baikonur District
                          </SelectItem>
                          <SelectItem value="Nura">Nura District</SelectItem>
                          <SelectItem value="Downtown">Downtown</SelectItem>
                          <SelectItem value="University Area">
                            University Area
                          </SelectItem>
                          <SelectItem value="Left Bank">Left Bank</SelectItem>
                          <SelectItem value="Right Bank">Right Bank</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="bg-gradient-to-r from-gray-50 to-green-50/30 px-4 py-3 rounded-lg border border-gray-100">
                        {currentApartment?.district_name || "Not provided"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="university_nearby"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Nearby University
                    </Label>
                    {isEditing ? (
                      <Select
                        value={editedApartment?.university_nearby || ""}
                        onValueChange={(value) =>
                          updateField("university_nearby", value)
                        }
                      >
                        <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white">
                          <SelectValue placeholder="Select university" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not applicable</SelectItem>
                          <SelectItem value="Astana IT University">
                            Astana IT University (AITU)
                          </SelectItem>
                          <SelectItem value="Nazarbayev University">
                            Nazarbayev University
                          </SelectItem>
                          <SelectItem value="Eurasian National University">
                            Eurasian National University
                          </SelectItem>
                          <SelectItem value="Kazakh Agro Technical University">
                            Kazakh Agro Technical University
                          </SelectItem>
                          <SelectItem value="Astana Medical University">
                            Astana Medical University
                          </SelectItem>
                          <SelectItem value="Kazakh University of Economics">
                            Kazakh University of Economics
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="bg-gradient-to-r from-gray-50 to-green-50/30 px-4 py-3 rounded-lg border border-gray-100">
                        {currentApartment?.university_nearby === "none"
                          ? "Not applicable"
                          : currentApartment?.university_nearby ||
                            "Not provided"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="landmark"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Landmark
                  </Label>
                  {isEditing ? (
                    <Input
                      id="landmark"
                      value={editedApartment?.address?.landmark || ""}
                      onChange={(e) =>
                        handleAddressChange("landmark", e.target.value)
                      }
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      placeholder="Nearby landmark or point of interest"
                    />
                  ) : (
                    <div className="bg-gradient-to-r from-gray-50 to-green-50/30 px-4 py-3 rounded-lg border border-gray-100">
                      {currentApartment?.address?.landmark || "Not provided"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Utilities and Rules */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-600"></div>
              <CardHeader className="bg-gradient-to-r from-purple-50/50 to-pink-50/50">
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-purple-600" />
                  Utilities & Rules
                </CardTitle>
                <CardDescription>
                  Included utilities and house rules
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Included Utilities */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold text-gray-800">
                      Included Utilities
                    </Label>
                    {isEditing && (
                      <Badge
                        variant="outline"
                        className="text-blue-600 border-blue-200"
                      >
                        Click + to add utilities
                      </Badge>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add utility (e.g., Water, Electricity, Internet)"
                        value={newUtilityItem}
                        onChange={(e) => setNewUtilityItem(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddUtility()
                        }
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      />
                      <Button
                        onClick={handleAddUtility}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(
                      editedApartment?.included_utilities ||
                      currentApartment?.included_utilities ||
                      []
                    ).map((utility, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50/50 p-4 rounded-xl border border-blue-100"
                      >
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="font-medium text-gray-800">
                            {utility}
                          </span>
                        </div>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveUtility(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {!(
                    editedApartment?.included_utilities ||
                    currentApartment?.included_utilities
                  )?.length && (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <Wifi className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No utilities listed</p>
                      {isEditing && (
                        <p className="text-sm text-gray-400 mt-1">
                          Add utilities using the form above
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* House Rules */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold text-gray-800">
                      House Rules
                    </Label>
                    {isEditing && (
                      <Badge
                        variant="outline"
                        className="text-red-600 border-red-200"
                      >
                        Click + to add rules
                      </Badge>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add rule (e.g., No smoking, No pets, Quiet hours after 10 PM)"
                        value={newRuleItem}
                        onChange={(e) => setNewRuleItem(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddRule()}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      />
                      <Button
                        onClick={handleAddRule}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div className="space-y-3">
                    {(
                      editedApartment?.rules ||
                      currentApartment?.rules ||
                      []
                    ).map((rule, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gradient-to-r from-red-50 to-rose-50/50 p-4 rounded-xl border border-red-100"
                      >
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-red-500 mr-2" />
                          <span className="font-medium text-gray-800">
                            {rule}
                          </span>
                        </div>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRule(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {!(editedApartment?.rules || currentApartment?.rules)
                    ?.length && (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No rules listed</p>
                      {isEditing && (
                        <p className="text-sm text-gray-400 mt-1">
                          Add house rules using the form above
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Quick Overview */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
              <CardHeader className="bg-gradient-to-r from-amber-50/50 to-orange-50/50">
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-amber-600" />
                  Quick Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <Home className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600 font-medium">
                        Type
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900 capitalize">
                      {currentApartment?.rental_type?.replace("_", " ") ||
                        "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <Ruler className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600 font-medium">
                        Area
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {currentApartment?.area
                        ? `${currentApartment.area} m²`
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600 font-medium">
                        Max Occupancy
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {currentApartment?.max_users || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600 font-medium">
                        Available From
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {currentApartment?.available_from
                        ? formatDate(currentApartment.available_from)
                        : "N/A"}
                    </span>
                  </div>

                  <div className="pt-4 text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {currentApartment?.price_per_month
                        ? formatPrice(currentApartment.price_per_month)
                        : "Price N/A"}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      per month
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
              <CardHeader className="bg-gradient-to-r from-green-50/50 to-emerald-50/50">
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-600" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="available_from"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Available From
                  </Label>
                  {isEditing ? (
                    <Input
                      id="available_from"
                      type="date"
                      value={
                        editedApartment?.available_from?.split("T")[0] || ""
                      }
                      onChange={(e) =>
                        updateField("available_from", e.target.value)
                      }
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    />
                  ) : (
                    <div className="bg-gradient-to-r from-gray-50 to-green-50/30 px-4 py-3 rounded-lg border border-gray-100">
                      {currentApartment?.available_from
                        ? formatDate(currentApartment.available_from)
                        : "Not provided"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="available_until"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Available Until
                  </Label>
                  {isEditing ? (
                    <Input
                      id="available_until"
                      type="date"
                      value={
                        editedApartment?.available_until?.split("T")[0] || ""
                      }
                      onChange={(e) =>
                        updateField("available_until", e.target.value)
                      }
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    />
                  ) : (
                    <div className="bg-gradient-to-r from-gray-50 to-green-50/30 px-4 py-3 rounded-lg border border-gray-100">
                      {currentApartment?.available_until
                        ? formatDate(currentApartment.available_until)
                        : "Not provided"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-indigo-600" />
                  Property Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-gray-50 to-indigo-50/30 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 text-gray-600 mr-2" />
                    <Label
                      htmlFor="is_pet_allowed"
                      className="font-medium text-gray-700"
                    >
                      Pets Allowed
                    </Label>
                  </div>
                  {isEditing ? (
                    <Switch
                      id="is_pet_allowed"
                      checked={editedApartment?.is_pet_allowed || false}
                      onCheckedChange={(checked) =>
                        updateField("is_pet_allowed", checked)
                      }
                    />
                  ) : (
                    <Badge
                      variant={
                        currentApartment?.is_pet_allowed
                          ? "default"
                          : "secondary"
                      }
                    >
                      {currentApartment?.is_pet_allowed ? "Yes" : "No"}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-gray-50 to-indigo-50/30 rounded-lg">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-gray-600 mr-2" />
                    <Label
                      htmlFor="is_promoted"
                      className="font-medium text-gray-700"
                    >
                      Featured Listing
                    </Label>
                  </div>
                  {isEditing ? (
                    <Switch
                      id="is_promoted"
                      checked={editedApartment?.is_promoted || false}
                      onCheckedChange={(checked) =>
                        updateField("is_promoted", checked)
                      }
                    />
                  ) : (
                    <Badge
                      variant={
                        currentApartment?.is_promoted ? "default" : "secondary"
                      }
                      className={
                        currentApartment?.is_promoted ? "bg-amber-500" : ""
                      }
                    >
                      {currentApartment?.is_promoted ? "Featured" : "Standard"}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-gray-50 to-indigo-50/30 rounded-lg">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 text-gray-600 mr-2" />
                    <Label
                      htmlFor="is_active"
                      className="font-medium text-gray-700"
                    >
                      Active Listing
                    </Label>
                  </div>
                  {isEditing ? (
                    <Switch
                      id="is_active"
                      checked={editedApartment?.is_active !== false}
                      onCheckedChange={(checked) =>
                        updateField("is_active", checked)
                      }
                    />
                  ) : (
                    <Badge
                      variant={
                        currentApartment?.is_active ? "default" : "secondary"
                      }
                      className={
                        currentApartment?.is_active ? "bg-green-500" : ""
                      }
                    >
                      {currentApartment?.is_active ? "Active" : "Inactive"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-rose-500 to-pink-600"></div>
              <CardHeader className="bg-gradient-to-r from-rose-50/50 to-pink-50/50">
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-rose-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="contact_phone"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <div className="relative">
                      <Input
                        id="contact_phone"
                        value={editedApartment?.contact_phone || ""}
                        onChange={(e) =>
                          updateField("contact_phone", e.target.value)
                        }
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white pl-10"
                        placeholder="+7 (XXX) XXX-XXXX"
                      />
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-gray-50 to-rose-50/30 px-4 py-3 rounded-lg border border-gray-100">
                      {currentApartment?.contact_phone || "Not provided"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="contact_telegram"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Telegram
                  </Label>
                  {isEditing ? (
                    <div className="relative">
                      <Input
                        id="contact_telegram"
                        value={editedApartment?.contact_telegram || ""}
                        onChange={(e) =>
                          updateField("contact_telegram", e.target.value)
                        }
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white pl-10"
                        placeholder="@username"
                      />
                      <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-gray-50 to-rose-50/30 px-4 py-3 rounded-lg border border-gray-100">
                      {currentApartment?.contact_telegram || "Not provided"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Roommate Preferences */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
              <CardHeader className="bg-gradient-to-r from-cyan-50/50 to-blue-50/50">
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-cyan-600" />
                  Roommate Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isEditing ? (
                  <Textarea
                    value={editedApartment?.roommate_preferences || ""}
                    onChange={(e) =>
                      updateField("roommate_preferences", e.target.value)
                    }
                    placeholder="Describe your ideal roommate or tenant preferences..."
                    className="min-h-24 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                ) : (
                  <div className="bg-gradient-to-r from-gray-50 to-cyan-50/30 px-4 py-3 rounded-lg border border-gray-100 min-h-24">
                    {currentApartment?.roommate_preferences ||
                      "No preferences specified"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
