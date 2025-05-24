// "use client";
// import { useEffect, useState, useRef } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Switch } from "@/components/ui/switch";
// import { Label } from "@/components/ui/label";
// import {
//   Loader2,
//   Edit,
//   Save,
//   X,
//   MapPin,
//   Calendar,
//   Home,
//   Ruler,
//   Users,
//   Star,
//   Eye,
//   ArrowLeft,
//   Upload,
//   Trash2,
//   Plus,
// } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useApartment, useUpdateApartment } from "@/hooks/apartments";
// import { updateApartment } from "@/lib/api_from_swagger/apartments";
// import {
//   useApartmentStore,
//   useLoadApartment,
//   useSaveApartment,
// } from "@/store/apartmentStore";
// import { Apartment } from "@/types/apartments";

// // Функция для преобразования URL изображений
// const getImageUrl = (url: string) => {
//   // Handle base64 images
//   if (url?.startsWith("data:image")) {
//     return url;
//   }

//   // Handle standard URLs
//   if (url?.startsWith("http://") || url?.startsWith("https://")) {
//     if (url.includes("example.com")) {
//       // Use a consistent fallback for placeholder URLs
//       return `https://source.unsplash.com/random/800x600/?apartment&sig=${Math.random()}`;
//     }
//     return url;
//   }

//   // Handle base64 without prefix
//   if (url && url.length > 100 && url.match(/^[A-Za-z0-9+/=]+$/)) {
//     return `data:image/jpeg;base64,${url}`;
//   }

//   // Default fallback
//   return "https://source.unsplash.com/random/800x600/?apartment";
// };

// const formatPrice = (price: number) => {
//   return new Intl.NumberFormat("kk-KZ", {
//     style: "currency",
//     currency: "KZT",
//     maximumFractionDigits: 0,
//   }).format(price);
// };

// const formatDate = (dateString: string) => {
//   const date = new Date(dateString);
//   return date.toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//   });
// };

// export default function ApartmentDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const apartmentId = params.id as string;

//   const [isSaving, setIsSaving] = useState<boolean>(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [previewImages, setPreviewImages] = useState<
//     { url: string; file: File | null }[]
//   >([]);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const [newUtilityItem, setNewUtilityItem] = useState("");
//   const [newRuleItem, setNewRuleItem] = useState("");

//   const {
//     apartment,
//     editedApartment,
//     isEditing,
//     loading,
//     error,
//     startEditing,
//     cancelEditing,
//     updateField,
//     hasChanges,
//     getFullApartmentData,
//   } = useApartmentStore();

//   const { loadApartment } = useLoadApartment();
//   const { saveChanges } = useSaveApartment();

//   const {
//     data: apartmentData,
//     isLoading: isLoadingApartment,
//     isError,
//     error: fetchError,
//   } = useApartment(apartmentId, {
//     enabled: !!apartmentId,
//     staleTime: 30000,
//     refetchOnWindowFocus: false,
//   });

//   useEffect(() => {
//     if (apartmentData) {
//       useApartmentStore.getState().setApartment(apartmentData);

//       if (apartmentData.pictures && apartmentData.pictures.length > 0) {
//         const imagesPreviews = apartmentData.pictures.map((url) => ({
//           url: getImageUrl(url),
//           file: null,
//         }));
//         setPreviewImages(imagesPreviews);
//       }
//     }
//   }, [apartmentData]);

//   // Мутация для обновления апартамента
//   const updateMutation = useUpdateApartment({
//     onSuccess: (data) => {
//       toast.success("Apartment updated successfully!", {
//         position: "top-right",
//         autoClose: 3000,
//       });
//       useApartmentStore.getState().saveApartmentSuccess(data);
//     },
//     onError: (error) => {
//       toast.error(`Failed to update apartment: ${error.message}`, {
//         position: "top-right",
//         autoClose: 3000,
//       });
//     },
//   });

//   const handleSaveChanges = async () => {
//     if (!hasChanges()) {
//       toast.info("No changes to save", {
//         position: "top-right",
//         autoClose: 3000,
//       });
//       cancelEditing();
//       return;
//     }

//     if (!apartmentId) {
//       toast.error("Apartment ID is missing", {
//         position: "top-right",
//         autoClose: 3000,
//       });
//       return;
//     }

//     setIsSaving(true);

//     try {
//       const fullData = getFullApartmentData();

