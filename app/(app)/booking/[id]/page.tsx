"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Users,
  Clock,
  Activity,
  Check,
  X,
  AlertCircle,
  MessageCircle,
  Send,
  Phone,
  ArrowLeft,
  Building2,
  Calendar as CalendarIcon,
} from "lucide-react";

// API imports
import { getUserBookings } from "@/lib/api_from_swagger/booking";
import { getApartmentById } from "@/lib/api_from_swagger/apartments";
import { useProfileStore } from "@/store/profileStore";

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

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

// Loading Component
const LoadingPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="h-8 w-8 text-blue-600 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Loading Booking Details
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
      </div>
    </div>
  </div>
);

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useProfileStore();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingWithApartment | null>(null);
  const [apartment, setApartment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!profile?.userId || !bookingId) return;

      setLoading(true);
      try {
        // Получаем все booking'и пользователя
        const userBookings = await getUserBookings(profile.userId);

        // Находим нужный booking
        const foundBooking = userBookings.find(
          (b) => b.bookingId === bookingId || b.apartmentId === bookingId,
        );

        if (!foundBooking) {
          setError("Booking not found");
          return;
        }

        setBooking(foundBooking);

        // Загружаем данные квартиры
        if (foundBooking.apartmentId) {
          const apartmentData = await getApartmentById(
            foundBooking.apartmentId,
          );
          setApartment(apartmentData);
        }
      } catch (err) {
        console.error("Error fetching booking details:", err);
        setError("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [profile?.userId, bookingId]);

  const getDurationText = () => {
    if (!booking) return "";

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

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {error || "Booking not found"}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  The booking you're looking for doesn't exist or has been
                  removed.
                </p>
                <Button
                  onClick={() => router.push("/booking")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Bookings
                </Button>
              </div>
            </CardContent>
          </Card>
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
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/booking")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Bookings
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Booking Details
              </h1>
              <p className="text-gray-600">
                View your booking request information
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Apartment Info */}
          {apartment && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    {apartment.pictures && apartment.pictures.length > 0 ? (
                      <img
                        src={getImageUrl(apartment.pictures[0])}
                        alt={apartment.apartment_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {apartment.apartment_name}
                    </h2>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span className="text-lg">
                        {apartment.district_name}, {apartment.address?.street}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-gray-600 mb-4">
                      <span className="flex items-center">
                        <Home className="h-5 w-5 mr-2" />
                        {apartment.number_of_rooms} rooms
                      </span>
                      <span className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        {apartment.area} m²
                      </span>
                      <span className="flex items-center font-bold text-green-600 text-lg">
                        <DollarSign className="h-5 w-5 mr-2" />
                        {formatPrice(apartment.price_per_month)}
                      </span>
                    </div>
                    {apartment.university_nearby &&
                      apartment.university_nearby !== "none" && (
                        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block">
                          📚 Near {apartment.university_nearby}
                        </div>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Booking Status and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Status
                </h3>
                <div className="flex items-center">
                  {getStatusBadge(booking.status || "pending")}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Duration
                </h3>
                <p className="text-xl font-bold text-gray-900">
                  {getDurationText()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Submitted
                </h3>
                <p className="text-gray-600">
                  {formatDateTime(booking.created_at)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-green-600" />
                  Check-in
                </h3>
                <p className="text-xl font-bold text-gray-900">
                  {formatDateTime(booking.check_in_date)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-red-600" />
                  Check-out
                </h3>
                <p className="text-xl font-bold text-gray-900">
                  {formatDateTime(booking.check_out_date)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Message */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Your Message to Owner
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {booking.message || "No message provided"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {apartment &&
            (apartment.contact_phone || apartment.contact_telegram) && (
              <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <Send className="h-5 w-5 mr-2" />
                    Contact Owner
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {apartment.contact_phone && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          window.open(`tel:${apartment.contact_phone}`)
                        }
                        className="flex items-center border-blue-200 hover:bg-blue-50"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call: {apartment.contact_phone}
                      </Button>
                    )}
                    {apartment.contact_telegram && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          window.open(
                            `https://t.me/${apartment.contact_telegram.replace("@", "")}`,
                          )
                        }
                        className="flex items-center border-blue-200 hover:bg-blue-50"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Telegram: {apartment.contact_telegram}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Navigation Actions */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => router.push("/booking")}
                  variant="outline"
                  className="flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to All Bookings
                </Button>

                <Button
                  onClick={() =>
                    router.push(`/apartments/${booking.apartmentId}`)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                >
                  <Home className="h-4 w-4 mr-2" />
                  View Apartment Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
