// "use client";
// import { useEffect, useState } from "react";
// import { useOwnerApartments } from "@/hooks/apartments";
// import { Apartment } from "@/types/apartments";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import Link from "next/link";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//   Calendar,
//   MapPin,
//   Home,
//   DollarSign,
//   SquareUser,
//   Ruler,
//   ArrowUpRight,
//   Edit,
//   Trash2,
//   Loader2,
//   Star,
//   PenSquare,
//   Eye,
// } from "lucide-react";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { useDeleteApartment } from "@/hooks/apartments";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useRouter } from "next/navigation";
// import { useProfileStore } from "@/store/profileStore";

// // Стоимость ренты с красивым форматированием
// const formatPrice = (price: number) => {
//   return new Intl.NumberFormat("kk-KZ", {
//     style: "currency",
//     currency: "KZT",
//     maximumFractionDigits: 0,
//   }).format(price);
// };

// // Форматирование даты
// const formatDate = (dateString: string) => {
//   const date = new Date(dateString);
//   return date.toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//   });
// };

// // Функция для преобразования base64 или URL в рабочий URL для изображения
// const getImageUrl = (url: string) => {
//   // Если URL начинается с http или https, используем его напрямую
//   if (url.startsWith("http://") || url.startsWith("https://")) {
//     // Для тестового URL example.com заменим на реальное изображение
//     if (url.includes("example.com")) {
//       return `https://source.unsplash.com/random/800x600/?apartment&sig=${Math.random()}`;
//     }
//     return url;
//   }

//   // Если URL в формате base64, используем его напрямую
//   if (url.startsWith("data:image")) {
//     return url;
//   }

//   // Если URL не распознан, используем заглушку
//   return "https://source.unsplash.com/random/800x600/?apartment";
// };

// // Компонент плейсхолдера при загрузке
// const ApartmentCardSkeleton = () => (
//   <Card className="overflow-hidden">
//     <Skeleton className="h-48 w-full" />
//     <CardHeader className="pb-2">
//       <Skeleton className="h-6 w-3/4 mb-2" />
//       <Skeleton className="h-4 w-1/2" />
//     </CardHeader>
//     <CardContent className="pb-2">
//       <div className="space-y-2">
//         <Skeleton className="h-4 w-full" />
//         <Skeleton className="h-4 w-full" />
//         <Skeleton className="h-4 w-2/3" />
//       </div>
//     </CardContent>
//     <CardFooter>
//       <div className="flex justify-between w-full">
//         <Skeleton className="h-10 w-20" />
//         <Skeleton className="h-10 w-20" />
//       </div>
//     </CardFooter>
//   </Card>
// );

// // Компонент карточки апартаментов
// const ApartmentCard = ({
//   apartment,
//   onDelete,
// }: {
//   apartment: Apartment;
//   onDelete: (id: string) => void;
// }) => {
//   const router = useRouter();
//   const [mainImage, setMainImage] = useState<string>("");
//   const [isDeleting, setIsDeleting] = useState(false);

//   useEffect(() => {
//     // Установка основного изображения
//     if (apartment.pictures && apartment.pictures.length > 0) {
//       setMainImage(getImageUrl(apartment.pictures[0]));
//     }
//   }, [apartment]);

//   // Форматирование даты создания
//   const createdAt = apartment.created_at
//     ? formatDate(apartment.created_at)
//     : "Recently";

//   const handleEdit = () => {
//     router.push(`/apartment/${apartment.apartmentId}`);
//   };

//   const handleDelete = async () => {
//     setIsDeleting(true);
//     try {
//       if (apartment.apartmentId) {
//         await onDelete(apartment.apartmentId);
//       } else {
//         console.error("Apartment ID is undefined");
//       }
//     } catch (error) {
//       console.error("Failed to delete apartment:", error);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const handleViewDetails = () => {
//     router.push(`/apartment/${apartment.apartmentId}`);
//   };

//   return (
//     <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg group">
//       <div className="relative">
//         <div className="h-48 w-full bg-gray-200 overflow-hidden">
//           {mainImage ? (
//             <img
//               src={mainImage}
//               alt={apartment.apartment_name}
//               className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//             />
//           ) : (
//             <div className="w-full h-full flex items-center justify-center bg-gray-100">
//               <Home className="h-12 w-12 text-gray-400" />
//             </div>
//           )}
//         </div>
//         {apartment.is_promoted && (
//           <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
//             <Star className="h-3 w-3 mr-1" /> Featured
//           </Badge>
//         )}
//         <Badge
//           className={`absolute top-2 right-2 ${apartment.is_active ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}`}
//         >
//           {apartment.is_active ? "Active" : "Inactive"}
//         </Badge>
//       </div>

//       <CardHeader className="pb-2">
//         <div className="flex justify-between items-start">
//           <CardTitle
//             className="text-xl truncate"
//             title={apartment.apartment_name}
//           >
//             {apartment.apartment_name}
//           </CardTitle>
//           <Badge
//             variant="outline"
//             className="text-blue-500 border-blue-200 bg-blue-50"
//           >
//             {formatPrice(apartment.price_per_month)}/month
//           </Badge>
//         </div>
//         <CardDescription className="flex items-center text-gray-500">
//           <MapPin className="h-3.5 w-3.5 mr-1" />
//           {apartment.district_name}, {apartment.address.street}
//         </CardDescription>
//       </CardHeader>