//       const dataToSend = {
//         ...fullData,
//         apartmentId: apartmentId,
//         ownerId: fullData.ownerId || apartmentData?.ownerId || "",
//         pictures:
//           fullData.pictures ||
//           previewImages.map(
//             (_, index) =>
//               `https://example.com/apartment-image-${index + 1}.jpg`,
//           ),
//       };

//       console.log("Sending data to API:", dataToSend);

//       await updateMutation.mutateAsync({
//         apartmentId,
//         apartmentData: dataToSend,
//       });
//     } catch (error) {
//       console.error("Failed to update apartment:", error);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;

//     const validFiles: File[] = [];
//     const maxSize = 10 * 1024 * 1024;

//     Array.from(files).forEach((file) => {
//       if (file.size > maxSize) {
//         toast.error(`File "${file.name}" exceeds the 10MB limit`);
//         return;
//       }

//       if (!file.type.startsWith("image/")) {
//         toast.error(`File "${file.name}" is not an image`);
//         return;
//       }

//       validFiles.push(file);
//     });

//     if (validFiles.length === 0) return;

//     const newImages = [...previewImages];

//     validFiles.forEach((file) => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         const base64String = reader.result as string;
//         newImages.push({ url: base64String, file });
//         setPreviewImages([...newImages]);

//         updateField(
//           "pictures",
//           newImages.map((img) => img.url),
//         );
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const handleRemoveImage = (index: number) => {
//     const newImages = [...previewImages];
//     newImages.splice(index, 1);
//     setPreviewImages(newImages);

//     updateField(
//       "pictures",
//       newImages.map((img) => img.url),
//     );

//     if (currentImageIndex >= newImages.length && newImages.length > 0) {
//       setCurrentImageIndex(newImages.length - 1);
//     } else if (newImages.length === 0) {
//       setCurrentImageIndex(0);
//     }
//   };

//   // Добавление утилиты
//   const handleAddUtility = () => {
//     if (!newUtilityItem.trim()) return;

//     const currentUtilities = editedApartment?.included_utilities || [];
//     if (currentUtilities.includes(newUtilityItem.trim())) {
//       toast.error("This utility is already in the list");
//       return;
//     }

//     updateField("included_utilities", [
//       ...currentUtilities,
//       newUtilityItem.trim(),
//     ]);
//     setNewUtilityItem("");
//   };

//   // Удаление утилиты
//   const handleRemoveUtility = (index: number) => {
//     const currentUtilities = editedApartment?.included_utilities || [];
//     const newUtilities = [...currentUtilities];
//     newUtilities.splice(index, 1);
//     updateField("included_utilities", newUtilities);
//   };

//   // Добавление правила
//   const handleAddRule = () => {
//     if (!newRuleItem.trim()) return;

//     const currentRules = editedApartment?.rules || [];
//     if (currentRules.includes(newRuleItem.trim())) {
//       toast.error("This rule is already in the list");
//       return;
//     }

//     updateField("rules", [...currentRules, newRuleItem.trim()]);
//     setNewRuleItem("");
//   };

//   // Удаление правила
//   const handleRemoveRule = (index: number) => {
//     const currentRules = editedApartment?.rules || [];
//     const newRules = [...currentRules];
//     newRules.splice(index, 1);
//     updateField("rules", newRules);
//   };

//   // Обработка изменений адреса
//   const handleAddressChange = (field: string, value: any) => {
//     const currentAddress = editedApartment?.address ||
//       apartment?.address || {
//         street: "",
//         house_number: "",
//         apartment_number: "",
//         entrance: "",
//         has_intercom: false,
//         landmark: "",
//       };

//     updateField("address", {
//       ...currentAddress,
//       [field]: value,
//     });
//   };

//   // Состояния загрузки и ошибок
//   if (isLoadingApartment || loading) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
//           <p className="text-gray-600">Loading apartment details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isError || error) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <div className="text-center">
//           <p className="text-red-500 mb-4">Failed to load apartment details</p>
//           <Button
//             onClick={() => router.back()}
//             className="bg-blue-600 hover:bg-blue-700"
//           >
//             Go Back
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   if (!apartment && !apartmentData) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-500 mb-4">Apartment not found</p>
//           <Button
//             onClick={() => router.back()}
//             className="bg-blue-600 hover:bg-blue-700"
//           >
//             Go Back
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const currentApartment = isEditing ? editedApartment : apartment;

//   return (
//     <div className="bg-gray-50 min-h-screen py-8">
//       <ToastContainer position="top-right" autoClose={3000} />

//       {isSaving && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
//             <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
//             <p className="text-gray-700">Saving changes...</p>
//           </div>
//         </div>
//       )}

//       <div className="container mx-auto px-4">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center gap-4 mb-4">
//             <Button
//               variant="outline"
//               onClick={() => router.back()}
//               className="flex items-center"
//             >
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back
//             </Button>

//             <div className="flex-1">
//               <h1 className="text-3xl font-bold text-gray-800">
//                 {currentApartment?.apartment_name || "Apartment Details"}
//               </h1>
//               <p className="text-gray-600 mt-1">
//                 {currentApartment?.district_name},{" "}
//                 {currentApartment?.address?.street}
//               </p>
//             </div>

//             {!isEditing ? (
//               <Button
//                 onClick={startEditing}
//                 className="bg-blue-600 hover:bg-blue-700"
//               >
//                 <Edit className="h-4 w-4 mr-2" />
//                 Edit
//               </Button>
//             ) : (
//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   onClick={cancelEditing}
//                   disabled={isSaving}
//                 >
//                   <X className="h-4 w-4 mr-2" />
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleSaveChanges}
//                   disabled={isSaving || !hasChanges()}
//                   className="bg-green-600 hover:bg-green-700"
//                 >
//                   {isSaving ? (
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                   ) : (
//                     <Save className="h-4 w-4 mr-2" />
//                   )}
//                   Save Changes
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column - Images */}
//           <div className="lg:col-span-2">
//             <Card className="shadow-lg border-0 overflow-hidden mb-8">
//               <CardContent className="p-0">
//                 {previewImages.length > 0 ? (
//                   <div>
//                     <div className="relative aspect-video bg-gray-200">
//                       <img
//                         src={previewImages[currentImageIndex]?.url}
//                         alt={`Apartment image ${currentImageIndex + 1}`}
//                         className="w-full h-full object-cover"
//                       />

