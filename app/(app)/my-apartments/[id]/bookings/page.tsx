"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Calendar,
  Clock,
  Building2,
  Users,
  Activity,
  MoreHorizontal,
  FileText,
  UserCheck,
  Mail,
  Phone,
  BookOpen,
  X,
  Check,
  MessageSquare,
  RefreshCw,
  ChevronLeft,
  ArrowLeft,
  Filter,
  Search,
  Eye,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  DollarSign,
  CheckCircle,
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
import Link from "next/link";

// Импортируем API функции
import {
  getApartmentBookings,
  updateBookingStatus,
} from "@/lib/api_from_swagger/booking";
import { getUserById } from "@/lib/api_from_swagger/users";
import { getApartmentById } from "@/lib/api_from_swagger/apartments";

// Типы
interface BookingData {
  apartmentId: string;
  check_in_date: string;
  check_out_date: string;
  created_at: string;
  message: string;
  updated_at: string;
  bookingId?: string;
  userId?: string;
  status?: "pending" | "accepted" | "rejected" | "cancelled" | "completed";
}

interface UserData {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  university?: string;
  created_at?: string;
}

interface ApartmentData {
  apartmentId: string;
  apartment_name: string;
  district_name: string;
  price_per_month: number;
  address: {
    street: string;
  };
}

