"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useSearchApartments,
  useNearbyApartments,
  useAvailableApartments,
  usePromotedApartments,
  useApartment,
} from "@/hooks/apartments";
import {
  Apartment,
  ApartmentSearchParams,
  NearbySearchParams,
  AvailabilitySearchParams,
  PaginationParams,
} from "@/types/apartments";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Calendar,
  MapPin,
  Home,
  DollarSign,
  Ruler,
  Users,
  Star,
  Eye,
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Loader2,
  Phone,
  MessageCircle,
  CheckCircle,
  Clock,
  Building2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Send,
  Wifi,
  Shield,
  Navigation,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileStore } from "@/store/profileStore";
import { api } from "@/lib/axios";
import { useCreateBooking, useUserBookings } from "@/hooks/booking";

const createBooking = async (bookingData: {
  apartmentId: string;
  message: string;
  check_in_date: string;
  check_out_date: string;
}) => {
  // Конвертируем даты в правильный ISO формат для API
  const formatDateForAPI = (dateTimeLocal: string) => {
    if (!dateTimeLocal) return "";
    // datetime-local дает формат: "2025-06-07T16:13"
    // API ожидает: "2025-06-07T16:13:21.341Z"
    const date = new Date(dateTimeLocal);
    return date.toISOString();
  };

  const payload = {
    apartmentId: bookingData.apartmentId,
    message: bookingData.message,
    check_in_date: formatDateForAPI(bookingData.check_in_date),
    check_out_date: formatDateForAPI(bookingData.check_out_date),
  };

  console.log("Sending booking request:", payload);

  try {
    const response = await api.post("/api/v1/bookings", payload);

    console.log("Booking success response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Booking error:", error);

    // Обработка ошибок axios
    if (error.response) {
      // Сервер ответил с кодом ошибки
      const errorMessage =
        error.response.data?.message || error.response.data || "Unknown error";
      throw new Error(
        `Failed to create booking: ${error.response.status} - ${errorMessage}`,
      );
    } else if (error.request) {
      // Запрос был отправлен, но ответа не получено
      throw new Error("Failed to create booking: No response from server");
    } else {
      // Ошибка при настройке запроса
      throw new Error(`Failed to create booking: ${error.message}`);
    }
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

const ApartmentDetailsModal = ({
  apartment,
  isOpen,
  onClose,
  bookingRequests,
  onBookingSuccess,
}: {
  apartment: Apartment | null;
  isOpen: boolean;
  onClose: () => void;
  bookingRequests: Set<string>;
  onBookingSuccess: (apartmentId: string) => void;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    message: "",
    check_in_date: "",
    check_out_date: "",
  });

  const { profile } = useProfileStore();
  const { data: apartmentDetails, isLoading } = useApartment(
    apartment?.apartmentId || "",
    { enabled: !!apartment },
  );

  const { data: userBookings } = useUserBookings(profile?.userId || "", {
    enabled: !!profile?.userId,
  });

  const { mutateAsync: createBookingMutation, isPending: isBooking } =
    useCreateBooking();

  const currentApartment = apartmentDetails || apartment;

  useEffect(() => {
    console.log("currentApartment", currentApartment);
  }, [currentApartment]);

  // Check if user already has a booking for this apartment
  const hasExistingBooking =
    userBookings?.some(
      (booking) => booking.apartmentId === currentApartment?.apartmentId,
    ) || bookingRequests.has(currentApartment?.apartmentId || "");

  const formatDateForAPI = (dateTimeLocal: string) => {
    if (!dateTimeLocal) return "";
    const date = new Date(dateTimeLocal);
    return date.toISOString();
  };

  const handleBooking = async () => {
    if (!profile?.userId) {
      toast.error("Please log in to book apartments");
      return;
    }

    if (
      !bookingData.message.trim() ||
      !bookingData.check_in_date ||
      !bookingData.check_out_date
    ) {
      toast.error("Please fill in all booking details");
      return;
    }

    if (!currentApartment?.apartmentId) return;

    try {
      const bookingPayload = {
        apartmentId: currentApartment.apartmentId,
        message: bookingData.message,
        check_in_date: formatDateForAPI(bookingData.check_in_date),
        check_out_date: formatDateForAPI(bookingData.check_out_date),
      };

      await createBookingMutation(bookingPayload);

      onBookingSuccess(currentApartment.apartmentId);
      toast.success("🎉 Booking request sent successfully!");
      setIsBookingModalOpen(false);
      setBookingData({ message: "", check_in_date: "", check_out_date: "" });
    } catch (error: any) {
      console.error("Booking error:", error);

      // Handle specific error messages
      if (error?.response?.data?.detail) {
        if (
          error.response.data.detail ===
          "Apartment is not available for the selected dates"
        ) {
          toast.error("❌ Apartment is not available for the selected dates");
        } else {
          toast.error(`❌ ${error.response.data.detail}`);
        }
      } else if (error?.message) {
        toast.error(`❌ ${error.message}`);
      } else {
        toast.error("❌ Failed to send booking request");
      }
    }
  };

  if (!currentApartment) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="min-w-[50%] w-full max-h-[95vh] overflow-y-auto bg-white">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {currentApartment.apartment_name}
            </DialogTitle>
            <DialogDescription className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-1 text-blue-500" />
              {currentApartment.district_name},{" "}
              {currentApartment.address.street}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Images Section */}
              {currentApartment.pictures &&
                currentApartment.pictures.length > 0 && (
                  <div className="space-y-4">
                    <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={getImageUrl(
                          currentApartment.pictures[currentImageIndex],
                        )}
                        alt={`Property image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute top-4 left-4 flex gap-2">
                        {currentApartment.is_promoted && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <Badge
                          className={`shadow-lg border-0 ${
                            currentApartment.is_active
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                              : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                          }`}
                        >
                          {currentApartment.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {currentApartment.pictures.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                            onClick={() =>
                              setCurrentImageIndex((prev) =>
                                prev === 0
                                  ? currentApartment.pictures.length - 1
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
                                prev === currentApartment.pictures.length - 1
                                  ? 0
                                  : prev + 1,
                              )
                            }
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </>
                      )}

                      {currentApartment.pictures.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} /{" "}
                          {currentApartment.pictures.length}
                        </div>
                      )}
                    </div>

                    {currentApartment.pictures.length > 1 && (
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {currentApartment.pictures.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                              currentImageIndex === index
                                ? "border-blue-500 shadow-lg scale-105"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <img
                              src={getImageUrl(image)}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              {/* Main Info Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-700">
                    {formatPrice(currentApartment.price_per_month)}
                  </p>
                  <p className="text-sm text-green-600">per month</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <Ruler className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-700">
                    {currentApartment.area} m²
                  </p>
                  <p className="text-sm text-blue-600">total area</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <Home className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-700">
                    {currentApartment.number_of_rooms}
                  </p>
                  <p className="text-sm text-purple-600">rooms</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <Users className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-700">
                    {currentApartment.max_users}
                  </p>
                  <p className="text-sm text-amber-600">max occupancy</p>
                </div>
              </div>

              {/* Additional Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-gray-600" />
                    Property Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Floor:</strong> {currentApartment.floor}
                    </p>
                    <p>
                      <strong>Kitchen Area:</strong>{" "}
                      {currentApartment.kitchen_area} m²
                    </p>
                    <p>
                      <strong>Rental Type:</strong>{" "}
                      {currentApartment.rental_type?.replace("_", " ")}
                    </p>
                    <p>
                      <strong>Pet Allowed:</strong>{" "}
                      {currentApartment.is_pet_allowed ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-600" />
                    Availability
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Available From:</strong>{" "}
                      {currentApartment.available_from}
                    </p>
                    <p>
                      <strong>Available Until:</strong>{" "}
                      {currentApartment.available_until}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {formatDate(currentApartment.created_at || "")}
                    </p>
                    <p>
                      <strong>Last Updated:</strong>{" "}
                      {formatDate(currentApartment.updated_at || "")}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-gray-600" />
                    Roommate Info
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Preferences:</strong>{" "}
                      {currentApartment.roommate_preferences ||
                        "None specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {currentApartment.description || "No description provided"}
                </p>
              </div>

              {/* Location Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Navigation className="h-5 w-5 mr-2 text-blue-600" />
                  Location & Address
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p>
                    <strong>District:</strong> {currentApartment.district_name}
                  </p>
                  <p>
                    <strong>Street:</strong> {currentApartment.address.street},{" "}
                    {currentApartment.address.house_number}
                  </p>
                  {currentApartment.address.apartment_number && (
                    <p>
                      <strong>Apartment:</strong>{" "}
                      {currentApartment.address.apartment_number}
                    </p>
                  )}
                  {currentApartment.address.entrance && (
                    <p>
                      <strong>Entrance:</strong>{" "}
                      {currentApartment.address.entrance}
                    </p>
                  )}
                  <p>
                    <strong>Intercom:</strong>{" "}
                    {currentApartment.address.has_intercom
                      ? "Available"
                      : "Not available"}
                  </p>
                  {currentApartment.address.landmark && (
                    <p>
                      <strong>Landmark:</strong>{" "}
                      {currentApartment.address.landmark}
                    </p>
                  )}
                  {currentApartment.university_nearby && (
                    <p>
                      <strong>Near University:</strong>{" "}
                      {currentApartment.university_nearby}
                    </p>
                  )}
                  <p>
                    <strong>Coordinates:</strong> {currentApartment.latitude},{" "}
                    {currentApartment.longitude}
                  </p>
                </div>
              </div>

              {/* Utilities and Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Wifi className="h-5 w-5 mr-2 text-blue-600" />
                    Included Utilities
                  </h3>
                  {currentApartment.included_utilities?.length > 0 ? (
                    <div className="space-y-2">
                      {currentApartment.included_utilities.map(
                        (utility, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-blue-50 p-3 rounded-lg"
                          >
                            <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-gray-800">{utility}</span>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No utilities specified</p>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-red-600" />
                    House Rules
                  </h3>
                  {currentApartment.rules?.length > 0 ? (
                    <div className="space-y-2">
                      {currentApartment.rules.map((rule, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-red-50 p-3 rounded-lg"
                        >
                          <Shield className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-gray-800">{rule}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No rules specified</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentApartment.contact_phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-gray-700">
                        {currentApartment.contact_phone}
                      </span>
                    </div>
                  )}
                  {currentApartment.contact_telegram && (
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-gray-700">
                        {currentApartment.contact_telegram}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Section */}
              <div className="space-y-4">
                <Separator />
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Ready to Book?
                    </h3>
                    <p className="text-gray-600">
                      {hasExistingBooking
                        ? "Booking request sent! The owner will contact you soon."
                        : "Send a booking request to the owner"}
                    </p>
                  </div>

                  {hasExistingBooking ? (
                    <div className="flex items-center bg-green-50 text-green-700 px-6 py-3 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">Request Sent</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsBookingModalOpen(true)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Separate Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Book {currentApartment?.apartment_name}</DialogTitle>
            <DialogDescription>
              Fill in your booking details and message to the owner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="check_in">Check-in Date</Label>
              <Input
                id="check_in"
                type="datetime-local"
                value={bookingData.check_in_date}
                onChange={(e) =>
                  setBookingData({
                    ...bookingData,
                    check_in_date: e.target.value,
                  })
                }
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check_out">Check-out Date</Label>
              <Input
                id="check_out"
                type="datetime-local"
                value={bookingData.check_out_date}
                onChange={(e) =>
                  setBookingData({
                    ...bookingData,
                    check_out_date: e.target.value,
                  })
                }
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message to Owner</Label>
              <Textarea
                id="message"
                placeholder="Tell the owner about yourself and why you're interested..."
                value={bookingData.message}
                onChange={(e) =>
                  setBookingData({
                    ...bookingData,
                    message: e.target.value,
                  })
                }
                className="min-h-24 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBookingModalOpen(false)}
              disabled={isBooking}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBooking}
              disabled={isBooking}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isBooking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const ApartmentCard = ({
  apartment,
  bookingRequests,
  onBookingSuccess,
}: {
  apartment: Apartment;
  bookingRequests: Set<string>;
  onBookingSuccess: (apartmentId: string) => void;
}) => {
  const [mainImage, setMainImage] = useState<string>("");
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null,
  );
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    message: "",
    check_in_date: "",
    check_out_date: "",
  });

  const { profile } = useProfileStore();

  // Get user bookings to check if already requested
  const { data: userBookings } = useUserBookings(profile?.userId || "", {
    enabled: !!profile?.userId,
  });

  const { mutateAsync: createBookingMutation, isPending: isBooking } =
    useCreateBooking();

  // Check if user already has a booking for this apartment
  const hasExistingBooking =
    userBookings?.some(
      (booking) => booking.apartmentId === apartment.apartmentId,
    ) || bookingRequests.has(apartment.apartmentId || "");

  const formatDateForAPI = (dateTimeLocal: string) => {
    if (!dateTimeLocal) return "";
    const date = new Date(dateTimeLocal);
    return date.toISOString();
  };

  const handleQuickBooking = async () => {
    if (!profile?.userId) {
      toast.error("Please log in to book apartments");
      return;
    }

    if (
      !bookingData.message.trim() ||
      !bookingData.check_in_date ||
      !bookingData.check_out_date
    ) {
      toast.error("Please fill in all booking details");
      return;
    }

    try {
      const bookingPayload = {
        apartmentId: apartment.apartmentId || "",
        message: bookingData.message,
        check_in_date: formatDateForAPI(bookingData.check_in_date),
        check_out_date: formatDateForAPI(bookingData.check_out_date),
      };

      await createBookingMutation(bookingPayload);

      onBookingSuccess(apartment.apartmentId || "");
      toast.success("🎉 Booking request sent successfully!");
      setIsBookingModalOpen(false);
      setBookingData({ message: "", check_in_date: "", check_out_date: "" });
    } catch (error: any) {
      console.error("Booking error:", error);

      // Handle specific error messages
      if (error?.response?.data?.detail) {
        if (
          error.response.data.detail ===
          "Apartment is not available for the selected dates"
        ) {
          toast.error("❌ Apartment is not available for the selected dates");
        } else {
          toast.error(`❌ ${error.response.data.detail}`);
        }
      } else if (error?.message) {
        toast.error(`❌ ${error.message}`);
      } else {
        toast.error("❌ Failed to send booking request");
      }
    }
  };

  useEffect(() => {
    if (apartment.pictures && apartment.pictures.length > 0) {
      setMainImage(getImageUrl(apartment.pictures[0]));
    }
  }, [apartment]);

  const createdAt = apartment.created_at
    ? formatDate(apartment.created_at)
    : "Recently";

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl group border-0 shadow-lg bg-white">
        <div className="relative">
          <div className="h-56 w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            {mainImage ? (
              <img
                src={mainImage}
                alt={apartment.apartment_name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <Home className="h-16 w-16 text-blue-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="absolute top-3 left-3">
            {apartment.is_promoted && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <Badge
              className={`${
                apartment.is_active
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-500 hover:bg-gray-600 text-white"
              } shadow-lg border-0`}
            >
              {apartment.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="absolute bottom-3 right-3">
            <Badge className="bg-white/90 backdrop-blur-sm text-blue-600 border-0 shadow-lg font-bold text-sm px-3 py-1">
              {formatPrice(apartment.price_per_month)}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-3">
          <CardTitle
            className="text-xl font-bold text-gray-900 truncate"
            title={apartment.apartment_name}
          >
            {apartment.apartment_name}
          </CardTitle>
          <CardDescription className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1 text-blue-500" />
            {apartment.district_name}, {apartment.address.street}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
              <Home className="h-4 w-4 mr-2 text-blue-500" />
              <span className="font-medium">
                {apartment.number_of_rooms} Room
                {apartment.number_of_rooms !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
              <Ruler className="h-4 w-4 mr-2 text-green-500" />
              <span className="font-medium">{apartment.area} m²</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
              <Users className="h-4 w-4 mr-2 text-purple-500" />
              <span className="font-medium">Max {apartment.max_users}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
              <Calendar className="h-4 w-4 mr-2 text-orange-500" />
              <span className="font-medium">
                {formatDate(apartment.available_from)}
              </span>
            </div>
          </div>

          {apartment.university_nearby &&
            apartment.university_nearby !== "none" && (
              <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-3">
                📚 Near {apartment.university_nearby}
              </div>
            )}

          {hasExistingBooking && (
            <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg mb-3 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Booking request sent
            </div>
          )}

          <div className="flex items-center text-xs text-gray-500 mb-4">
            <Clock className="h-3 w-3 mr-1" />
            Posted on {createdAt}
          </div>

          <Separator className="mb-4" />

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedApartment(apartment)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>

            <div className="flex space-x-2">
              {hasExistingBooking ? (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Requested
                </Badge>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  title="Quick booking"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-500"
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-blue-500"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ApartmentDetailsModal
        apartment={selectedApartment}
        isOpen={!!selectedApartment}
        onClose={() => setSelectedApartment(null)}
        bookingRequests={bookingRequests}
        onBookingSuccess={onBookingSuccess}
      />

      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Book {apartment.apartment_name}</DialogTitle>
            <DialogDescription>
              Fill in your booking details and message to the owner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quick_check_in">Check-in Date</Label>
              <Input
                id="quick_check_in"
                type="datetime-local"
                value={bookingData.check_in_date}
                onChange={(e) =>
                  setBookingData({
                    ...bookingData,
                    check_in_date: e.target.value,
                  })
                }
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick_check_out">Check-out Date</Label>
              <Input
                id="quick_check_out"
                type="datetime-local"
                value={bookingData.check_out_date}
                onChange={(e) =>
                  setBookingData({
                    ...bookingData,
                    check_out_date: e.target.value,
                  })
                }
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick_message">Message to Owner</Label>
              <Textarea
                id="quick_message"
                placeholder="Tell the owner about yourself and why you're interested..."
                value={bookingData.message}
                onChange={(e) =>
                  setBookingData({
                    ...bookingData,
                    message: e.target.value,
                  })
                }
                className="min-h-24 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBookingModalOpen(false)}
              disabled={isBooking}
            >
              Cancel
            </Button>
            <Button
              onClick={handleQuickBooking}
              disabled={isBooking}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isBooking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const SearchFilters = ({
  searchParams,
  setSearchParams,
  onSearch,
  isLoading,
}: {
  searchParams: ApartmentSearchParams;
  setSearchParams: (params: ApartmentSearchParams) => void;
  onSearch: () => void;
  isLoading: boolean;
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = Object.keys(searchParams).length > 0;

  return (
    <Card className="border-0 shadow-xl mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Search Filters
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      {showFilters && (
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Select
                value={searchParams.university || ""}
                onValueChange={(value) =>
                  setSearchParams({ ...searchParams, university: value })
                }
              >
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg rounded-md max-h-60">
                  <SelectItem value="none" className="hover:bg-blue-50">
                    Not applicable
                  </SelectItem>
                  <SelectItem
                    value="Astana IT University"
                    className="hover:bg-blue-50"
                  >
                    Astana IT University (AITU)
                  </SelectItem>
                  <SelectItem
                    value="Nazarbayev University"
                    className="hover:bg-blue-50"
                  >
                    Nazarbayev University
                  </SelectItem>
                  <SelectItem
                    value="Eurasian National University"
                    className="hover:bg-blue-50"
                  >
                    Eurasian National University
                  </SelectItem>
                  <SelectItem
                    value="Kazakh Agro Technical University"
                    className="hover:bg-blue-50"
                  >
                    Kazakh Agro Technical University
                  </SelectItem>
                  <SelectItem
                    value="Astana Medical University"
                    className="hover:bg-blue-50"
                  >
                    Astana Medical University
                  </SelectItem>
                  <SelectItem
                    value="Kazakh University of Economics"
                    className="hover:bg-blue-50"
                  >
                    Kazakh University of Economics
                  </SelectItem>
                  <SelectItem
                    value="Kazakh Humanitarian Law University"
                    className="hover:bg-blue-50"
                  >
                    Kazakh Humanitarian Law University
                  </SelectItem>
                  <SelectItem
                    value="Kazakh University of Technology and Business"
                    className="hover:bg-blue-50"
                  >
                    Kazakh University of Technology and Business
                  </SelectItem>
                  <SelectItem
                    value="International University of Astana"
                    className="hover:bg-blue-50"
                  >
                    International University of Astana
                  </SelectItem>
                  <SelectItem value="Other" className="hover:bg-blue-50">
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room_type">Room Type</Label>
              <Select
                value={searchParams.room_type || ""}
                onValueChange={(value) =>
                  setSearchParams({ ...searchParams, room_type: value })
                }
              >
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entire_apartment">
                    Entire Apartment
                  </SelectItem>
                  <SelectItem value="private_room">Private Room</SelectItem>
                  <SelectItem value="shared_room">Shared Room</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_price">Min Price (KZT)</Label>
              <Input
                id="min_price"
                type="number"
                placeholder="0"
                value={searchParams.min_price || ""}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    min_price: parseInt(e.target.value) || undefined,
                  })
                }
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_price">Max Price (KZT)</Label>
              <Input
                id="max_price"
                type="number"
                placeholder="1000000"
                value={searchParams.max_price || ""}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    max_price: parseInt(e.target.value) || undefined,
                  })
                }
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      )}

      <CardFooter className="flex justify-center">
        <Button
          onClick={onSearch}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Search Apartments
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function ApartmentsSearchPage() {
  const [searchParams, setSearchParams] = useState<ApartmentSearchParams>({});
  const [hasSearched, setHasSearched] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingRequests, setBookingRequests] = useState<Set<string>>(
    new Set(),
  );
  const itemsPerPage = 12;

  const { profile } = useProfileStore();

  const handleBookingSuccess = (apartmentId: string) => {
    setBookingRequests((prev) => new Set([...prev, apartmentId]));
  };

  const {
    data: searchResults,
    isLoading,
    isError,
    error,
  } = useSearchApartments(
    {
      skip: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    },
    { enabled: true },
  );

  const handleSearch = () => {
    setHasSearched(true);
    setCurrentPage(1);
  };

  const getFilteredApartments = () => {
    if (!searchResults) return [];

    let filtered = searchResults.filter(
      (apartment) => apartment.ownerId !== profile?.userId,
    );

    if (searchParams.university && searchParams.university !== "none") {
      filtered = filtered.filter(
        (apartment) => apartment.university_nearby === searchParams.university,
      );
    }

    if (searchParams.room_type) {
      filtered = filtered.filter(
        (apartment) => apartment.rental_type === searchParams.room_type,
      );
    }

    if (searchParams.min_price) {
      filtered = filtered.filter(
        (apartment) => apartment.price_per_month >= searchParams.min_price!,
      );
    }

    if (searchParams.max_price) {
      filtered = filtered.filter(
        (apartment) => apartment.price_per_month <= searchParams.max_price!,
      );
    }

    return filtered;
  };

  const filteredApartments = getFilteredApartments();

  const Pagination = () => {
    const totalPages = Math.ceil(
      (filteredApartments?.length || 0) / itemsPerPage,
    );

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage <= 1}
          className="border-gray-200 hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex space-x-1">
          {[...Array(Math.min(totalPages, 5))].map((_, index) => {
            const pageNumber = index + 1;
            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNumber)}
                className={`${
                  currentPage === pageNumber
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage >= totalPages}
          className="border-gray-200 hover:bg-gray-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Find Your Perfect Home
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover thousands of amazing apartment listings in Kazakhstan with
            advanced search filters
          </p>
        </header>

        <SearchFilters
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        <div>
          <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {Object.keys(searchParams).length > 0
                  ? "Search Results"
                  : "All Available Apartments"}
              </h2>
              {!isLoading && (
                <p className="text-gray-600">
                  {filteredApartments.length}{" "}
                  {filteredApartments.length === 1 ? "apartment" : "apartments"}{" "}
                  found
                </p>
              )}
            </div>

            <Badge
              variant="outline"
              className="w-fit text-blue-600 bg-blue-50 border-blue-200 px-4 py-2"
            >
              {Object.keys(searchParams).length > 0
                ? "🔍 Filtered search"
                : "🏠 All apartments"}
            </Badge>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <ApartmentCardSkeleton key={index} />
              ))}
            </div>
          )}

          {isError && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Error Loading Results
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {error?.message ||
                      "Failed to load search results. Please try again."}
                  </p>
                  <Button
                    onClick={handleSearch}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && !isError && filteredApartments.length === 0 && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <Search className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No Apartments Found
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                    Try adjusting your search criteria.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchParams({})}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && !isError && filteredApartments.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredApartments.map((apartment) => (
                  <ApartmentCard
                    key={apartment.apartmentId}
                    apartment={apartment}
                    bookingRequests={bookingRequests}
                    onBookingSuccess={handleBookingSuccess}
                  />
                ))}
              </div>
              <Pagination />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