//                       {/* Status badges */}
//                       <div className="absolute top-4 left-4 flex gap-2">
//                         {currentApartment?.is_promoted && (
//                           <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
//                             <Star className="h-3 w-3 mr-1" /> Featured
//                           </Badge>
//                         )}
//                         <Badge
//                           className={
//                             currentApartment?.is_active
//                               ? "bg-green-500"
//                               : "bg-gray-500"
//                           }
//                         >
//                           {currentApartment?.is_active ? "Active" : "Inactive"}
//                         </Badge>
//                       </div>

//                       {/* Navigation arrows */}
//                       {previewImages.length > 1 && (
//                         <>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
//                             onClick={() =>
//                               setCurrentImageIndex((prev) =>
//                                 prev === 0
//                                   ? previewImages.length - 1
//                                   : prev - 1,
//                               )
//                             }
//                           >
//                             <ArrowLeft className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
//                             onClick={() =>
//                               setCurrentImageIndex((prev) =>
//                                 prev === previewImages.length - 1
//                                   ? 0
//                                   : prev + 1,
//                               )
//                             }
//                           >
//                             <ArrowLeft className="h-4 w-4 rotate-180" />
//                           </Button>
//                         </>
//                       )}
//                     </div>

//                     {/* Thumbnail gallery */}
//                     {previewImages.length > 1 && (
//                       <div className="p-4 bg-gray-50">
//                         <div className="flex gap-2 overflow-x-auto">
//                           {previewImages.map((image, index) => (
//                             <div key={index} className="relative">
//                               <button
//                                 onClick={() => setCurrentImageIndex(index)}
//                                 className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${
//                                   currentImageIndex === index
//                                     ? "border-blue-500"
//                                     : "border-gray-200"
//                                 }`}
//                               >
//                                 <img
//                                   src={image.url}
//                                   alt={`Thumbnail ${index + 1}`}
//                                   className="w-full h-full object-cover"
//                                 />
//                               </button>
//                               {isEditing && (
//                                 <Button
//                                   variant="destructive"
//                                   size="icon"
//                                   className="absolute -top-2 -right-2 w-6 h-6"
//                                   onClick={() => handleRemoveImage(index)}
//                                 >
//                                   <X className="h-3 w-3" />
//                                 </Button>
//                               )}
//                             </div>
//                           ))}