type StatusFilter =
  | "all"
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";
type SortField = "created_at" | "check_in_date" | "check_out_date" | "status";
type SortOrder = "asc" | "desc";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateRange = (checkIn: string, checkOut: string) => {
  const inDate = new Date(checkIn).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const outDate = new Date(checkOut).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${inDate} - ${outDate}`;
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: {
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      text: "Pending",
      icon: Clock,
    },
    accepted: {
      color: "bg-green-50 text-green-700 border-green-200",
      text: "Accepted",
      icon: Check,
    },
    rejected: {
      color: "bg-red-50 text-red-700 border-red-200",
      text: "Rejected",
      icon: X,
    },
    cancelled: {
      color: "bg-gray-50 text-gray-700 border-gray-200",
      text: "Cancelled",
      icon: X,
    },
    completed: {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      text: "Completed",
      icon: Check,
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const IconComponent = config.icon;

  return (
    <Badge
      className={`${config.color} font-medium border flex items-center gap-1`}
    >
      <IconComponent className="h-3 w-3" />
      {config.text}
    </Badge>
  );
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("kk-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
};

// Компонент статистической карточки
const StatsCard = ({
  icon: Icon,
  title,
  value,
  color,
  description,
}: {
  icon: any;
  title: string;
  value: string | number;
  color: string;
  description?: string;
}) => (
  <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Компонент модального окна с деталями пользователя
// Компонент модального окна с деталями пользователя (расширенная версия)
const UserDetailModal = ({
  userId,
  booking,
  isOpen,
  onClose,
}: {
  userId: string;
  booking: BookingData;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userNotFound, setUserNotFound] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !isOpen) return;

      setLoading(true);
      setError(null);
      setUserNotFound(false);
      try {
        const userData = await getUserById(userId);
        setUser(userData);
      } catch (err: any) {
        console.error("Failed to fetch user data:", err);
        if (
          err?.response?.status === 404 ||
          err?.message?.includes("not found")
        ) {
          setUserNotFound(true);
          setError("User not found");
        } else {
          setError("Failed to load user information");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-8 py-6 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <UserCheck className="h-6 w-6 mr-3 text-blue-600" />
              Detailed Application Review
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Complete information about this booking application and applicant
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-gray-200 hover:bg-gray-50 px-4 py-2"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600 text-lg">
                Loading user information...
              </span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <X className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                {userNotFound ? "User Not Found" : "Error Loading Data"}
              </h3>
              <p className="text-red-600 mb-6 text-lg">{error}</p>
              {userNotFound && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-sm text-yellow-800">
                    This user account may have been deleted or deactivated. The
                    booking information is still available below.
                  </p>
                </div>
              )}
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 place-items-center">
              {/* Left Column */}
              <div className="space-y-8 flex flex-col w-full max-w-2xl">
                <div className="flex justify-center"></div>
                {/* Booking Information */}
                <Card className="border border-gray-200 shadow-sm w-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center">
                      <Calendar className="h-6 w-6 mr-3 text-blue-600" />
                      Booking Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Booking ID
                        </p>
                        <p className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">
                          #{booking.bookingId?.slice(-8) || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Status
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(booking.status || "pending")}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Applied On
                        </p>
                        <p className="text-sm text-gray-900">
                          {formatDateTime(booking.created_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Last Updated
                        </p>
                        <p className="text-sm text-gray-900">
                          {formatDateTime(booking.updated_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Check-in Date
                        </p>
                        <p className="text-sm text-gray-900 font-medium">
                          {formatDate(booking.check_in_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Check-out Date
                        </p>
                        <p className="text-sm text-gray-900 font-medium">
                          {formatDate(booking.check_out_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Duration
                        </p>
                        <p className="text-sm text-gray-900 font-medium">
                          {Math.ceil(
                            (new Date(booking.check_out_date).getTime() -
                              new Date(booking.check_in_date).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          days
                        </p>
                      </div>
                      <div>
                        {/* <p className="text-sm font-medium text-gray-500 mb-1">
                          Apartment ID
                        </p>
                        <p className="text-sm text-gray-900 font-mono">
                          {booking.apartmentId}
                        </p> */}
                      </div>
                    </div>

                    {booking.message && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-3">
                          Message from Applicant
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <MessageSquare className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {booking.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Basic User Information */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center">
                      <UserCheck className="h-6 w-6 mr-3 text-green-600" />
                      Basic Information
                      {userNotFound && (
                        <Badge
                          variant="outline"
                          className="ml-3 text-red-600 border-red-200"
                        >
                          User Not Found
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {userNotFound ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-center mb-3">
                          <X className="h-6 w-6 text-red-500 mr-3" />
                          <span className="font-medium text-red-800 text-lg">
                            User Account Not Available
                          </span>
                        </div>
                        <p className="text-sm text-red-700 mb-4">
                          The user who submitted this application is no longer
                          available. This could be due to account deletion or
                          deactivation.
                        </p>
                        <div className="mt-4 text-sm text-gray-600 space-y-2">
                          <p>
                            <strong>User ID:</strong> {userId}
                          </p>
                          <p>
                            <strong>Application Date:</strong>{" "}
                            {formatDateTime(booking.created_at)}
                          </p>
                        </div>
                      </div>
                    ) : user ? (
                      <div className="space-y-6">
                        {/* Profile Summary */}
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                            <UserCheck className="h-8 w-8 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {user.name || "Not provided"}
                            </h3>
                            <p className="text-gray-600">
                              {user.email || "No email"}
                            </p>
                            <p className="text-sm text-gray-500">
                              Member since{" "}
                              {user.created_at
                                ? formatDate(user.created_at)
                                : "Unknown"}
                            </p>
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {user.email && (
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-2">
                                Email Address
                              </p>
                              <div className="flex items-center bg-white border border-gray-200 rounded-lg p-3">
                                <Mail className="h-5 w-5 mr-3 text-blue-500" />
                                <a
                                  href={`mailto:${user.email}`}
                                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  {user.email}
                                </a>
                              </div>
                            </div>
                          )}
                          {user.phone && (
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-2">
                                Phone Number
                              </p>
                              <div className="flex items-center bg-white border border-gray-200 rounded-lg p-3">
                                <Phone className="h-5 w-5 mr-3 text-green-500" />
                                <a
                                  href={`tel:${user.phone}`}
                                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                                >
                                  {user.phone}
                                </a>
                              </div>
                            </div>
                          )}
                          {user.university && (
                            <div className="md:col-span-2">
                              <p className="text-sm font-medium text-gray-500 mb-2">
                                University
                              </p>
                              <div className="flex items-center bg-white border border-gray-200 rounded-lg p-3">
                                <BookOpen className="h-5 w-5 mr-3 text-purple-500" />
                                <p className="text-sm text-gray-900 font-medium">
                                  {user.university}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Account Status */}
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-3">
                            Account Status
                          </p>
                          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                              <span className="text-sm font-medium text-gray-900">
                                Active Account
                              </span>
                            </div>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Verified
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Additional Details */}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t px-8 py-6 flex items-center justify-between shadow-sm">
          <div className="text-sm text-gray-500">
            Application submitted on {formatDate(booking.created_at)}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-300 hover:bg-gray-50"
            >
              Close
            </Button>
            {/* {!userNotFound && user && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Applicant
              </Button>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент строки таблицы для заявки
const ApplicationTableRow = ({
  booking,
  onStatusUpdate,
  onViewDetails,
}: {
  booking: BookingData;
  onStatusUpdate: (bookingId: string, status: string) => Promise<void>;
  onViewDetails: (booking: BookingData) => void;
}) => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Loading...");
  const [userEmail, setUserEmail] = useState<string>("");

  // Загружаем информацию о пользователе для отображения в таблице
  useEffect(() => {
    const fetchUserName = async () => {
      if (!booking.userId) {
        setUserName("Unknown User");
        return;
      }

      try {
        const userData = await getUserById(booking.userId);
        setUserName(userData.name || "No Name");
        setUserEmail(userData.email || "");
      } catch (error) {
        console.error("Failed to fetch user name:", error);
        setUserName("User Not Found");
      }
    };

    fetchUserName();
  }, [booking.userId]);

  const handleStatusUpdate = async (newStatus: string) => {
    const bookingId = booking.bookingId;
    if (!bookingId) {
      toast.error("Booking ID is missing", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsUpdating(newStatus);
    try {
      await onStatusUpdate(bookingId, newStatus);
      toast.success(`Application ${newStatus} successfully!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Failed to update booking status:", error);
      toast.error(`Failed to ${newStatus} application`, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <TableRow className="hover:bg-blue-50/30 transition-colors">
      <TableCell className="py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{userName}</p>
            <p className="text-sm text-gray-600">
              #{booking.bookingId?.slice(-8) || "N/A"}
            </p>
            {userEmail && <p className="text-xs text-gray-500">{userEmail}</p>}
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="text-sm">
          <p className="font-medium text-gray-900">
            {formatDateRange(booking.check_in_date, booking.check_out_date)}
          </p>
          <p className="text-gray-500">
            Applied: {formatDate(booking.created_at)}
          </p>
          <p className="text-xs text-gray-400">
            Duration:{" "}
            {Math.ceil(
              (new Date(booking.check_out_date).getTime() -
                new Date(booking.check_in_date).getTime()) /
                (1000 * 60 * 60 * 24),
            )}{" "}
            days
          </p>
        </div>
      </TableCell>
      <TableCell className="py-4">
        {getStatusBadge(booking.status || "pending")}
      </TableCell>
      <TableCell className="py-4">
        {booking.message ? (
          <div className="max-w-xs">
            <p
              className="text-sm text-gray-700 truncate"
              title={booking.message}
            >
              {booking.message}
            </p>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">No message</span>
        )}
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center gap-2">
          {booking.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusUpdate("accepted")}
                disabled={isUpdating === "accepted"}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isUpdating === "accepted" ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Check className="h-3 w-3 mr-1" />
                )}
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate("rejected")}
                disabled={isUpdating === "rejected"}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                {isUpdating === "rejected" ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <X className="h-3 w-3 mr-1" />
                )}
                Reject
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(booking)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
      </TableCell>
    </TableRow>
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
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center text-sm text-gray-700">
        <p>
          Showing page <span className="font-medium">{currentPage}</span> of{" "}
          <span className="font-medium">{totalPages}</span>
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="hidden sm:flex h-8 w-8 p-0 border-gray-200 hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          <ChevronLeft className="h-4 w-4 -ml-2" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0 border-gray-200 hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <div key={index}>
              {page === "..." ? (
                <div className="flex h-8 w-8 items-center justify-center">
                  <span className="text-gray-400 text-sm">...</span>
                </div>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={`h-8 w-8 p-0 text-sm ${
                    currentPage === page
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 p-0 border-gray-200 hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="hidden sm:flex h-8 w-8 p-0 border-gray-200 hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
          <ChevronRight className="h-4 w-4 -ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default function ApartmentApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const apartmentId = params.id as string;

  const [apartment, setApartment] = useState<ApartmentData | null>(null);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(
    null,
  );
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Загрузка данных квартиры и заявок
  const fetchData = async () => {
    if (!apartmentId) return;

    setIsLoading(true);
    setError(null);
    try {
      const [apartmentData, bookingsData] = await Promise.all([
        getApartmentById(apartmentId),
        getApartmentBookings(apartmentId),
      ]);

      setApartment(apartmentData);
      setBookings(bookingsData || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load application data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apartmentId]);

  // Фильтрация и сортировка заявок
  useEffect(() => {
    let filtered = bookings;

    // Поиск
    if (searchQuery) {
      filtered = filtered.filter(
        (booking) =>
          booking.bookingId
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          booking.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.message?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Фильтр по статусу
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case "created_at":
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case "check_in_date":
          aValue = new Date(a.check_in_date);
          bValue = new Date(b.check_in_date);
          break;
        case "check_out_date":
          aValue = new Date(a.check_out_date);
          bValue = new Date(b.check_out_date);
          break;
        case "status":
          aValue = a.status || "pending";
          bValue = b.status || "pending";
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [bookings, searchQuery, statusFilter, sortField, sortOrder]);

  // Обновление статуса заявки
  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      await updateBookingStatus(bookingId, status as any);
      await fetchData();
    } catch (error) {
      console.error("Failed to update booking status:", error);
      throw error;
    }
  };

  // Открытие модального окна с деталями
  const handleViewDetails = (booking: BookingData) => {
    setSelectedBooking(booking);
    setIsUserModalOpen(true);
  };

  // Обработка сортировки
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Получение иконки сортировки
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  // Очистка всех фильтров
  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  // Статистика
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    accepted: bookings.filter((b) => b.status === "accepted").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  };

  // Пагинация
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Loading Applications
            </h3>
            <p className="text-gray-600">
              Please wait while we fetch your applications...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Activity className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Unable to Load Applications
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <Button
              onClick={fetchData}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <Link href="/my-apartments">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Properties
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Applications Management
              </h1>
              {apartment && (
                <div className="space-y-1">
                  <p className="text-xl font-semibold text-gray-900">
                    {apartment.apartment_name}
                  </p>
                  <p className="text-gray-600">
                    {apartment.district_name} •{" "}
                    {formatPrice(apartment.price_per_month)}/month
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={fetchData}
                className="border-gray-200 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <StatsCard
            icon={FileText}
            title="Total Applications"
            value={stats.total}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          <StatsCard
            icon={Clock}
            title="Pending Review"
            value={stats.pending}
            color="bg-gradient-to-r from-yellow-500 to-yellow-600"
          />
          <StatsCard
            icon={Check}
            title="Accepted"
            value={stats.accepted}
            color="bg-gradient-to-r from-green-500 to-green-600"
          />
          <StatsCard
            icon={X}
            title="Rejected"
            value={stats.rejected}
            color="bg-gradient-to-r from-red-500 to-red-600"
          />
        </div>

        {/* Filters */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              {/* Search and Clear */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative flex-1 min-w-0 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search applications..."
                    className="pl-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white h-11"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="border-gray-200 hover:bg-gray-50 h-11 px-4"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-3">
                <Select
                  value={statusFilter}
                  onValueChange={(value: StatusFilter) =>
                    setStatusFilter(value)
                  }
                >
                  <SelectTrigger className="w-40 border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-10">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={`${sortField}-${sortOrder}`}
                  onValueChange={(value) => {
                    const [field, order] = value.split("-");
                    setSortField(field as SortField);
                    setSortOrder(order as SortOrder);
                  }}
                >
                  <SelectTrigger className="w-40 border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-10">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="created_at-desc">
                      Newest First
                    </SelectItem>
                    <SelectItem value="created_at-asc">Oldest First</SelectItem>
                    <SelectItem value="check_in_date-asc">
                      Check-in Date
                    </SelectItem>
                    <SelectItem value="check_out_date-asc">
                      Check-out Date
                    </SelectItem>
                    <SelectItem value="status-asc">Status A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                >
                  <SelectTrigger className="w-32 border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-10">
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

              {/* Filter Summary */}
              {(searchQuery || statusFilter !== "all") && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <Filter className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Active filters:</span>
                  {searchQuery && (
                    <Badge variant="outline" className="bg-white">
                      Search: "{searchQuery}"
                    </Badge>
                  )}
                  {statusFilter !== "all" && (
                    <Badge variant="outline" className="bg-white">
                      Status: {statusFilter}
                    </Badge>
                  )}
                  <span className="ml-2 font-medium text-blue-600">
                    {filteredBookings.length} results
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        {filteredBookings.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {bookings.length === 0
                    ? "No Applications Yet"
                    : "No Matching Applications"}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {bookings.length === 0
                    ? "No one has applied for this property yet. Once applications come in, they'll appear here."
                    : "No applications match your current search and filter criteria. Try adjusting your filters."}
                </p>
                {bookings.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="mt-4 border-gray-200 hover:bg-gray-50"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 border-0 hover:bg-gray-50/50">
                        <TableHead
                          className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/50 transition-colors border-0"
                          onClick={() => handleSort("created_at")}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Applicant</span>
                            {getSortIcon("created_at")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/50 transition-colors border-0"
                          onClick={() => handleSort("check_in_date")}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Dates</span>
                            {getSortIcon("check_in_date")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/50 transition-colors border-0"
                          onClick={() => handleSort("status")}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Status</span>
                            {getSortIcon("status")}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 border-0">
                          Message
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 border-0">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBookings.map((booking) => (
                        <ApplicationTableRow
                          key={booking.bookingId || Math.random().toString()}
                          booking={booking}
                          onStatusUpdate={handleStatusUpdate}
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
              <Card className="border-0 shadow-lg mt-6">
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

      {/* User Detail Modal */}
      {selectedBooking && (
        <UserDetailModal
          userId={selectedBooking.userId || ""}
          booking={selectedBooking}
          isOpen={isUserModalOpen}
          onClose={() => {
            setIsUserModalOpen(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}
