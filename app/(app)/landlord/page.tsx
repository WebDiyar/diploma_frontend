"use client";
import { useState, useEffect } from "react";
import { useLandlords } from "@/hooks/users";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Filter,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfileStore } from "@/store/profileStore";
import LandlordCard from "@/components/landloards/LandloardCard";

export default function LandlordsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterByCity, setFilterByCity] = useState("");
  const [filterByLanguage, setFilterByLanguage] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  const { profile } = useProfileStore();

  const skip = (page - 1) * limit;

  // Fetch landlords data
  const {
    data: landlords,
    isLoading,
    isError,
    error,
    refetch,
  } = useLandlords(
    { skip, limit },
    {
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
  );

  // Extract unique values for filters
  const [cities, setCities] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    if (landlords) {
      // Get unique cities
      const uniqueCities = Array.from(
        new Set(landlords.map((landlord) => landlord.city).filter(Boolean)),
      );
      setCities(uniqueCities);

      // Get unique languages
      const allLanguages: string[] = [];
      landlords.forEach((landlord) => {
        if (
          landlord.language_preferences &&
          Array.isArray(landlord.language_preferences)
        ) {
          allLanguages.push(...landlord.language_preferences);
        }
      });

      const uniqueLanguages = Array.from(new Set(allLanguages));
      setLanguages(uniqueLanguages);
    }
  }, [landlords]);

  // Apply filters
  const filteredLandlords = landlords
    ? landlords
        .filter((landlord) => {
          // Search filter
          const searchLower = searchQuery.toLowerCase();
          const nameMatch = `${landlord.name || ""} ${landlord.surname || ""}`
            .toLowerCase()
            .includes(searchLower);
          const cityMatch =
            landlord.city?.toLowerCase().includes(searchLower) || false;
          const bioMatch =
            landlord.bio?.toLowerCase().includes(searchLower) || false;

          const searchMatches =
            searchLower === "" || nameMatch || cityMatch || bioMatch;

          // City filter
          const cityFilterMatch =
            filterByCity === "" || landlord.city === filterByCity;

          // Language filter
          const languageFilterMatch =
            filterByLanguage === "" ||
            (landlord.language_preferences &&
              Array.isArray(landlord.language_preferences) &&
              landlord.language_preferences.includes(filterByLanguage));

          return searchMatches && cityFilterMatch && languageFilterMatch;
        })
        .sort((a, b) => {
          // Sort
          if (sortBy === "name") {
            return `${a.name || ""} ${a.surname || ""}`.localeCompare(
              `${b.name || ""} ${b.surname || ""}`,
            );
          } else if (sortBy === "newest") {
            return (
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
            );
          } else if (sortBy === "oldest") {
            return (
              new Date(a.createdAt || 0).getTime() -
              new Date(b.createdAt || 0).getTime()
            );
          } else {
            // Default fallback sort
            return (a.name || "").localeCompare(b.name || "");
          }
        })
    : [];

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setFilterByCity("");
    setFilterByLanguage("");
    setSortBy("name");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery !== "" || filterByCity !== "" || filterByLanguage !== "";

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 mb-8 shadow-lg text-white">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-3">Find Verified Landlords</h1>
            <p className="text-blue-100 mb-6">
              Connect with trustworthy property owners who have been verified by
              our team. Browse through profiles, view properties, and find your
              perfect match.
            </p>

            {/* Search bar */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by name, location, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-lg border-0 shadow-md text-gray-800 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mt-4 flex items-center">
              <Button
                variant="outline"
                className="text-white border-white/30 hover:bg-white/10 hover:text-white"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="ml-2 text-white border-white/30 hover:bg-white/10 hover:text-white"
                  onClick={resetFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}

              <div className="ml-auto text-sm text-blue-100">
                {filteredLandlords.length} landlord
                {filteredLandlords.length !== 1 ? "s" : ""} found
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by City
                </label>
                <Select
                  value={filterByCity}
                  onValueChange={(value) => setFilterByCity(value)}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cities</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Language
                </label>
                <Select
                  value={filterByLanguage}
                  onValueChange={(value) => setFilterByLanguage(value)}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="All Languages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Languages</SelectItem>
                    {languages.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value)}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchQuery && (
              <Badge className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery("")}>
                  <X className="h-3 w-3 ml-1" />
                </button>
              </Badge>
            )}

            {filterByCity && (
              <Badge className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                City: {filterByCity}
                <button onClick={() => setFilterByCity("")}>
                  <X className="h-3 w-3 ml-1" />
                </button>
              </Badge>
            )}

            {filterByLanguage && (
              <Badge className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                Language: {filterByLanguage}
                <button onClick={() => setFilterByLanguage("")}>
                  <X className="h-3 w-3 ml-1" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Landlords Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading landlords...</span>
          </div>
        ) : isError ? (
          <div className="bg-red-50 p-8 rounded-lg border border-red-200 text-center">
            <p className="text-red-700 mb-4">
              {error instanceof Error
                ? error.message
                : "Failed to load landlords"}
            </p>
            <Button
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : filteredLandlords.length === 0 ? (
          <div className="bg-yellow-50 p-8 rounded-lg border border-yellow-200 text-center">
            <p className="text-yellow-700 mb-4">
              No landlords found matching your criteria
            </p>
            <Button
              variant="outline"
              className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
              onClick={resetFilters}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLandlords.map((landlord) => (
              <LandlordCard key={landlord.userId} landlord={landlord} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {landlords && landlords.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {page > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    className="w-9 h-9 p-0"
                  >
                    {page - 1}
                  </Button>
                )}

                <Button
                  variant="default"
                  size="sm"
                  className="w-9 h-9 p-0 bg-blue-600"
                >
                  {page}
                </Button>

                {landlords.length >= limit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    className="w-9 h-9 p-0"
                  >
                    {page + 1}
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={landlords.length < limit}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Become a Landlord CTA */}
        {profile && !profile.is_landlord && (
          <div className="mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 text-white shadow-lg">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">
                Are You a Property Owner?
              </h2>
              <p className="text-indigo-100 mb-6">
                Join our platform as a verified landlord and connect with
                thousands of potential tenants. Showcase your properties and
                find reliable renters.
              </p>
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-indigo-600"
                asChild
              >
                <a href="/profile">Become a Landlord</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