//                           {isEditing && (
//                             <button
//                               onClick={() => fileInputRef.current?.click()}
//                               className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center hover:border-blue-400 transition-colors"
//                             >
//                               <Plus className="h-6 w-6 text-gray-400" />
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="aspect-video bg-gray-200 flex items-center justify-center">
//                     {isEditing ? (
//                       <div className="text-center">
//                         <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                         <Button onClick={() => fileInputRef.current?.click()}>
//                           <Upload className="h-4 w-4 mr-2" />
//                           Upload Images
//                         </Button>
//                       </div>
//                     ) : (
//                       <div className="text-center">
//                         <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                         <p className="text-gray-500">No images available</p>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Hidden file input */}
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   className="hidden"
//                   accept="image/*"
//                   multiple
//                   onChange={handleImageUpload}
//                 />
//               </CardContent>
//             </Card>

//             {/* Basic Information */}
//             <Card className="shadow-lg border-0 overflow-hidden mb-8">
//               <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
//               <CardHeader>
//                 <CardTitle>Basic Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <Label htmlFor="apartment_name">Apartment Name</Label>
//                     {isEditing ? (
//                       <Input
//                         id="apartment_name"
//                         value={editedApartment?.apartment_name || ""}
//                         onChange={(e) =>
//                           updateField("apartment_name", e.target.value)
//                         }
//                         className="mt-1"
//                       />
//                     ) : (
//                       <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                         {currentApartment?.apartment_name || "Not provided"}
//                       </div>
//                     )}
//                   </div>

//                   <div>
//                     <Label htmlFor="rental_type">Rental Type</Label>
//                     {isEditing ? (
//                       <Select
//                         value={editedApartment?.rental_type || ""}
//                         onValueChange={(value) =>
//                           updateField("rental_type", value)
//                         }
//                       >
//                         <SelectTrigger className="mt-1">
//                           <SelectValue placeholder="Select rental type" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="entire_apartment">
//                             Entire Apartment
//                           </SelectItem>
//                           <SelectItem value="private_room">
//                             Private Room
//                           </SelectItem>
//                           <SelectItem value="shared_room">
//                             Shared Room
//                           </SelectItem>
//                         </SelectContent>
//                       </Select>
//                     ) : (
//                       <div className="bg-gray-50 px-3 py-2 rounded-md mt-1 capitalize">
//                         {currentApartment?.rental_type?.replace("_", " ") ||
//                           "Not provided"}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <Label htmlFor="description">Description</Label>
//                   {isEditing ? (
//                     <Textarea
//                       id="description"
//                       value={editedApartment?.description || ""}
//                       onChange={(e) =>
//                         updateField("description", e.target.value)
//                       }
//                       className="mt-1 min-h-32"
//                     />
//                   ) : (
//                     <div className="bg-gray-50 px-3 py-2 rounded-md mt-1 min-h-32">
//                       {currentApartment?.description ||
//                         "No description provided"}
//                     </div>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div>
//                     <Label htmlFor="price_per_month">
//                       Price per Month (KZT)
//                     </Label>
//                     {isEditing ? (
//                       <Input
//                         id="price_per_month"
//                         type="number"
//                         value={editedApartment?.price_per_month || ""}
//                         onChange={(e) =>
//                           updateField("price_per_month", Number(e.target.value))
//                         }
//                         className="mt-1"
//                       />
//                     ) : (
//                       <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                         {currentApartment?.price_per_month
//                           ? formatPrice(currentApartment.price_per_month)
//                           : "Not provided"}
//                       </div>
//                     )}
//                   </div>

//                   <div>
//                     <Label htmlFor="area">Area (m²)</Label>
//                     {isEditing ? (
//                       <Input
//                         id="area"
//                         type="number"
//                         value={editedApartment?.area || ""}
//                         onChange={(e) =>
//                           updateField("area", Number(e.target.value))
//                         }
//                         className="mt-1"
//                       />
//                     ) : (
//                       <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                         {currentApartment?.area
//                           ? `${currentApartment.area} m²`
//                           : "Not provided"}
//                       </div>
//                     )}
//                   </div>

