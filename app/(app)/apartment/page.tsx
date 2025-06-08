"use client";
import { useEffect, useState } from "react";
import { useOwnerApartments } from "@/hooks/apartments";
import { Apartment } from "@/types/apartments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Calendar,
  MapPin,
  Home,
  DollarSign,
  SquareUser,
  Ruler,
  ArrowUpRight,
  Edit,
  Trash2,
  Loader2,
  Star,
  PenSquare,
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  Clock,
  TrendingUp,
  Activity,
  MoreHorizontal,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useDeleteApartment } from "@/hooks/apartments";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/store/profileStore";

// Стоимость ренты с красивым форматированием
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("kk-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
};

// Форматирование даты
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Функция для преобразования base64 или URL в рабочий URL для изображения
const getImageUrl = (url: string) => {
  // Если это base64 строка - используем как есть
  if (url?.startsWith("data:image")) {
    return url;
  }

  // Если это HTTP URL и не содержит example.com - используем как есть
  if (url?.startsWith("http://") || url?.startsWith("https://")) {
    if (url.includes("example.com")) {
      return `https://source.unsplash.com/random/800x600/?apartment&sig=${Math.random()}`;
    }
    return url;
  }

  // Fallback для плейсхолдера
  return "https://source.unsplash.com/random/800x600/?apartment";
};
// Типы для сортировки и фильтрации
type SortField =
  | "name"
  | "price"
  | "created_at"
  | "available_from"
  | "district_name"
  | "university_nearby";
type SortOrder = "asc" | "desc";
type ViewMode = "table" | "grid";
type StatusFilter = "all" | "active" | "inactive" | "promoted";

