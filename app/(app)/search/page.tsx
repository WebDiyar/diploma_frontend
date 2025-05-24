"use client";
import { useEffect, useState } from "react";
import {
  useSearchApartments,
  useNearbyApartments,
  useAvailableApartments,
  usePromotedApartments,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Loader2,
  Star,
  Eye,
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Navigation,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

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
  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (url.includes("example.com")) {
      return `https://source.unsplash.com/random/800x600/?apartment&sig=${Math.random()}`;
    }
    return url;
  }

  if (url.startsWith("data:image")) {
    return url;
  }

  return "https://source.unsplash.com/random/800x600/?apartment";
};

// Компонент плейсхолдера при загрузке
const ApartmentCardSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <CardHeader className="pb-2">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="pb-2">
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-20" />
    </CardFooter>
  </Card>
);

// Компонент карточки апартаментов
const ApartmentCard = ({ apartment }: { apartment: Apartment }) => {
  const router = useRouter();
  const [mainImage, setMainImage] = useState<string>("");

  useEffect(() => {
    if (apartment.pictures && apartment.pictures.length > 0) {
      setMainImage(getImageUrl(apartment.pictures[0]));
    }
  }, [apartment]);

  const createdAt = apartment.created_at
    ? formatDate(apartment.created_at)
    : "Recently";

  const handleViewDetails = () => {
    router.push(`/apartment/${apartment.apartmentId}`);
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg group">
      <div className="relative">
        <div className="h-48 w-full bg-gray-200 overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage}
              alt={apartment.apartment_name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Home className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
        {apartment.is_promoted && (
          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            <Star className="h-3 w-3 mr-1" /> Featured
          </Badge>
        )}
        <Badge
          className={`absolute top-2 right-2 ${apartment.is_active ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}`}
        >
          {apartment.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle
            className="text-xl truncate"
            title={apartment.apartment_name}
          >
            {apartment.apartment_name}
          </CardTitle>
          <Badge
            variant="outline"
            className="text-blue-500 border-blue-200 bg-blue-50"
          >
            {formatPrice(apartment.price_per_month)}/month
          </Badge>
        </div>
        <CardDescription className="flex items-center text-gray-500">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          {apartment.district_name}, {apartment.address.street}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <Home className="h-3.5 w-3.5 mr-1 text-gray-500" />
            {apartment.number_of_rooms}{" "}
            {apartment.number_of_rooms === 1 ? "Room" : "Rooms"}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Ruler className="h-3.5 w-3.5 mr-1 text-gray-500" />
            {apartment.area} m²
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <SquareUser className="h-3.5 w-3.5 mr-1 text-gray-500" />
            Max {apartment.max_users}{" "}
            {apartment.max_users === 1 ? "Person" : "People"}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
            From {formatDate(apartment.available_from)}
          </div>
        </div>

        {apartment.university_nearby && (
          <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2">
            📚 Near {apartment.university_nearby}
          </div>
        )}

        <div className="text-sm text-gray-500">Posted on {createdAt}</div>
      </CardContent>

      <Separator />

      <CardFooter className="pt-3 pb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewDetails}
          className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Eye className="h-3.5 w-3.5 mr-1" /> View Details
        </Button>
      </CardFooter>
    </Card>
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
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Search Filters</h2>
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

      {showFilters && (
        <div className="space-y-6">
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                placeholder="Near university..."
                value={searchParams.university || ""}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    university: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="room_type">Room Type</Label>
              <Select
                value={searchParams.room_type || ""}
                onValueChange={(value) =>
                  setSearchParams({ ...searchParams, room_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="1-bedroom">1 Bedroom</SelectItem>
                  <SelectItem value="2-bedroom">2 Bedroom</SelectItem>
                  <SelectItem value="3-bedroom">3 Bedroom</SelectItem>
                  <SelectItem value="4-bedroom">4+ Bedroom</SelectItem>
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
              />
            </div>
          </div>

          {/* Location-based Search */}
          <div className="border-t pt-4">
            <h3 className="text-md font-medium text-gray-700 mb-3">
              Location-based Search
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="43.2220"
                  value={nearbyParams.latitude || ""}
                  onChange={(e) =>
                    setNearbyParams({
                      ...nearbyParams,
                      latitude: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="76.8512"
                  value={nearbyParams.longitude || ""}
                  onChange={(e) =>
                    setNearbyParams({
                      ...nearbyParams,
                      longitude: parseFloat(e.target.value) || 0,
                    })
                  }
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
                />
              </div>
            </div>
          </div>

          {/* Availability Search */}
          <div className="border-t pt-4">
            <h3 className="text-md font-medium text-gray-700 mb-3">
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
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Button
          onClick={onSearch}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Search Apartments
        </Button>
      </div>
    </div>
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
  const [hasSearched, setHasSearched] = useState(false);

  // Query hooks
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    isError: isSearchError,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchApartments(searchParams, {
    enabled: activeSearchType === "general" && hasSearched,
  });

  const {
    data: nearbyResults,
    isLoading: isNearbyLoading,
    isError: isNearbyError,
    error: nearbyError,
    refetch: refetchNearby,
  } = useNearbyApartments(nearbyParams, {
    enabled: activeSearchType === "nearby" && hasSearched,
  });

  const {
    data: availabilityResults,
    isLoading: isAvailabilityLoading,
    isError: isAvailabilityError,
    error: availabilityError,
    refetch: refetchAvailability,
  } = useAvailableApartments(availabilityParams, {
    enabled: activeSearchType === "availability" && hasSearched,
  });

  const {
    data: promotedResults,
    isLoading: isPromotedLoading,
    isError: isPromotedError,
    error: promotedError,
    refetch: refetchPromoted,
  } = usePromotedApartments(
    {},
    {
      enabled: activeSearchType === "promoted" && hasSearched,
    },
  );

  const handleSearch = () => {
    setHasSearched(true);

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

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
            Find Your Perfect Apartment
          </h1>
          <p className="text-gray-600 mt-2">
            Search through thousands of apartment listings in Kazakhstan
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

        {/* Search Results Section */}
        {hasSearched && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Search Results
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

              <Badge variant="outline" className="text-blue-600 bg-blue-50">
                {activeSearchType === "nearby" && "Location-based search"}
                {activeSearchType === "availability" && "Availability search"}
                {activeSearchType === "promoted" && "Featured apartments"}
                {activeSearchType === "general" && "General search"}
              </Badge>
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <ApartmentCardSkeleton key={index} />
                ))}
              </div>
            )}

            {isError && (
              <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  Error Loading Results
                </h3>
                <p className="text-red-600">
                  {error?.message ||
                    "Failed to load search results. Please try again."}
                </p>
                <Button
                  variant="outline"
                  className="mt-4 border-red-300 text-red-600 hover:bg-red-50"
                  onClick={handleSearch}
                >
                  Try Again
                </Button>
              </div>
            )}

            {!isLoading &&
              !isError &&
              apartments &&
              apartments.length === 0 && (
                <div className="bg-blue-50 p-10 rounded-lg border border-blue-100 text-center">
                  <Search className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-blue-800 mb-2">
                    No Apartments Found
                  </h3>
                  <p className="text-blue-600 mb-6">
                    Try adjusting your search criteria or browse all apartments.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchParams({});
                      setNearbyParams({} as NearbySearchParams);
                      setAvailabilityParams({} as AvailabilitySearchParams);
                      setActiveSearchType("promoted");
                      handleSearch();
                    }}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    Show Featured Apartments
                  </Button>
                </div>
              )}

            {!isLoading && !isError && apartments && apartments.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apartments.map((apartment) => (
                  <ApartmentCard
                    key={apartment.apartmentId}
                    apartment={apartment}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!hasSearched && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-10 rounded-lg border border-blue-100 text-center">
            <Search className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-medium text-blue-800 mb-2">
              Ready to Find Your Dream Home?
            </h3>
            <p className="text-blue-600 mb-6">
              Use the filters above to search for apartments that match your
              preferences, or browse featured listings.
            </p>
            <Button
              onClick={() => {
                setActiveSearchType("promoted");
                handleSearch();
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Star className="h-4 w-4 mr-2" />
              Show Featured Apartments
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