//                   <div>
//                     <Label htmlFor="number_of_rooms">Rooms</Label>
//                     {isEditing ? (
//                       <Input
//                         id="number_of_rooms"
//                         type="number"
//                         value={editedApartment?.number_of_rooms || ""}
//                         onChange={(e) =>
//                           updateField("number_of_rooms", Number(e.target.value))
//                         }
//                         className="mt-1"
//                       />
//                     ) : (
//                       <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                         {currentApartment?.number_of_rooms || "Not provided"}
//                       </div>
//                     )}
//                   </div>

//                   <div>
//                     <Label htmlFor="max_users">Max Occupancy</Label>
//                     {isEditing ? (
//                       <Input
//                         id="max_users"
//                         type="number"
//                         value={editedApartment?.max_users || ""}
//                         onChange={(e) =>
//                           updateField("max_users", Number(e.target.value))
//                         }
//                         className="mt-1"
//                       />
//                     ) : (
//                       <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                         {currentApartment?.max_users || "Not provided"}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <Label htmlFor="kitchen_area">Kitchen Area (m²)</Label>
//                     {isEditing ? (
//                       <Input
//                         id="kitchen_area"
//                         type="number"
//                         value={editedApartment?.kitchen_area || ""}
//                         onChange={(e) =>
//                           updateField("kitchen_area", Number(e.target.value))
//                         }
//                         className="mt-1"
//                       />
//                     ) : (
//                       <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                         {currentApartment?.kitchen_area
//                           ? `${currentApartment.kitchen_area} m²`
//                           : "Not provided"}
//                       </div>
//                     )}
//                   </div>

//                   <div>
//                     <Label htmlFor="floor">Floor</Label>
//                     {isEditing ? (
//                       <Input
//                         id="floor"
//                         type="number"
//                         value={editedApartment?.floor || ""}
//                         onChange={(e) =>
//                           updateField("floor", Number(e.target.value))
//                         }
//                         className="mt-1"
//                       />
//                     ) : (
//                       <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                         {currentApartment?.floor || "Not provided"}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Location Information */}
//             <Card className="shadow-lg border-0 overflow-hidden mb-8">
//               <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600"></div>
//               <CardHeader>
//                 <CardTitle>Location Details</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <Label htmlFor="street">Street</Label>
//                     {isEditing ? (
//                       <Input
//                         id="street"
//                         value={editedApartment?.address?.street || ""}
//                         onChange={(e) =>
//                           handleAddressChange("street", e.target.value)
//                         }
//                         className="mt-1"
//                       />
//                     ) : (
//                       <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                         {currentApartment?.address?.street || "Not provided"}
//                       </div>
//                     )}
//                   </div>

//                   <div>
//                     <Label htmlFor="house_number">House Number</Label>
//                     {isEditing ? (
//                       <Input
//                         id="house_number"
//                         value={editedApartment?.address?.house_number || ""}
//                         onChange={(e) =>
//                           handleAddressChange("house_number", e.target.value)
//                         }
//                         className="mt-1"
//                       />
//                     ) : (
//                       <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                         {currentApartment?.address?.house_number ||
//                           "Not provided"}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div>
//                     <Label htmlFor="apartment_number">Apartment Number</Label>
//                     {isEditing ? (
//                       <Input
//                         id="apartment_number"
//                         value={editedApartment?.address?.apartment_number || ""}
//                         onChange={(e) =>
//                           handleAddressChange(
//                             "apartment_number",
//                             e.target.value,
//                           )
//                         }
//                         className="mt-1"
//                       />
//                     ) : (
//                       <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                         {currentApartment?.address?.apartment_number ||
//                           "Not provided"}
//                       </div>
//                     )}
//                   </div>

//                   <div>
//                     <Label htmlFor="entrance">Entrance</Label>
//                     {isEditing ? (
//                       <Input
//                         id="entrance"
//                         value={editedApartment?.address?.entrance || ""}
//                         onChange={(e) =>
//                           handleAddressChange("entrance", e.target.value)
//                         }
//                         className="mt-1"
//                       />
//                     ) : (
//                       <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                         {currentApartment?.address?.entrance || "Not provided"}
//                       </div>
//                     )}
//                   </div>