// Компонент статистики
const StatsCard = ({
  icon: Icon,
  title,
  value,
  trend,
  color,
}: {
  icon: any;
  title: string;
  value: string | number;
  trend?: string;
  color: string;
}) => (
  <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Компонент плейсхолдера при загрузке для карточек
const ApartmentCardSkeleton = () => (
  <Card className="overflow-hidden border-0 shadow-lg">
    <Skeleton className="h-48 w-full" />
    <CardHeader className="pb-2">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="pb-2">
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Компонент плейсхолдера при загрузке для таблицы
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-12 w-16 rounded-lg" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-32" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-20 rounded-full" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-24" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-16" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-16" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-8 w-8 rounded-full" />
    </TableCell>
  </TableRow>
);

// Компонент строки таблицы для апартаментов
const ApartmentTableRow = ({
  apartment,
  onDelete,
}: {
  apartment: Apartment;
  onDelete: (id: string) => void;
}) => {
  const router = useRouter();
  const [mainImage, setMainImage] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (apartment.pictures && apartment.pictures.length > 0) {
      setMainImage(getImageUrl(apartment.pictures[0]));
    }
  }, [apartment]);

  const handleEdit = () => {
    router.push(`/apartment/${apartment.apartmentId}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (apartment.apartmentId) {
        await onDelete(apartment.apartmentId);
      }
    } catch (error) {
      console.error("Failed to delete apartment:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = () => {
    router.push(`/apartment/${apartment.apartmentId}`);
  };

  return (
    <TableRow className="hover:bg-blue-50/30 transition-colors border-b border-gray-100">
      <TableCell className="py-4">
        <div className="h-12 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-sm">
          {mainImage ? (
            <img
              src={apartment.pictures[0] || mainImage}
              alt={apartment.apartment_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex flex-col space-y-1">
          <span
            className="font-semibold text-gray-900 truncate max-w-48"
            title={apartment.apartment_name}
          >
            {apartment.apartment_name || "Untitled Apartment"}
          </span>
          <span className="text-sm text-gray-500 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {`${apartment.district_name} district` || "Unknown District"}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex flex-col space-y-1">
          <Badge
            variant="outline"
            className={`w-fit font-medium ${
              apartment.is_active
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-700 border-gray-200"
            }`}
          >
            {apartment.is_active ? "Online" : "Offline"}
          </Badge>
          {apartment.is_promoted && (
            <Badge className="w-fit bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="py-4">
        <span className="text-gray-700 font-medium">
          {apartment.university_nearby || "Not specified"}
        </span>
      </TableCell>
      <TableCell className="py-4">
        <span className="text-gray-600">
          {apartment.created_at ? formatDate(apartment.created_at) : "Recently"}
        </span>
      </TableCell>
      <TableCell className="py-4">
        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
          {formatPrice(apartment.price_per_month) || "N/A"}
        </span>
      </TableCell>
      {/* <TableCell className="py-4">
        <span className="text-gray-600 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
          #{apartment.apartmentId?.toString().slice(-4) || "N/A"}
        </span>
      </TableCell> */}
      <TableCell className="py-4">
        <span
          className="text-gray-600 truncate max-w-32"
          title={apartment.address.street}
        >
          {apartment.address.street || "No Street Address"}
        </span>
      </TableCell>
      <TableCell className="py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white ">
            <DropdownMenuItem
              onClick={handleViewDetails}
              className="cursor-pointer"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
              <Edit className="h-4 w-4 mr-2" />
              Edit Apartment
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator /> */}
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

// Компонент карточки апартаментов (для grid view)
// ЗАМЕНИТЕ существующий компонент ApartmentCard на этот:

const ApartmentCard = ({
  apartment,
  onDelete,
}: {
  apartment: Apartment;
  onDelete: (id: string) => void;
}) => {
  const router = useRouter();
  const [mainImage, setMainImage] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (apartment.pictures && apartment.pictures.length > 0) {
      setMainImage(getImageUrl(apartment.pictures[0]));
    }
  }, [apartment]);

  const createdAt = apartment.created_at
    ? formatDate(apartment.created_at)
    : "Recently";

  const handleEdit = () => {
    router.push(`/apartment/${apartment.apartmentId}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (apartment.apartmentId) {
        await onDelete(apartment.apartmentId);
      }
    } catch (error) {
      console.error("Failed to delete apartment:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = () => {
    router.push(`/apartment/${apartment.apartmentId}`);
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group border-0 shadow-lg bg-white h-full">
      <div className="relative">
        {/* Более высокое изображение */}
        <div className="h-64 w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
          {mainImage ? (
            <img
              src={mainImage}
              alt={apartment.apartment_name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <Home className="h-20 w-20 text-blue-300" />
            </div>
          )}
          {/* Градиентный оверлей */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Status Badges - улучшенное позиционирование */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {apartment.is_promoted && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg backdrop-blur-sm">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          <Badge
            className={`${
              apartment.is_active
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-500 hover:bg-gray-600 text-white"
            } shadow-lg border-0 backdrop-blur-sm`}
          >
            {apartment.is_active ? "Online" : "Offline"}
          </Badge>
        </div>

        {/* Price Badge - более заметный */}
        <div className="absolute bottom-4 right-4">
          <Badge className="bg-white/95 backdrop-blur-sm text-blue-600 border-0 shadow-xl font-bold text-base px-4 py-2 rounded-lg">
            {formatPrice(apartment.price_per_month)}
          </Badge>
        </div>

        {/* University badge */}
        {apartment.university_nearby && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-purple-500/90 backdrop-blur-sm text-white border-0 shadow-lg text-xs px-2 py-1">
              🎓 {apartment.university_nearby}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-6 flex flex-col flex-grow">
        {/* Заголовок и адрес */}
        <div className="mb-4">
          <CardTitle
            className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]"
            title={apartment.apartment_name}
          >
            {apartment.apartment_name}
          </CardTitle>
          <CardDescription className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="truncate">
              {apartment.district_name}, {apartment.address.street}
            </span>
          </CardDescription>
        </div>

        {/* Характеристики - улучшенная сетка */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center text-sm text-gray-700 bg-blue-50 rounded-xl p-3 transition-colors hover:bg-blue-100">
            <Home className="h-5 w-5 mr-2 text-blue-500" />
            <div className="flex flex-col">
              <span className="font-semibold text-xs text-gray-500 uppercase tracking-wide">
                Rooms
              </span>
              <span className="font-bold">{apartment.number_of_rooms}</span>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-700 bg-green-50 rounded-xl p-3 transition-colors hover:bg-green-100">
            <Ruler className="h-5 w-5 mr-2 text-green-500" />
            <div className="flex flex-col">
              <span className="font-semibold text-xs text-gray-500 uppercase tracking-wide">
                Area
              </span>
              <span className="font-bold">{apartment.area} m²</span>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-700 bg-purple-50 rounded-xl p-3 transition-colors hover:bg-purple-100">
            <Users className="h-5 w-5 mr-2 text-purple-500" />
            <div className="flex flex-col">
              <span className="font-semibold text-xs text-gray-500 uppercase tracking-wide">
                Max
              </span>
              <span className="font-bold">{apartment.max_users}</span>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-700 bg-orange-50 rounded-xl p-3 transition-colors hover:bg-orange-100">
            <Calendar className="h-5 w-5 mr-2 text-orange-500" />
            <div className="flex flex-col">
              <span className="font-semibold text-xs text-gray-500 uppercase tracking-wide">
                Available
              </span>
              <span className="font-bold text-xs">
                {formatDate(apartment.available_from)}
              </span>
            </div>
          </div>
        </div>

        {/* Дата публикации */}
        <div className="flex items-center text-xs text-gray-500 mb-6 bg-gray-50 rounded-lg p-2">
          <Clock className="h-4 w-4 mr-2" />
          <span>Posted on {createdAt}</span>
        </div>

        {/* Разделитель */}
        <Separator className="mb-6" />

        {/* Кнопки действий - улучшенный layout */}
        <div className="flex items-center justify-between gap-3 mt-auto">
          <Button
            variant="outline"
            size="default"
            onClick={handleViewDetails}
            className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>

          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleEdit}
                    className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300 transition-all duration-200 px-4"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Apartment</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 px-4"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Apartment</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Компонент пагинации
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center text-sm text-gray-600">
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-9 w-9 p-0 border-gray-200 hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((page, index) => (
          <div key={index}>
            {page === "..." ? (
              <span className="px-2 text-gray-400">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={`h-9 w-9 p-0 ${
                  currentPage === page
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {page}
              </Button>
            )}
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-9 w-9 p-0 border-gray-200 hover:bg-gray-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const BeautifulLoading = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-600 animate-spin animation-delay-75"></div>
          <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin animation-delay-150"></div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="h-8 w-8 text-blue-600 animate-pulse" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Loading Your Properties
        </h3>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-75"></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce animation-delay-150"></div>
        </div>
        <p className="text-gray-500 text-sm">
          Fetching your apartment listings...
        </p>
      </div>

      <div className="flex justify-center space-x-4 opacity-60">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg animate-pulse animation-delay-200 flex items-center justify-center">
          <Home className="h-6 w-6 text-blue-500" />
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg animate-pulse animation-delay-300 flex items-center justify-center">
          <MapPin className="h-6 w-6 text-purple-500" />
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg animate-pulse animation-delay-400 flex items-center justify-center">
          <DollarSign className="h-6 w-6 text-indigo-500" />
        </div>
      </div>
    </div>
  </div>
);

const ImprovedApartmentCardSkeleton = () => (
  <Card className="overflow-hidden border-0 shadow-lg h-full">
    <div className="relative">
      <div className="h-64 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
      <div className="absolute top-4 left-4 space-y-2">
        <div className="w-20 h-6 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="w-16 h-6 bg-gray-300 rounded-full animate-pulse"></div>
      </div>
      <div className="absolute bottom-4 right-4">
        <div className="w-24 h-8 bg-gray-300 rounded-lg animate-pulse"></div>
      </div>
    </div>
    <CardContent className="p-6">
      <div className="mb-4">
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-1/2"></div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-gray-100 rounded-xl animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          ></div>
        ))}
      </div>
      <div className="flex justify-between items-center gap-3">
        <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-10 w-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-12 bg-gray-200 rounded animate-pulse animation-delay-75"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Основная страница моих апартаментов
export default function MyApartmentsPage() {
  const {
    profile,
    editedProfile,
    isEditing,
    loading,
    startEditing,
    cancelEditing,
    updateField,
    hasChanges,
    setProfile,
  } = useProfileStore();

  const ownerId = profile?.userId;

  // Состояния для управления UI
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Запрос на получение апартаментов
  const {
    data: apartments,
    isLoading,
    isError,
    error,
    refetch,
  } = useOwnerApartments(ownerId === undefined ? "" : ownerId, {
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Мутация для удаления апартаментов
  const deleteMutation = useDeleteApartment({
    onSuccess: () => {
      toast.success("🎉 Apartment successfully deleted!", {
        position: "top-right",
        autoClose: 3000,
      });
      refetch();
    },
    onError: (error) => {
      toast.error(`❌ Failed to delete apartment: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });

  useEffect(() => {
    console.log("Apartments data:", apartments);
  }, [apartments]);
  // Фильтрация и сортировка апартаментов
  const filteredAndSortedApartments = apartments
    ? apartments
        .filter((apartment) => {
          const matchesSearch =
            apartment.apartment_name
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            apartment.address.street
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            apartment.district_name
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            (apartment.university_nearby || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase());

          let matchesStatus = true;
          if (statusFilter === "active") matchesStatus = apartment.is_active;
          else if (statusFilter === "inactive")
            matchesStatus = !apartment.is_active;
          else if (statusFilter === "promoted")
            matchesStatus = apartment.is_promoted;

          return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
          let aValue: any, bValue: any;

          switch (sortField) {
            case "name":
              aValue = a.apartment_name.toLowerCase();
              bValue = b.apartment_name.toLowerCase();
              break;
            case "price":
              aValue = a.price_per_month;
              bValue = b.price_per_month;
              break;
            case "created_at":
              aValue = new Date(a.created_at || 0);
              bValue = new Date(b.created_at || 0);
              break;
            case "available_from":
              aValue = new Date(a.available_from);
              bValue = new Date(b.available_from);
              break;
            case "district_name":
              aValue = a.district_name.toLowerCase();
              bValue = b.district_name.toLowerCase();
              break;
            case "university_nearby":
              aValue = (a.university_nearby || "").toLowerCase();
              bValue = (b.university_nearby || "").toLowerCase();
              break;
            default:
              return 0;
          }

          if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
          if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
          return 0;
        })
    : [];

  // Статистика
  const stats = {
    total: apartments?.length || 0,
    active: apartments?.filter((apt) => apt.is_active).length || 0,
    featured: apartments?.filter((apt) => apt.is_promoted).length || 0,
    avgPrice: apartments?.length
      ? Math.round(
          apartments.reduce((sum, apt) => sum + apt.price_per_month, 0) /
            apartments.length,
        )
      : 0,
  };

  // Пагинация
  const totalPages = Math.ceil(
    filteredAndSortedApartments.length / itemsPerPage,
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApartments = filteredAndSortedApartments.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Сброс текущей страницы при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortField, sortOrder, itemsPerPage]);

  const handleDelete = (apartmentId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this apartment? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate(apartmentId);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

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

      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Property Management
              </h1>
              <p className="text-gray-600 text-lg">
                Manage and monitor your apartment listings
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/apartment/create">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2.5">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Property
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {!isLoading && apartments && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <StatsCard
              icon={Building2}
              title="Total Properties"
              value={stats.total}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
            />
            <StatsCard
              icon={Activity}
              title="Active Listings"
              value={stats.active}
              color="bg-gradient-to-r from-green-500 to-green-600"
            />
            <StatsCard
              icon={Star}
              title="Featured"
              value={stats.featured}
              color="bg-gradient-to-r from-amber-500 to-orange-500"
            />
            <StatsCard
              icon={DollarSign}
              title="Avg. Price"
              value={formatPrice(stats.avgPrice)}
              color="bg-gradient-to-r from-purple-500 to-purple-600"
            />
          </div>
        )}

        {/* Controls */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full xl:w-auto">
                {/* Search */}
                <div className="relative flex-1 min-w-0 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search properties..."
                    className="pl-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white h-11"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                  <Select
                    value={statusFilter}
                    onValueChange={(value: StatusFilter) =>
                      setStatusFilter(value)
                    }
                  >
                    <SelectTrigger className="w-full sm:w-40 border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-11">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="inactive">Inactive Only</SelectItem>
                      <SelectItem value="promoted">Featured Only</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(Number(value))}
                  >
                    <SelectTrigger className="w-full sm:w-32 border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="5">5 per page</SelectItem>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="25">25 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* View Mode Toggle & Sort */}
              <div className="flex items-center gap-3">
                <Select
                  value={`${sortField}-${sortOrder}`}
                  onValueChange={(value) => {
                    const [field, order] = value.split("-");
                    setSortField(field as SortField);
                    setSortOrder(order as SortOrder);
                  }}
                >
                  <SelectTrigger className="w-40 border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-11">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="created_at-desc">
                      Newest First
                    </SelectItem>
                    <SelectItem value="created_at-asc">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="price-asc">Price Low-High</SelectItem>
                    <SelectItem value="price-desc">Price High-Low</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className={`h-9 px-3 ${viewMode === "table" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`h-9 px-3 ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results info */}
            {isLoading && (
              <div className="space-y-6">
                {/* Основной красивый лоадинг */}
                <BeautifulLoading />

                {/* Опционально: показать скелетоны под основным лоадингом */}
                <div className="opacity-30">
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {[...Array(4)].map((_, index) => (
                        <ImprovedApartmentCardSkeleton key={index} />
                      ))}
                    </div>
                  ) : (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50/50 border-b border-gray-100">
                              <TableHead className="font-semibold text-gray-700">
                                Image
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700">
                                Property
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700">
                                Status
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700">
                                University Nearby
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700">
                                Published
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700">
                                Price
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700">
                                Address
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...Array(3)].map((_, index) => (
                              <TableRowSkeleton key={index} />
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content */}
        <div className="space-y-6">
          {isLoading && (
            <div>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, index) => (
                    <ApartmentCardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50 border-b border-gray-100">
                          <TableHead className="font-semibold text-gray-700">
                            Image
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Property
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            University Nearby
                          </TableHead>

                          <TableHead className="font-semibold text-gray-700">
                            Published
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Price
                          </TableHead>
                          {/* <TableHead className="font-semibold text-gray-700">
                            ID
                          </TableHead> */}
                          <TableHead className="font-semibold text-gray-700">
                            Address
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...Array(5)].map((_, index) => (
                          <TableRowSkeleton key={index} />
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {isError && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <Activity className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Unable to Load Properties
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {error?.message ||
                      "We're having trouble loading your apartment listings. Please check your connection and try again."}
                  </p>
                  <Button
                    onClick={() => refetch()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading &&
            !isError &&
            filteredAndSortedApartments.length === 0 &&
            apartments &&
            apartments.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Start Your Property Journey
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                      You haven't created any apartment listings yet. Create
                      your first property listing and start earning.
                    </p>
                    <Link href="/apartment/create">
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg">
                        <Plus className="h-5 w-5 mr-2" />
                        Create Your First Listing
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

          {!isLoading &&
            !isError &&
            filteredAndSortedApartments.length === 0 &&
            apartments &&
            apartments.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Results Found
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      No properties match your current search and filter
                      criteria. Try adjusting your filters or search terms.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

          {!isLoading && !isError && filteredAndSortedApartments.length > 0 && (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                  {paginatedApartments.map((apartment) => (
                    <ApartmentCard
                      key={apartment.apartmentId}
                      apartment={apartment}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50 border-b border-gray-100 hover:bg-gray-50/50">
                            <TableHead className="font-semibold text-gray-700 w-20">
                              Image
                            </TableHead>
                            <TableHead
                              className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/50 transition-colors"
                              onClick={() => handleSort("name")}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Property</span>
                                {getSortIcon("name")}
                              </div>
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Status
                            </TableHead>
                            <TableHead
                              className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/50 transition-colors"
                              onClick={() => handleSort("university_nearby")}
                            >
                              <div className="flex items-center space-x-1">
                                <span>University Nearby</span>
                                {getSortIcon("university_nearby")}
                              </div>
                            </TableHead>
                            <TableHead
                              className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/50 transition-colors"
                              onClick={() => handleSort("created_at")}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Published</span>
                                {getSortIcon("created_at")}
                              </div>
                            </TableHead>
                            <TableHead
                              className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/50 transition-colors"
                              onClick={() => handleSort("price")}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Price</span>
                                {getSortIcon("price")}
                              </div>
                            </TableHead>
                            {/* <TableHead className="font-semibold text-gray-700">
                              ID
                            </TableHead> */}
                            <TableHead className="font-semibold text-gray-700">
                              Address
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 w-16">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedApartments.map((apartment) => (
                            <ApartmentTableRow
                              key={apartment.apartmentId}
                              apartment={apartment}
                              onDelete={handleDelete}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="px-6 py-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const shimmerStyles = `
@keyframes shimmer {
  0% { background-position: -400% 0; }
  100% { background-position: 400% 0; }
}

.animation-delay-75 {
  animation-delay: 75ms;
}

.animation-delay-150 {
  animation-delay: 150ms;
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-300 {
  animation-delay: 300ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}
`;
