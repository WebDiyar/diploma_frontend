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
import { Separator } from "@/components/ui/separator";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Calendar,
  MapPin,
  Home,
  DollarSign,
  SquareUser,
  ArrowUpRight,
  Edit,
  Trash2,
  Loader2,
  Star,
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
  Check,
  X,
  UserCheck,
  Mail,
  Phone,
  AlertCircle,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { fakeBookingRequests } from "@/types/booking";

interface BookingRequest {
  id: string;
  room: string;
  apartment: string;
  apartmentId: string;
  price: number;
  tenant: {
    name: string;
    avatar: string;
    email: string;
    phone: string;
    country: string;
  };
  location: string;
  dateApplication: string;
  status: "pending" | "accepted" | "rejected" | "waiting";
  checkInDate: string;
  checkOutDate: string;
  duration: number;
  message?: string;
}

// Utility functions - Fixed hydration issue
const formatPrice = (price: number): string => {
  return price.toLocaleString("en-US") + " KZT";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "accepted":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
          Accepted
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
          Rejected
        </Badge>
      );
    case "waiting":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
          Waiting
        </Badge>
      );
    default:
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
          Pending
        </Badge>
      );
  }
};

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

// Table Row Skeleton
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-4 w-4" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-12 w-16 rounded-lg" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-32" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-20" />
    </TableCell>
    <TableCell>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-16" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-16 rounded-full" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-8 w-8 rounded-full" />
    </TableCell>
  </TableRow>
);