//                   <div className="flex items-center space-x-2 pt-6">
//                     {isEditing ? (
//                       <>
//                         <Switch
//                           id="has_intercom"
//                           checked={
//                             editedApartment?.address?.has_intercom || false
//                           }
//                           onCheckedChange={(checked) =>
//                             handleAddressChange("has_intercom", checked)
//                           }
//                         />
//                         <Label htmlFor="has_intercom">Has Intercom</Label>
//                       </>
//                     ) : (
//                       <div className="bg-gray-50 px-3 py-2 rounded-md">
//                         Intercom:{" "}
//                         {currentApartment?.address?.has_intercom ? "Yes" : "No"}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <Label htmlFor="district_name">District</Label>
//                     {isEditing ? (
//                       <Select
//                         value={editedApartment?.district_name || ""}
//                         onValueChange={(value) =>
//                           updateField("district_name", value)
//                         }
//                       >
//                         <SelectTrigger className="mt-1">
//                           <SelectValue placeholder="Select district" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="Esil">Esil District</SelectItem>
//                           <SelectItem value="Almaty">
//                             Almaty District
//                           </SelectItem>
//                           <SelectItem value="Saryarka">
//                             Saryarka District
//                           </SelectItem>
//                           <SelectItem value="Baikonur">
//                             Baikonur District
//                           </SelectItem>
//                           <SelectItem value="Nura">Nura District</SelectItem>
//                           <SelectItem value="Downtown">Downtown</SelectItem>
//                           <SelectItem value="University Area">
//                             University Area
//                           </SelectItem>
//                           <SelectItem value="Left Bank">Left Bank</SelectItem>
//                           <SelectItem value="Right Bank">Right Bank</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     ) : (
//                       <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                         {currentApartment?.district_name || "Not provided"}
//                       </div>
//                     )}
//                   </div>

//                   <div>
//                     <Label htmlFor="university_nearby">Nearby University</Label>
//                     {isEditing ? (
//                       <Select
//                         value={editedApartment?.university_nearby || ""}
//                         onValueChange={(value) =>
//                           updateField("university_nearby", value)
//                         }
//                       >
//                         <SelectTrigger className="mt-1">
//                           <SelectValue placeholder="Select university" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="none">Not applicable</SelectItem>
//                           <SelectItem value="Astana IT University">
//                             Astana IT University (AITU)
//                           </SelectItem>
//                           <SelectItem value="Nazarbayev University">
//                             Nazarbayev University
//                           </SelectItem>
//                           <SelectItem value="Eurasian National University">
//                             Eurasian National University
//                           </SelectItem>
//                           <SelectItem value="Kazakh Agro Technical University">
//                             Kazakh Agro Technical University
//                           </SelectItem>
//                           <SelectItem value="Astana Medical University">
//                             Astana Medical University
//                           </SelectItem>
//                           <SelectItem value="Kazakh University of Economics">
//                             Kazakh University of Economics
//                           </SelectItem>
//                         </SelectContent>
//                       </Select>
//                     ) : (
//                       <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                         {currentApartment?.university_nearby === "none"
//                           ? "Not applicable"
//                           : currentApartment?.university_nearby ||
//                             "Not provided"}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <Label htmlFor="landmark">Landmark</Label>
//                   {isEditing ? (
//                     <Input
//                       id="landmark"
//                       value={editedApartment?.address?.landmark || ""}
//                       onChange={(e) =>
//                         handleAddressChange("landmark", e.target.value)
//                       }
//                       className="mt-1"
//                       placeholder="Nearby landmark"
//                     />
//                   ) : (
//                     <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                       {currentApartment?.address?.landmark || "Not provided"}
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Utilities and Rules */}
//             <Card className="shadow-lg border-0 overflow-hidden mb-8">
//               <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-600"></div>
//               <CardHeader>
//                 <CardTitle>Utilities & Rules</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Included Utilities */}
//                 <div>
//                   <Label className="text-lg font-medium">
//                     Included Utilities
//                   </Label>
//                   {isEditing && (
//                     <div className="flex gap-2 mt-2 mb-4">
//                       <Input
//                         placeholder="Add utility (e.g., Water, Electricity)"
//                         value={newUtilityItem}
//                         onChange={(e) => setNewUtilityItem(e.target.value)}
//                         onKeyDown={(e) =>
//                           e.key === "Enter" && handleAddUtility()
//                         }
//                       />
//                       <Button onClick={handleAddUtility}>
//                         <Plus className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   )}

