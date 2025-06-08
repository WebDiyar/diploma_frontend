"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Calendar,
  MapPin,
  Home,
  DollarSign,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  Clock,
  TrendingUp,
  Activity,
  MoreHorizontal,
  Check,
  X,
  AlertCircle,
  MessageCircle,
  FileText,
  Phone,
  ExternalLink,
} from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/store/profileStore";

// API imports
import { getUserBookings } from "@/lib/api_from_swagger/booking";
import { getApartmentById } from "@/lib/api_from_swagger/apartments";

enum BookingStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

interface BookingWithApartment {
  bookingId?: string;
  apartmentId: string;
  check_in_date: string;
  check_out_date: string;
  created_at: string;
  message: string;
  updated_at: string;
  userId?: string;
  status?: BookingStatus;
  apartment?: any;
}

// Utility functions
const formatPrice = (price: number): string => {
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

const getStatusBadge = (status: string) => {
  switch (status) {
    case "accepted":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
          <Check className="h-3 w-3 mr-1" />
          Accepted
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
          <X className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">
          <X className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
          <Check className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
  }
};

const getImageUrl = (url: string) => {
  if (url?.startsWith("data:image")) {
    return url;
  }
  if (url && url.length > 100 && url.match(/^[A-Za-z0-9+/=]+$/)) {
    return `data:image/jpeg;base64,${url}`;
  }
  if (url?.startsWith("http://") || url?.startsWith("https://")) {
    if (url.includes("example.com")) {
      return `https://source.unsplash.com/random/800x600/?apartment&sig=${Math.random()}`;
    }
    return url;
  }
  return "https://source.unsplash.com/random/800x600/?apartment";
};

// Beautiful Loading Component
const BeautifulLoading = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
          <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin"></div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="h-8 w-8 text-blue-600 animate-pulse" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Loading Your Bookings
        </h3>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
        <p className="text-gray-500 text-sm">
          Fetching your booking requests...
        </p>
      </div>

      <div className="flex justify-center space-x-4 opacity-60">
        <div
          className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg animate-pulse flex items-center justify-center"
          style={{ animationDelay: "0.2s" }}
        >
          <Home className="h-6 w-6 text-blue-500" />
        </div>
        <div
          className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg animate-pulse flex items-center justify-center"
          style={{ animationDelay: "0.3s" }}
        >
          <MapPin className="h-6 w-6 text-purple-500" />
        </div>
        <div
          className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg animate-pulse flex items-center justify-center"
          style={{ animationDelay: "0.4s" }}
        >
          <DollarSign className="h-6 w-6 text-indigo-500" />
        </div>
      </div>
    </div>
  </div>
);