// Booking Request Table Row
const BookingRequestTableRow = ({
  request,
  onAccept,
  onReject,
  onViewDetails,
}: {
  request: BookingRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (id: string) => void;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAccept(request.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(request.id);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <TableRow className="hover:bg-blue-50/30 transition-colors border-b border-gray-100">
      <TableCell className="py-4">
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </TableCell>
      <TableCell className="py-4">
        <div className="h-12 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="w-full h-full flex items-center justify-center">
            <Home className="h-6 w-6 text-gray-400" />
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex flex-col space-y-1">
          <span className="font-semibold text-gray-900">{request.room}</span>
          <span className="text-sm text-gray-500">{request.apartment}</span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
          {formatPrice(request.price)}
        </span>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={request.tenant.avatar}
              alt={request.tenant.name}
            />
            <AvatarFallback>
              {request.tenant.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {request.tenant.name}
            </span>
            <span className="text-xs text-gray-500">
              {request.tenant.email}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <span className="text-gray-600 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {request.tenant.country}
        </span>
      </TableCell>
      <TableCell className="py-4">
        <span
          className="text-gray-600 truncate max-w-32"
          title={request.location}
        >
          {request.location}
        </span>
      </TableCell>
      <TableCell className="py-4">
        <span className="text-gray-600">
          {formatDate(request.dateApplication)}
        </span>
      </TableCell>
      <TableCell className="py-4">{getStatusBadge(request.status)}</TableCell>
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
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => onViewDetails(request.id)}
              className="cursor-pointer"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open(`mailto:${request.tenant.email}`)}
              className="cursor-pointer"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open(`tel:${request.tenant.phone}`)}
              className="cursor-pointer"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Tenant
            </DropdownMenuItem>
            {request.status === "pending" || request.status === "waiting" ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="cursor-pointer text-green-600 focus:text-green-600"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Accept Request
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  Reject Request
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
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

// Main Booking Requests Page
export default function BookingRequestsPage() {
  const router = useRouter();
  const [bookingRequests, setBookingRequests] =
    useState<BookingRequest[]>(fakeBookingRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("dateApplication");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter and sort booking requests
  const filteredAndSortedRequests = bookingRequests
    .filter((request) => {
      const matchesSearch =
        request.tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.apartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.location.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStatus = true;
      if (statusFilter !== "all") {
        matchesStatus = request.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case "tenant":
          aValue = a.tenant.name.toLowerCase();
          bValue = b.tenant.name.toLowerCase();
          break;
        case "apartment":
          aValue = a.apartment.toLowerCase();
          bValue = b.apartment.toLowerCase();
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "dateApplication":
          aValue = new Date(a.dateApplication);
          bValue = new Date(b.dateApplication);
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // Statistics
  const stats = {
    total: bookingRequests.length,
    pending: bookingRequests.filter((req) => req.status === "pending").length,
    accepted: bookingRequests.filter((req) => req.status === "accepted").length,
    waiting: bookingRequests.filter((req) => req.status === "waiting").length,
  };

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredAndSortedRequests.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortField, sortOrder, itemsPerPage]);

  const handleAccept = (requestId: string) => {
    setBookingRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "accepted" as const } : req,
      ),
    );
    toast.success("🎉 Booking request accepted!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleReject = (requestId: string) => {
    setBookingRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "rejected" as const } : req,
      ),
    );
    toast.success("❌ Booking request rejected", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  // Updated to use Next.js navigation
  const handleViewDetails = (requestId: string) => {
    router.push(`/booking/${requestId}`);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: string) => {
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Booking Requests
              </h1>
              <p className="text-gray-600 text-lg">
                Manage tenant applications and booking requests
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <StatsCard
            icon={UserCheck}
            title="Total Requests"
            value={stats.total}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          <StatsCard
            icon={Clock}
            title="Pending"
            value={stats.pending}
            trend="Awaiting review"
            color="bg-gradient-to-r from-yellow-500 to-orange-500"
          />
          <StatsCard
            icon={Check}
            title="Accepted"
            value={stats.accepted}
            trend="Ready to move in"
            color="bg-gradient-to-r from-green-500 to-green-600"
          />
          <StatsCard
            icon={AlertCircle}
            title="Waiting"
            value={stats.waiting}
            trend="In progress"
            color="bg-gradient-to-r from-purple-500 to-purple-600"
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
                    placeholder="Search tenants, apartments..."
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
                      <SelectItem value="waiting">Waiting Only</SelectItem>
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
                      <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-3">
                <Select
                  value={`${sortField}-${sortOrder}`}
                  onValueChange={(value) => {
                    const [field, order] = value.split("-");
                    setSortField(field);
                    setSortOrder(order as "asc" | "desc");
                  }}
                >
                  <SelectTrigger className="w-48 border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-11">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dateApplication-desc">
                      Newest First
                    </SelectItem>
                    <SelectItem value="dateApplication-asc">
                      Oldest First
                    </SelectItem>
                    <SelectItem value="tenant-asc">Tenant A-Z</SelectItem>
                    <SelectItem value="tenant-desc">Tenant Z-A</SelectItem>
                    <SelectItem value="apartment-asc">Apartment A-Z</SelectItem>
                    <SelectItem value="apartment-desc">
                      Apartment Z-A
                    </SelectItem>
                    <SelectItem value="price-asc">Price Low-High</SelectItem>
                    <SelectItem value="price-desc">Price High-Low</SelectItem>
                    <SelectItem value="status-asc">Status A-Z</SelectItem>
                    <SelectItem value="status-desc">Status Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results info */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-sm text-gray-600">
                  Showing {paginatedRequests.length} of{" "}
                  {filteredAndSortedRequests.length} booking requests
                  {searchQuery && ` matching "${searchQuery}"`}
                </span>
                {filteredAndSortedRequests.length !==
                  bookingRequests.length && (
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
          {isLoading && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 border-b border-gray-100">
                      <TableHead className="font-semibold text-gray-700 w-12"></TableHead>
                      <TableHead className="font-semibold text-gray-700 w-20">
                        Room
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Apartment
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Price
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Tenants
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Country
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Location
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Date Application
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 w-16">
                        More
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

          {!isLoading &&
            filteredAndSortedRequests.length === 0 &&
            bookingRequests.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      No Booking Requests Yet
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                      You haven't received any booking requests yet. Once
                      tenants start applying for your properties, they'll appear
                      here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

          {!isLoading &&
            filteredAndSortedRequests.length === 0 &&
            bookingRequests.length > 0 && (
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
                      No booking requests match your current search and filter
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

          {!isLoading && filteredAndSortedRequests.length > 0 && (
            <>
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50 border-b border-gray-100 hover:bg-gray-50/50">
                          <TableHead className="font-semibold text-gray-700 w-12">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700 w-20">
                            Room
                          </TableHead>
                          <TableHead
                            className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/50 transition-colors"
                            onClick={() => handleSort("apartment")}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Apartment</span>
                              {getSortIcon("apartment")}
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
                          <TableHead
                            className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/50 transition-colors"
                            onClick={() => handleSort("tenant")}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Tenants</span>
                              <ChevronDown className="h-4 w-4" />
                              {getSortIcon("tenant")}
                            </div>
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Country
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Location
                          </TableHead>
                          <TableHead
                            className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/50 transition-colors"
                            onClick={() => handleSort("dateApplication")}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Date Application</span>
                              {getSortIcon("dateApplication")}
                            </div>
                          </TableHead>
                          <TableHead
                            className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/50 transition-colors"
                            onClick={() => handleSort("status")}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Status</span>
                              {getSortIcon("status")}
                            </div>
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700 w-16">
                            More
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedRequests.map((request) => (
                          <BookingRequestTableRow
                            key={request.id}
                            request={request}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            onViewDetails={handleViewDetails}
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
        </div>

        {/* Quick Actions Panel */}
        {filteredAndSortedRequests.some(
          (req) => req.status === "pending" || req.status === "waiting",
        ) && (
          <Card className="mt-8 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quick Actions
                  </h3>
                  <p className="text-gray-600">
                    You have{" "}
                    {
                      filteredAndSortedRequests.filter(
                        (req) =>
                          req.status === "pending" || req.status === "waiting",
                      ).length
                    }{" "}
                    requests awaiting your response
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    className="bg-white border-gray-200 hover:bg-gray-50"
                    onClick={() => {
                      const pendingRequests = filteredAndSortedRequests.filter(
                        (req) =>
                          req.status === "pending" || req.status === "waiting",
                      );
                      if (
                        pendingRequests.length > 0 &&
                        window.confirm(
                          `Accept all ${pendingRequests.length} pending requests?`,
                        )
                      ) {
                        pendingRequests.forEach((req) => handleAccept(req.id));
                      }
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accept All Pending
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white border-gray-200 hover:bg-gray-50"
                    onClick={() => setStatusFilter("pending")}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Show Pending Only
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
