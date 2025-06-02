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

// API функция для создания бронирования
const createBooking = async (bookingData: {
  apartmentId: string;
  userId: string;
  message: string;
  check_in_date: string;
  check_out_date: string;
}) => {
  const response = await fetch("/api/v1/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...bookingData,
      status: "pending",
      payment_status: "pending",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create booking");
  }

  return response.json();
};

// Utility Functions
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

// Components
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

// Компонент для просмотра деталей апартамента
const ApartmentDetailsModal = ({
  apartment,
  isOpen,
  onClose,
}: {
  apartment: Apartment | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    message: "",
    check_in_date: "",
    check_out_date: "",
  });
  const [isBooking, setIsBooking] = useState(false);

  const { data: apartmentDetails, isLoading } = useApartment(
    apartment?.apartmentId || "",
    { enabled: !!apartment },
  );

  const currentApartment = apartmentDetails || apartment;

  const { profile } = useProfileStore();

  const handleBooking = async () => {
    if (
      !bookingData.message.trim() ||
      !bookingData.check_in_date ||
      !bookingData.check_out_date
    ) {
      toast.error("Please fill in all booking details");
      return;
    }

    if (!currentApartment) return;

    setIsBooking(true);
    try {
      await createBooking({
        apartmentId: currentApartment.apartmentId
          ? currentApartment.apartmentId
          : "",
        userId: profile?.userId ? profile.userId : "", // Replace with actual user ID from auth
        message: bookingData.message,
        check_in_date: bookingData.check_in_date,
        check_out_date: bookingData.check_out_date,
      });

      toast.success("🎉 Booking request sent successfully!");
      setIsBookingOpen(false);
      setBookingData({ message: "", check_in_date: "", check_out_date: "" });
    } catch (error) {
      toast.error("❌ Failed to send booking request");
    } finally {
      setIsBooking(false);
    }
  };

  if (!currentApartment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {currentApartment.apartment_name}
          </DialogTitle>
          <DialogDescription className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1 text-blue-500" />
            {currentApartment.district_name}, {currentApartment.address.street}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Image Gallery */}
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

                    {/* Status badges */}
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

                    {/* Navigation arrows */}
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

                    {/* Image counter */}
                    {currentApartment.pictures.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} /{" "}
                        {currentApartment.pictures.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail gallery */}
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

            {/* Quick Stats */}
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
                {currentApartment.university_nearby && (
                  <p>
                    <strong>Near University:</strong>{" "}
                    {currentApartment.university_nearby}
                  </p>
                )}
              </div>
            </div>

            {/* Utilities & Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Utilities */}
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

              {/* Rules */}
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

            {/* Contact Info */}
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
                    Send a booking request to the owner
                  </p>
                </div>
                <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8">
                      <Send className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Send Booking Request</DialogTitle>
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
                          className="min-h-24"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsBookingOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleBooking} disabled={isBooking}>
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
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Компонент карточки апартамента
const ApartmentCard = ({ apartment }: { apartment: Apartment }) => {
  const [mainImage, setMainImage] = useState<string>("");
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null,
  );

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

          {/* Status Badges */}
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

          {/* Price Badge */}
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
      />
    </>
  );
};