//       <CardContent className="pb-3">
//         <div className="grid grid-cols-2 gap-2 mb-3">
//           <div className="flex items-center text-sm text-gray-600">
//             <Home className="h-3.5 w-3.5 mr-1 text-gray-500" />
//             {apartment.number_of_rooms}{" "}
//             {apartment.number_of_rooms === 1 ? "Room" : "Rooms"}
//           </div>
//           <div className="flex items-center text-sm text-gray-600">
//             <Ruler className="h-3.5 w-3.5 mr-1 text-gray-500" />
//             {apartment.area} m²
//           </div>
//           <div className="flex items-center text-sm text-gray-600">
//             <SquareUser className="h-3.5 w-3.5 mr-1 text-gray-500" />
//             Max {apartment.max_users}{" "}
//             {apartment.max_users === 1 ? "Person" : "People"}
//           </div>
//           <div className="flex items-center text-sm text-gray-600">
//             <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
//             From {formatDate(apartment.available_from)}
//           </div>
//         </div>

//         <div className="text-sm text-gray-500">Posted on {createdAt}</div>
//       </CardContent>

//       <Separator />

//       <CardFooter className="pt-3 pb-3 flex justify-between">
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={handleViewDetails}
//           className="text-blue-600 border-blue-200 hover:bg-blue-50"
//         >
//           <Eye className="h-3.5 w-3.5 mr-1" /> View
//         </Button>

//         <div className="space-x-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={handleEdit}
//             className="text-amber-600 border-amber-200 hover:bg-amber-50"
//           >
//             <PenSquare className="h-3.5 w-3.5 mr-1" /> Edit
//           </Button>

//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={handleDelete}
//                   disabled={isDeleting}
//                   className="text-red-600 border-red-200 hover:bg-red-50"
//                 >
//                   {isDeleting ? (
//                     <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
//                   ) : (
//                     <Trash2 className="h-3.5 w-3.5 mr-1" />
//                   )}
//                   Delete
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Delete apartment listing</p>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </div>
//       </CardFooter>
//     </Card>
//   );
// };

// // Основная страница моих апартаментов
// export default function MyApartmentsPage() {
//   // ID владельца, для которого мы получаем данные
//   const {
//     profile,
//     editedProfile,
//     isEditing,
//     loading,
//     startEditing,
//     cancelEditing,
//     updateField,
//     hasChanges,
//     setProfile,
//   } = useProfileStore();

//   const ownerId = profile?.userId;
//   console.log("Owner ID:", ownerId);
//   // Запрос на получение апартаментов этого владельца
//   const {
//     data: apartments,
//     isLoading,
//     isError,
//     error,
//     refetch,
//   } = useOwnerApartments(ownerId === undefined ? "" : ownerId, {
//     staleTime: 30000, // 30 секунд
//     refetchOnWindowFocus: false,
//   });

//   // Мутация для удаления апартаментов
//   const deleteMutation = useDeleteApartment({
//     onSuccess: () => {
//       toast.success("Apartment successfully deleted!", {
//         position: "top-right",
//         autoClose: 3000,
//       });
//       refetch(); // Обновляем список после удаления
//     },
//     onError: (error) => {
//       toast.error(`Failed to delete apartment: ${error.message}`, {
//         position: "top-right",
//         autoClose: 3000,
//       });
//     },
//   });

//   const handleDelete = (apartmentId: string) => {
//     if (window.confirm("Are you sure you want to delete this apartment?")) {
//       deleteMutation.mutate(apartmentId);
//     }
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen py-10">
//       <ToastContainer position="top-right" autoClose={3000} />

//       <div className="container mx-auto px-4">
//         <header className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text ">
//             My Apartment Listings
//           </h1>
//           <p className="text-gray-600 mt-2">Manage your property listings</p>

//           <div className="mt-6 flex justify-between items-center">
//             <div>
//               {!isLoading && apartments && (
//                 <p className="text-gray-600">
//                   {apartments.length}{" "}
//                   {apartments.length === 1 ? "apartment" : "apartments"} listed
//                 </p>
//               )}
//             </div>

//             <Link href="/apartment/create">
//               <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
//                 <PenSquare className="h-4 w-4 mr-2" /> Add New Listing
//               </Button>
//             </Link>
//           </div>
//         </header>

//         {isLoading && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {[...Array(3)].map((_, index) => (
//               <ApartmentCardSkeleton key={index} />
//             ))}
//           </div>
//         )}

//         {isError && (
//           <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
//             <h3 className="text-lg font-medium text-red-800 mb-2">
//               Error Loading Apartments
//             </h3>
//             <p className="text-red-600">
//               {error?.message ||
//                 "Failed to load your apartment listings. Please try again."}
//             </p>
//             <Button
//               variant="outline"
//               className="mt-4 border-red-300 text-red-600 hover:bg-red-50"
//               onClick={() => refetch()}
//             >
//               Try Again
//             </Button>
//           </div>
//         )}

//         {!isLoading && !isError && apartments && apartments.length === 0 && (
//           <div className="bg-blue-50 p-10 rounded-lg border border-blue-100 text-center">
//             <Home className="h-12 w-12 text-blue-400 mx-auto mb-4" />
//             <h3 className="text-xl font-medium text-blue-800 mb-2">
//               No Apartment Listings
//             </h3>
//             <p className="text-blue-600 mb-6">
//               You haven't created any apartment listings yet.
//             </p>
//             <Link href="/apartments/create">
//               <Button className="bg-blue-600 hover:bg-blue-700">
//                 Create Your First Listing
//               </Button>
//             </Link>
//           </div>
//         )}

//         {!isLoading && !isError && apartments && apartments.length > 0 && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {apartments.map((apartment) => (
//               <ApartmentCard
//                 key={apartment.apartmentId}
//                 apartment={apartment}
//                 onDelete={handleDelete}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
