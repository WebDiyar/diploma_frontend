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
  Star,
  Wifi,
  Car,
  Utensils,
  Tv,
  Wind,
  ShowerHead,
  BookOpen,
  Heart,
  Share2,
  ExternalLink,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// API imports
import { getApartmentById } from "@/lib/api_from_swagger/apartments";

interface Apartment {
  apartmentId: string;
  ownerId: string;
  apartment_name: string;
  description: string;
  address: {
    street: string;
    house_number: string;
    apartment_number: string;
    entrance: string;
    has_intercom: boolean;
    landmark: string;
  };
  district_name: string;
  latitude: number;
  longitude: number;
  price_per_month: number;
  area: number;
  kitchen_area: number;
  floor: number;
  number_of_rooms: number;
  max_users: number;
  available_from: string;
  available_until: string;
  university_nearby: string;
  pictures: string[];
  is_promoted: boolean;
  is_pet_allowed: boolean;
  rental_type: string;
  roommate_preferences: string;
  included_utilities: string[];
  rules: string[];
  contact_phone: string;
  contact_telegram: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
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
    month: "long",
    day: "numeric",
  });
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
          Loading Apartment Details
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

// Image Gallery Component
const ImageGallery = ({
  pictures,
  apartmentName,
}: {
  pictures: string[];
  apartmentName: string;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % pictures.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + pictures.length) % pictures.length,
    );
  };

  if (!pictures || pictures.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
        <Home className="h-20 w-20 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg">
        <img
          src={getImageUrl(pictures[currentImageIndex])}
          alt={`${apartmentName} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {pictures.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {pictures.length}
          </div>
        </>
      )}

      {pictures.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {pictures.map((pic, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentImageIndex
                  ? "border-blue-500"
                  : "border-gray-200"
              }`}
            >
              <img
                src={getImageUrl(pic)}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ApartmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const apartmentId = params.id as string;

  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApartmentDetails = async () => {
      if (!apartmentId) return;

      setLoading(true);
      try {
        const apartmentData = await getApartmentById(apartmentId);
        setApartment(apartmentData);
      } catch (err) {
        console.error("Error fetching apartment details:", err);
        setError("Failed to load apartment details");
      } finally {
        setLoading(false);
      }
    };

    fetchApartmentDetails();
  }, [apartmentId]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !apartment) {
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
                  {error || "Apartment not found"}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  The apartment you're looking for doesn't exist or has been
                  removed.
                </p>
                <Button
                  onClick={() => router.push("/apartments")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Apartments
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {apartment.apartment_name}
                </h1>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {apartment.district_name}, {apartment.address?.street}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <ImageGallery
                  pictures={apartment.pictures}
                  apartmentName={apartment.apartment_name}
                />
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Home className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Rooms</p>
                    <p className="text-xl font-bold text-gray-900">
                      {apartment.number_of_rooms}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Area</p>
                    <p className="text-xl font-bold text-gray-900">
                      {apartment.area} m²
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Building2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Floor</p>
                    <p className="text-xl font-bold text-gray-900">
                      {apartment.floor}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Max Users</p>
                    <p className="text-xl font-bold text-gray-900">
                      {apartment.max_users}
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {apartment.description || "No description provided."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features & Amenities */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Features & Amenities
                </h3>

                {/* Included Utilities */}
                {apartment.included_utilities &&
                  apartment.included_utilities.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800 mb-3">
                        Included Utilities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {apartment.included_utilities.map((utility, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            {utility}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Other Features */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${apartment.is_pet_allowed ? "bg-green-100" : "bg-red-100"}`}
                    >
                      {apartment.is_pet_allowed ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700">
                      Pets{" "}
                      {apartment.is_pet_allowed ? "Allowed" : "Not Allowed"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${apartment.address?.has_intercom ? "bg-green-100" : "bg-red-100"}`}
                    >
                      {apartment.address?.has_intercom ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700">
                      Intercom{" "}
                      {apartment.address?.has_intercom
                        ? "Available"
                        : "Not Available"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Utensils className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-700">
                      Kitchen {apartment.kitchen_area}m²
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rules */}
            {apartment.rules && apartment.rules.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    House Rules
                  </h3>
                  <div className="space-y-2">
                    {apartment.rules.map((rule, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{rule}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price & Booking */}
            <Card className="border-0 shadow-lg sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatPrice(apartment.price_per_month)}
                  </div>
                  <p className="text-sm text-gray-600">per month</p>
                  <p className="text-xs text-gray-500">
                    Rental type: {apartment.rental_type}
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Available from
                    </p>
                    <p className="text-gray-900">
                      {formatDate(apartment.available_from)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Available until
                    </p>
                    <p className="text-gray-900">
                      {formatDate(apartment.available_until)}
                    </p>
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-4">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Book Now
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  You won't be charged yet
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Owner
                </h3>
                <div className="space-y-3">
                  {apartment.contact_phone && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        window.open(`tel:${apartment.contact_phone}`)
                      }
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {apartment.contact_phone}
                    </Button>
                  )}
                  {apartment.contact_telegram && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        window.open(
                          `https://t.me/${apartment.contact_telegram.replace("@", "")}`,
                        )
                      }
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {apartment.contact_telegram}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Location
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Address</p>
                    <p className="text-gray-900">
                      {apartment.address?.street},{" "}
                      {apartment.address?.house_number}
                      {apartment.address?.apartment_number &&
                        `, apt. ${apartment.address.apartment_number}`}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      District
                    </p>
                    <p className="text-gray-900">{apartment.district_name}</p>
                  </div>

                  {apartment.university_nearby &&
                    apartment.university_nearby !== "none" && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Nearby University
                        </p>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <p className="text-gray-900">
                            {apartment.university_nearby}
                          </p>
                        </div>
                      </div>
                    )}

                  {apartment.address?.landmark && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Landmark
                      </p>
                      <p className="text-gray-900">
                        {apartment.address.landmark}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Roommate Preferences */}
            {apartment.roommate_preferences && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Roommate Preferences
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {apartment.roommate_preferences}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