// Компонент фильтров
const SearchFilters = ({
  searchParams,
  setSearchParams,
  nearbyParams,
  setNearbyParams,
  availabilityParams,
  setAvailabilityParams,
  onSearch,
  isLoading,
}: {
  searchParams: ApartmentSearchParams;
  setSearchParams: (params: ApartmentSearchParams) => void;
  nearbyParams: NearbySearchParams;
  setNearbyParams: (params: NearbySearchParams) => void;
  availabilityParams: AvailabilitySearchParams;
  setAvailabilityParams: (params: AvailabilitySearchParams) => void;
  onSearch: () => void;
  isLoading: boolean;
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleClearFilters = () => {
    setSearchParams({});
    setNearbyParams({} as NearbySearchParams);
    setAvailabilityParams({} as AvailabilitySearchParams);
  };

  const hasActiveFilters =
    Object.keys(searchParams).length > 0 ||
    Object.keys(nearbyParams).length > 0 ||
    Object.keys(availabilityParams).length > 0;

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
          {/* Basic Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter location..."
                value={searchParams.location || ""}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, location: e.target.value })
                }
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

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
                <SelectContent>
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

          {/* Price Range */}
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

          {/* Location-based Search */}
          <div className="border-t pt-4">
            <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
              <Navigation className="h-5 w-5 mr-2 text-blue-600" />
              Location-based Search
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="51.1694 (Astana)"
                  value={nearbyParams.latitude || ""}
                  onChange={(e) =>
                    setNearbyParams({
                      ...nearbyParams,
                      latitude: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="71.4491 (Astana)"
                  value={nearbyParams.longitude || ""}
                  onChange={(e) =>
                    setNearbyParams({
                      ...nearbyParams,
                      longitude: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="radius">Radius (km)</Label>
                <Input
                  id="radius"
                  type="number"
                  placeholder="5"
                  value={nearbyParams.radius_km || ""}
                  onChange={(e) =>
                    setNearbyParams({
                      ...nearbyParams,
                      radius_km: parseFloat(e.target.value) || undefined,
                    })
                  }
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Availability Search */}
          <div className="border-t pt-4">
            <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Availability
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="check_in">Check-in Date</Label>
                <Input
                  id="check_in"
                  type="datetime-local"
                  value={availabilityParams.check_in || ""}
                  onChange={(e) =>
                    setAvailabilityParams({
                      ...availabilityParams,
                      check_in: e.target.value,
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
                  value={availabilityParams.check_out || ""}
                  onChange={(e) =>
                    setAvailabilityParams({
                      ...availabilityParams,
                      check_out: e.target.value,
                    })
                  }
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
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

// Основная страница поиска апартаментов
export default function ApartmentsSearchPage() {
  const [searchParams, setSearchParams] = useState<ApartmentSearchParams>({});
  const [nearbyParams, setNearbyParams] = useState<NearbySearchParams>(
    {} as NearbySearchParams,
  );
  const [availabilityParams, setAvailabilityParams] =
    useState<AvailabilitySearchParams>({} as AvailabilitySearchParams);
  const [activeSearchType, setActiveSearchType] = useState<
    "general" | "nearby" | "availability" | "promoted"
  >("general");
  const [hasSearched, setHasSearched] = useState(true); // Показываем все апартаменты сразу
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Query hooks - показываем все апартаменты по умолчанию
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    isError: isSearchError,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchApartments(
    {
      ...searchParams,
      skip: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    },
    { enabled: activeSearchType === "general" }, // Всегда включен для показа всех апартаментов
  );

  const {
    data: nearbyResults,
    isLoading: isNearbyLoading,
    isError: isNearbyError,
    error: nearbyError,
    refetch: refetchNearby,
  } = useNearbyApartments(
    {
      ...nearbyParams,
      skip: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    },
    { enabled: activeSearchType === "nearby" && hasSearched },
  );

  const {
    data: availabilityResults,
    isLoading: isAvailabilityLoading,
    isError: isAvailabilityError,
    error: availabilityError,
    refetch: refetchAvailability,
  } = useAvailableApartments(
    {
      ...availabilityParams,
      skip: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    },
    { enabled: activeSearchType === "availability" && hasSearched },
  );

  const {
    data: promotedResults,
    isLoading: isPromotedLoading,
    isError: isPromotedError,
    error: promotedError,
    refetch: refetchPromoted,
  } = usePromotedApartments(
    { skip: (currentPage - 1) * itemsPerPage, limit: itemsPerPage },
    { enabled: activeSearchType === "promoted" && hasSearched },
  );

  const handleSearch = () => {
    setHasSearched(true);
    setCurrentPage(1);

    // Определяем тип поиска на основе заполненных параметров
    if (nearbyParams.latitude && nearbyParams.longitude) {
      setActiveSearchType("nearby");
    } else if (availabilityParams.check_in && availabilityParams.check_out) {
      setActiveSearchType("availability");
    } else if (Object.keys(searchParams).length === 0) {
      setActiveSearchType("promoted");
    } else {
      setActiveSearchType("general");
    }
  };

  // Получаем результаты и состояние загрузки в зависимости от активного типа поиска
  const getCurrentResults = () => {
    switch (activeSearchType) {
      case "nearby":
        return {
          data: nearbyResults,
          isLoading: isNearbyLoading,
          isError: isNearbyError,
          error: nearbyError,
        };
      case "availability":
        return {
          data: availabilityResults,
          isLoading: isAvailabilityLoading,
          isError: isAvailabilityError,
          error: availabilityError,
        };
      case "promoted":
        return {
          data: promotedResults,
          isLoading: isPromotedLoading,
          isError: isPromotedError,
          error: promotedError,
        };
      default:
        return {
          data: searchResults,
          isLoading: isSearchLoading,
          isError: isSearchError,
          error: searchError,
        };
    }
  };

  const { data: apartments, isLoading, isError, error } = getCurrentResults();

  // Компонент пагинации
  const Pagination = () => {
    const totalPages = Math.ceil((apartments?.length || 0) / itemsPerPage);

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
          nearbyParams={nearbyParams}
          setNearbyParams={setNearbyParams}
          availabilityParams={availabilityParams}
          setAvailabilityParams={setAvailabilityParams}
          onSearch={handleSearch}
          isLoading={isLoading}
        />
        {/* Search Results Section - всегда показываем */}
        <div>
          <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {hasSearched &&
                (searchParams.location ||
                  searchParams.university ||
                  searchParams.room_type ||
                  searchParams.min_price ||
                  searchParams.max_price ||
                  nearbyParams.latitude ||
                  availabilityParams.check_in)
                  ? "Search Results"
                  : "All Available Apartments"}
              </h2>
              {!isLoading && apartments && (
                <p className="text-gray-600">
                  {apartments.length}{" "}
                  {apartments.length === 1 ? "apartment" : "apartments"} found
                  {activeSearchType === "nearby" && " nearby"}
                  {activeSearchType === "availability" &&
                    " available for your dates"}
                  {activeSearchType === "promoted" && " featured"}
                </p>
              )}
            </div>

            <Badge
              variant="outline"
              className="w-fit text-blue-600 bg-blue-50 border-blue-200 px-4 py-2"
            >
              {activeSearchType === "nearby" && "📍 Location-based search"}
              {activeSearchType === "availability" && "📅 Availability search"}
              {activeSearchType === "promoted" && "⭐ Featured apartments"}
              {activeSearchType === "general" &&
                (searchParams.location ||
                searchParams.university ||
                searchParams.room_type ||
                searchParams.min_price ||
                searchParams.max_price ||
                nearbyParams.latitude ||
                availabilityParams.check_in
                  ? "🔍 Filtered search"
                  : "🏠 All apartments")}
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

          {!isLoading && !isError && apartments && apartments.length === 0 && (
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
                    Try adjusting your search criteria or browse featured
                    apartments.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchParams({});
                        setNearbyParams({} as NearbySearchParams);
                        setAvailabilityParams({} as AvailabilitySearchParams);
                      }}
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      Clear Filters
                    </Button>
                    <Button
                      onClick={() => {
                        setSearchParams({});
                        setNearbyParams({} as NearbySearchParams);
                        setAvailabilityParams({} as AvailabilitySearchParams);
                        setActiveSearchType("promoted");
                        handleSearch();
                      }}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Show Featured
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && !isError && apartments && apartments.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {apartments.map((apartment) => (
                  <ApartmentCard
                    key={apartment.apartmentId}
                    apartment={apartment}
                  />
                ))}
              </div>
              <Pagination />
            </>
          )}
        </div>
        ){/* Welcome Section - показываем только если нет активных фильтров */}
        {!hasSearched ||
        (!searchParams.location &&
          !searchParams.university &&
          !searchParams.room_type &&
          !searchParams.min_price &&
          !searchParams.max_price &&
          !nearbyParams.latitude &&
          !availabilityParams.check_in) ? (
          <Card className="border-0 shadow-2xl overflow-hidden mb-8">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Explore All Available Properties
                </h3>
                <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                  Browse through our complete collection of apartment listings
                  or use the filters above to find exactly what you're looking
                  for.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => {
                      setActiveSearchType("promoted");
                      handleSearch();
                    }}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Show Featured Only
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchParams({ min_price: 50000, max_price: 500000 });
                      handleSearch();
                    }}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter by Price Range
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