// Stats Card Component
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
          {trend && (
            <p className="text-xs text-gray-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Booking Row Component
const BookingTableRow = ({ booking }: { booking: BookingWithApartment }) => {
  const router = useRouter();
  const [apartment, setApartment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (booking.apartmentId) {
          const apartmentData = await getApartmentById(booking.apartmentId);
          setApartment(apartmentData);
        }
      } catch (error) {
        console.error("Error fetching apartment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [booking.apartmentId]);

  const handleViewDetails = () => {
    // Переходим на отдельную страницу
    const bookingId = booking.bookingId || booking.apartmentId;
    router.push(`/booking/${bookingId}`);
  };

  const getDurationText = () => {
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? "s" : ""}`;
    }
  };

  return (
    <TableRow className="hover:bg-blue-50/30 transition-colors border-b border-gray-100">
      <TableCell className="py-4">
        <div className="h-12 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-sm">
          {apartment?.pictures && apartment.pictures.length > 0 ? (
            <img
              src={getImageUrl(apartment.pictures[0])}
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
          <span className="font-semibold text-gray-900">
            {apartment?.apartment_name || "Loading..."}
          </span>
          <span className="text-sm text-gray-500 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {apartment?.district_name || "Unknown location"}
          </span>
          {apartment?.university_nearby &&
            apartment.university_nearby !== "none" && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                📚 {apartment.university_nearby}
              </span>
            )}
        </div>
      </TableCell>
      <TableCell className="py-4">
        {apartment?.price_per_month ? (
          <div className="flex flex-col">
            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-sm">
              {formatPrice(apartment.price_per_month)}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {getDurationText()}
            </span>
          </div>
        ) : (
          <Skeleton className="h-6 w-20" />
        )}
      </TableCell>
      <TableCell className="py-4">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center text-sm text-green-600">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(booking.check_in_date)}
          </div>
          <span className="text-xs text-gray-400">to</span>
          <div className="flex items-center text-sm text-red-600">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(booking.check_out_date)}
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex flex-col space-y-1">
          <span className="text-gray-600 text-sm">
            {formatDate(booking.created_at)}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(booking.updated_at)} updated
          </span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        {getStatusBadge(booking.status || "pending")}
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
            onClick={handleViewDetails}
          >
            <Eye className="h-4 w-4" />
          </Button>

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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={handleViewDetails}
                className="cursor-pointer"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/apartments/${booking.apartmentId}`)
                }
                className="cursor-pointer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Apartment
              </DropdownMenuItem>
              {apartment?.contact_phone && (
                <DropdownMenuItem
                  onClick={() => window.open(`tel:${apartment.contact_phone}`)}
                  className="cursor-pointer"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Owner
                </DropdownMenuItem>
              )}
              {apartment?.contact_telegram && (
                <DropdownMenuItem
                  onClick={() =>
                    window.open(
                      `https://t.me/${apartment.contact_telegram.replace("@", "")}`,
                    )
                  }
                  className="cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Telegram
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
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

// Main My Bookings Page
export default function MyBookingsPage() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // State for API data
  const [userBookings, setUserBookings] = useState<BookingWithApartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!profile?.userId) return;

      setIsLoading(true);
      setIsError(false);

      try {
        const bookings = await getUserBookings(profile.userId);
        setUserBookings(bookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setIsError(true);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [profile?.userId]);

  // Filter bookings
  const filteredBookings = userBookings.filter((bookingItem) => {
    const matchesSearch =
      searchQuery === "" ||
      bookingItem.apartmentId
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      bookingItem.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (bookingItem.status || "pending") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: userBookings.length,
    pending: userBookings.filter(
      (bookingItem) => (bookingItem.status || "pending") === "pending",
    ).length,
    accepted: userBookings.filter(
      (bookingItem) => bookingItem.status === "accepted",
    ).length,
    rejected: userBookings.filter(
      (bookingItem) => bookingItem.status === "rejected",
    ).length,
  };

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, itemsPerPage]);

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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                My Bookings
              </h1>
              <p className="text-gray-600 text-lg">
                Track your apartment booking requests and their status
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <StatsCard
            icon={FileText}
            title="Total Requests"
            value={stats.total}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          <StatsCard
            icon={Clock}
            title="Pending"
            value={stats.pending}
            trend="Awaiting response"
            color="bg-gradient-to-r from-yellow-500 to-orange-500"
          />
          <StatsCard
            icon={Check}
            title="Accepted"
            value={stats.accepted}
            trend="Great news!"
            color="bg-gradient-to-r from-green-500 to-green-600"
          />
          <StatsCard
            icon={X}
            title="Rejected"
            value={stats.rejected}
            color="bg-gradient-to-r from-red-500 to-red-600"
          />
        </div>

        {/* Controls */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full xl:w-auto">
                {/* Search */}
                <div className="relative flex-1 min-w-0 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search bookings..."
                    className="pl-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white h-11"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                  <Select
                    value={statusFilter}
                    onValueChange={(value: string) => setStatusFilter(value)}
                  >
                    <SelectTrigger className="w-full sm:w-40 border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-11">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending Only</SelectItem>
                      <SelectItem value="accepted">Accepted Only</SelectItem>
                      <SelectItem value="rejected">Rejected Only</SelectItem>
                      <SelectItem value="cancelled">Cancelled Only</SelectItem>
                      <SelectItem value="completed">Completed Only</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(Number(value))}
                  >
                    <SelectTrigger className="w-full sm:w-32 border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="25">25 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Results info */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-sm text-gray-600">
                  Showing {paginatedBookings.length} of{" "}
                  {filteredBookings.length} bookings
                  {searchQuery && ` matching "${searchQuery}"`}
                </span>
                {filteredBookings.length !== userBookings.length && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                    className="w-fit text-gray-600 border-gray-200 hover:bg-gray-50"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="space-y-6">
          {isLoading && <BeautifulLoading />}

          {!isLoading && !isError && userBookings.length === 0 && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <FileText className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No Booking Requests Yet
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                    You haven't submitted any booking requests yet. Start
                    exploring apartments and submit your first request!
                  </p>
                  <Button
                    onClick={() => router.push("/apartments")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Browse Apartments
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading &&
            !isError &&
            filteredBookings.length === 0 &&
            userBookings.length > 0 && (
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
                      No bookings match your current search and filter criteria.
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

          {!isLoading && !isError && filteredBookings.length > 0 && (
            <>
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50 border-b border-gray-100 hover:bg-gray-50/50">
                          <TableHead className="font-semibold text-gray-700 w-20">
                            Photo
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Apartment
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Price
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Dates
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Submitted
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700 w-20">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedBookings.map((bookingItem, index) => (
                          <BookingTableRow
                            key={
                              bookingItem.bookingId ||
                              `${bookingItem.apartmentId}-${index}`
                            }
                            booking={bookingItem}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

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

          {isError && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Error Loading Bookings
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {error?.message ||
                      "Failed to load your bookings. Please try again."}
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