//                   <div className="space-y-2">
//                     {(
//                       editedApartment?.included_utilities ||
//                       currentApartment?.included_utilities ||
//                       []
//                     ).map((utility, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center justify-between bg-blue-50 p-3 rounded-md"
//                       >
//                         <span>{utility}</span>
//                         {isEditing && (
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleRemoveUtility(index)}
//                             className="text-red-500 hover:text-red-700"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         )}
//                       </div>
//                     ))}
//                     {!(
//                       editedApartment?.included_utilities ||
//                       currentApartment?.included_utilities
//                     )?.length && (
//                       <div className="text-gray-500 text-center py-4">
//                         No utilities listed
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <Separator />

//                 {/* House Rules */}
//                 <div>
//                   <Label className="text-lg font-medium">House Rules</Label>
//                   {isEditing && (
//                     <div className="flex gap-2 mt-2 mb-4">
//                       <Input
//                         placeholder="Add rule (e.g., No smoking)"
//                         value={newRuleItem}
//                         onChange={(e) => setNewRuleItem(e.target.value)}
//                         onKeyDown={(e) => e.key === "Enter" && handleAddRule()}
//                       />
//                       <Button onClick={handleAddRule}>
//                         <Plus className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   )}

//                   <div className="space-y-2">
//                     {(
//                       editedApartment?.rules ||
//                       currentApartment?.rules ||
//                       []
//                     ).map((rule, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center justify-between bg-red-50 p-3 rounded-md"
//                       >
//                         <span>{rule}</span>
//                         {isEditing && (
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleRemoveRule(index)}
//                             className="text-red-500 hover:text-red-700"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         )}
//                       </div>
//                     ))}
//                     {!(editedApartment?.rules || currentApartment?.rules)
//                       ?.length && (
//                       <div className="text-gray-500 text-center py-4">
//                         No rules listed
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Right Column - Additional Info */}
//           <div className="lg:col-span-1">
//             {/* Quick Stats */}
//             <Card className="shadow-lg border-0 overflow-hidden mb-6">
//               <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-600"></div>
//               <CardHeader>
//                 <CardTitle>Quick Overview</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center">
//                       <Home className="h-4 w-4 text-gray-500 mr-2" />
//                       <span className="text-sm text-gray-600">Type</span>
//                     </div>
//                     <span className="font-medium capitalize">
//                       {currentApartment?.rental_type?.replace("_", " ") ||
//                         "N/A"}
//                     </span>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center">
//                       <Ruler className="h-4 w-4 text-gray-500 mr-2" />
//                       <span className="text-sm text-gray-600">Area</span>
//                     </div>
//                     <span className="font-medium">
//                       {currentApartment?.area
//                         ? `${currentApartment.area} m²`
//                         : "N/A"}
//                     </span>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center">
//                       <Users className="h-4 w-4 text-gray-500 mr-2" />
//                       <span className="text-sm text-gray-600">
//                         Max Occupancy
//                       </span>
//                     </div>
//                     <span className="font-medium">
//                       {currentApartment?.max_users || "N/A"}
//                     </span>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center">
//                       <Calendar className="h-4 w-4 text-gray-500 mr-2" />
//                       <span className="text-sm text-gray-600">
//                         Available From
//                       </span>
//                     </div>
//                     <span className="font-medium">
//                       {currentApartment?.available_from
//                         ? formatDate(currentApartment.available_from)
//                         : "N/A"}
//                     </span>
//                   </div>

//                   <Separator />

//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-blue-600">
//                       {currentApartment?.price_per_month
//                         ? formatPrice(currentApartment.price_per_month)
//                         : "Price N/A"}
//                     </div>
//                     <div className="text-sm text-gray-500">per month</div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Availability */}
//             <Card className="shadow-lg border-0 overflow-hidden mb-6">
//               <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600"></div>
//               <CardHeader>
//                 <CardTitle>Availability</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <Label htmlFor="available_from">Available From</Label>
//                   {isEditing ? (
//                     <Input
//                       id="available_from"
//                       type="date"
//                       value={
//                         editedApartment?.available_from?.split("T")[0] || ""
//                       }
//                       onChange={(e) =>
//                         updateField("available_from", e.target.value)
//                       }
//                       className="mt-1"
//                     />
//                   ) : (
//                     <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                       {currentApartment?.available_from
//                         ? formatDate(currentApartment.available_from)
//                         : "Not provided"}
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <Label htmlFor="available_until">Available Until</Label>
//                   {isEditing ? (
//                     <Input
//                       id="available_until"
//                       type="date"
//                       value={
//                         editedApartment?.available_until?.split("T")[0] || ""
//                       }
//                       onChange={(e) =>
//                         updateField("available_until", e.target.value)
//                       }
//                       className="mt-1"
//                     />
//                   ) : (
//                     <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                       {currentApartment?.available_until
//                         ? formatDate(currentApartment.available_until)
//                         : "Not provided"}
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Preferences & Settings */}
//             <Card className="shadow-lg border-0 overflow-hidden mb-6">
//               <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
//               <CardHeader>
//                 <CardTitle>Settings</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="is_pet_allowed">Pets Allowed</Label>
//                   {isEditing ? (
//                     <Switch
//                       id="is_pet_allowed"
//                       checked={editedApartment?.is_pet_allowed || false}
//                       onCheckedChange={(checked) =>
//                         updateField("is_pet_allowed", checked)
//                       }
//                     />
//                   ) : (
//                     <Badge
//                       variant={
//                         currentApartment?.is_pet_allowed
//                           ? "default"
//                           : "secondary"
//                       }
//                     >
//                       {currentApartment?.is_pet_allowed ? "Yes" : "No"}
//                     </Badge>
//                   )}
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="is_promoted">Promoted</Label>
//                   {isEditing ? (
//                     <Switch
//                       id="is_promoted"
//                       checked={editedApartment?.is_promoted || false}
//                       onCheckedChange={(checked) =>
//                         updateField("is_promoted", checked)
//                       }
//                     />
//                   ) : (
//                     <Badge
//                       variant={
//                         currentApartment?.is_promoted ? "default" : "secondary"
//                       }
//                     >
//                       {currentApartment?.is_promoted ? "Yes" : "No"}
//                     </Badge>
//                   )}
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="is_active">Active Listing</Label>
//                   {isEditing ? (
//                     <Switch
//                       id="is_active"
//                       checked={editedApartment?.is_active !== false}
//                       onCheckedChange={(checked) =>
//                         updateField("is_active", checked)
//                       }
//                     />
//                   ) : (
//                     <Badge
//                       variant={
//                         currentApartment?.is_active ? "default" : "secondary"
//                       }
//                     >
//                       {currentApartment?.is_active ? "Active" : "Inactive"}
//                     </Badge>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Contact Information */}
//             <Card className="shadow-lg border-0 overflow-hidden mb-6">
//               <div className="h-2 bg-gradient-to-r from-rose-500 to-pink-600"></div>
//               <CardHeader>
//                 <CardTitle>Contact Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <Label htmlFor="contact_phone">Phone</Label>
//                   {isEditing ? (
//                     <Input
//                       id="contact_phone"
//                       value={editedApartment?.contact_phone || ""}
//                       onChange={(e) =>
//                         updateField("contact_phone", e.target.value)
//                       }
//                       className="mt-1"
//                       placeholder="+7 (XXX) XXX-XXXX"
//                     />
//                   ) : (
//                     <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                       {currentApartment?.contact_phone || "Not provided"}
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <Label htmlFor="contact_telegram">Telegram</Label>
//                   {isEditing ? (
//                     <Input
//                       id="contact_telegram"
//                       value={editedApartment?.contact_telegram || ""}
//                       onChange={(e) =>
//                         updateField("contact_telegram", e.target.value)
//                       }
//                       className="mt-1"
//                       placeholder="@username"
//                     />
//                   ) : (
//                     <div className="bg-gray-50 px-3 py-2 rounded-md mt-1">
//                       {currentApartment?.contact_telegram || "Not provided"}
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Roommate Preferences */}
//             <Card className="shadow-lg border-0 overflow-hidden">
//               <div className="h-2 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
//               <CardHeader>
//                 <CardTitle>Roommate Preferences</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {isEditing ? (
//                   <Textarea
//                     value={editedApartment?.roommate_preferences || ""}
//                     onChange={(e) =>
//                       updateField("roommate_preferences", e.target.value)
//                     }
//                     placeholder="Describe your ideal roommate or tenant preferences..."
//                     className="min-h-24"
//                   />
//                 ) : (
//                   <div className="bg-gray-50 px-3 py-2 rounded-md min-h-24">
//                     {currentApartment?.roommate_preferences ||
//                       "No preferences specified"}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
