// app/property-management/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutDashboard,
  Settings,
  Trash2,
  PenLine,
  BookOpen,
  CalendarDays,
  LogOut,
  Info,
  Plus,
  Search,
} from "lucide-react";

// Types
interface Address {
  street: string;
  house_number: string;
  apartment_number: string;
  entrance: string;
  has_intercom: boolean;
  landmark: string;
}

interface Apartment {
  apartment_id: string;
  apartment_name: string;
  description: string;
  address: Address;
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
}

interface Room {
  id: string;
  name: string;
  status: "Online" | "Offline" | "Booked";
  apartmentName: string;
  datePublished: string;
  price: number;
  listingId: string;
  location: string;
  image: string;
}

export default function PropertyManagement() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"apartments" | "rooms">("rooms");
  const [currentPage, setCurrentPage] = useState(1);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  // Fetch apartments data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you'd fetch from an API, e.g. /api/my-apartments
        // For now we'll use mock data
        const mockData = {
          apartments: [
            {
              apartment_id: "1",
              apartment_name: "Студенческий уют AITU",
              description:
                "Сдаётся светлая квартира рядом с университетом. Отлично подойдёт для студентов.",
              address: {
                street: "ул. Кабанбай батыра",
                house_number: "10",
                apartment_number: "12",
                entrance: "2",
                has_intercom: true,
                landmark: "рядом с Burger King",
              },
              district_name: "Yesil",
              latitude: 51.0909,
              longitude: 71.4187,
              price_per_month: 95000,
              area: 50,
              kitchen_area: 8,
              floor: 5,
              number_of_rooms: 2,
              max_users: 2,
              available_from: "2025-05-01",
              available_until: "2025-08-31",
              university_nearby: "Astana IT University",
              pictures: [
                "https://cdn.domain.com/img1.jpg",
                "https://cdn.domain.com/img2.jpg",
              ],
              is_promoted: false,
              is_pet_allowed: true,
              rental_type: "room",
              roommate_preferences: "не шумные, девушки, без животных",
              included_utilities: [
                "Wi-Fi",
                "вода",
                "мебель",
                "стиральная машина",
              ],
              rules: ["только девушкам", "нельзя курить"],
              contact_phone: "+77001234567",
              contact_telegram: "@aitu_host",
            },
            {
              apartment_id: "2",
              apartment_name: "Уютная квартира в центре",
              description:
                "Комфортная квартира для студентов в центре города. В шаговой доступности от всех необходимых объектов инфраструктуры.",
              address: {
                street: "ул. Достык",
                house_number: "5",
                apartment_number: "42",
                entrance: "1",
                has_intercom: true,
                landmark: "напротив ТРЦ Керуен",
              },
              district_name: "Есильский",
              latitude: 51.1209,
              longitude: 71.4307,
              price_per_month: 120000,
              area: 65,
              kitchen_area: 12,
              floor: 8,
              number_of_rooms: 3,
              max_users: 3,
              available_from: "2025-06-01",
              available_until: "2025-12-31",
              university_nearby: "Nazarbayev University",
              pictures: [
                "https://cdn.domain.com/apartment2-1.jpg",
                "https://cdn.domain.com/apartment2-2.jpg",
                "https://cdn.domain.com/apartment2-3.jpg",
              ],
              is_promoted: true,
              is_pet_allowed: false,
              rental_type: "full",
              roommate_preferences: "студенты, чистоплотные",
              included_utilities: [
                "интернет",
                "коммунальные услуги",
                "телевидение",
              ],
              rules: ["не курить в квартире", "без шумных вечеринок"],
              contact_phone: "+77012345678",
              contact_telegram: "@central_apartment",
            },
            {
              apartment_id: "3",
              apartment_name: "Просторная квартира для студентов",
              description:
                "Большая светлая квартира идеально подходит для совместного проживания студентов. Просторные комнаты и удобное расположение.",
              address: {
                street: "ул. Сыганак",
                house_number: "15",
                apartment_number: "89",
                entrance: "3",
                has_intercom: true,
                landmark: "рядом с парком",
              },
              district_name: "Алматинский",
              latitude: 51.0876,
              longitude: 71.4023,
              price_per_month: 150000,
              area: 85,
              kitchen_area: 14,
              floor: 12,
              number_of_rooms: 4,
              max_users: 4,
              available_from: "2025-05-15",
              available_until: "2026-05-15",
              university_nearby: "Eurasian National University",
              pictures: [
                "https://cdn.domain.com/apartment3-1.jpg",
                "https://cdn.domain.com/apartment3-2.jpg",
              ],
              is_promoted: false,
              is_pet_allowed: true,
              rental_type: "full",
              roommate_preferences: "студенты, спокойные, аккуратные",
              included_utilities: [
                "вода",
                "электричество",
                "интернет",
                "мебель",
                "бытовая техника",
              ],
              rules: [
                "соблюдение тишины после 22:00",
                "бережное отношение к мебели",
              ],
              contact_phone: "+77023456789",
              contact_telegram: "@spacious_flat",
            },
          ],
        };

        setApartments(mockData.apartments);

        // Generate rooms based on apartments data
        const roomsData: Room[] = [];

        mockData.apartments.forEach((apartment: Apartment) => {
          // Create rooms for each apartment based on number_of_rooms
          const roomCount = apartment.number_of_rooms || 1;

          for (let i = 1; i <= roomCount; i++) {
            const statusOptions: ("Online" | "Offline" | "Booked")[] = [
              "Online",
              "Offline",
              "Booked",
            ];
            const randomStatus =
              statusOptions[Math.floor(Math.random() * statusOptions.length)];

            // Generate random date with format DD-MM-YYYY
            const randomMonth = Math.floor(Math.random() * 3) + 9; // September to November
            const randomDay = Math.floor(Math.random() * 28) + 1;
            const datePublished = `${randomDay < 10 ? "0" + randomDay : randomDay}-${randomMonth < 10 ? "0" + randomMonth : randomMonth}-2023`;

            // Calculate room price (divide apartment price by number of rooms)
            const roomPrice = Math.round(apartment.price_per_month / roomCount);

            roomsData.push({
              id: `${apartment.apartment_id}-${i}`,
              name: `Room ${i}`,
              status: randomStatus,
              apartmentName: apartment.apartment_name,
              datePublished: i % 2 === 0 ? "01-01-2024" : datePublished,
              price: roomPrice,
              listingId: (1000 + Math.floor(Math.random() * 5000)).toString(),
              location: `${apartment.address.street} ${apartment.address.house_number}`,
              image: `/room-${i}.jpg`, // Mock image URL
            });
          }
        });

        setRooms(roomsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching apartments:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.apartmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageItems = filteredRooms.slice(startIndex, endIndex);

  // Status badge styling
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Online":
        return "bg-green-100 text-green-800 border-green-200";
      case "Offline":
        return "bg-red-100 text-red-800 border-red-200";
      case "Booked":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar - not full height to account for header and footer */}
        <aside className="hidden md:flex flex-col w-60 bg-gray-50 border-r">
          <nav className="flex-1 px-4 py-6 space-y-1">
            <a
              href="#"
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <LayoutDashboard className="h-5 w-5 mr-3 text-gray-500" />
              <span>Dashboard</span>
            </a>

            <a
              href="#"
              className="flex items-center px-4 py-3 text-blue-600 bg-blue-50 rounded-lg font-medium"
            >
              <LayoutDashboard className="h-5 w-5 mr-3 text-blue-600" />
              <span>Property Management</span>
            </a>

            <a
              href="#"
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <CalendarDays className="h-5 w-5 mr-3 text-gray-500" />
              <span>Room Availability</span>
            </a>

            <a
              href="#"
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <BookOpen className="h-5 w-5 mr-3 text-gray-500" />
              <span>Booking Requests</span>
            </a>
          </nav>

          <div className="p-4 mt-auto">
            <a
              href="#"
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <Settings className="h-5 w-5 mr-3 text-gray-500" />
              <span>Settings</span>
            </a>

            <a
              href="#"
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 mt-1"
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-500" />
              <span>Logout</span>
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Property Management
              </h1>
              <p className="text-gray-500 mt-1">
                Manage your properties and rooms for rent
              </p>
            </div>

            {/* Tabs */}
            <Tabs
              defaultValue="apartments"
              className="mb-6"
              onValueChange={(value) =>
                setActiveTab(value as "apartments" | "rooms")
              }
            >
              <div className="flex justify-between items-center mb-4">
                <TabsList className="bg-gray-100">
                  <TabsTrigger
                    value="apartments"
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    Apartments
                  </TabsTrigger>
                  <TabsTrigger
                    value="rooms"
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    Rooms
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search"
                      className="pl-8 w-full md:w-60 border-gray-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Room
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Apartment
                  </Button>
                </div>
              </div>

              <TabsContent value="apartments">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {apartments.map((apartment) => (
                    <Card
                      key={apartment.apartment_id}
                      className="overflow-hidden hover:shadow-md transition-shadow border border-gray-200 rounded-xl"
                    >
                      <div className="h-40 bg-gray-200"></div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-lg">
                            {apartment.apartment_name}
                          </h3>
                          {apartment.is_promoted && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-100">
                              Promoted
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-500 mb-3 line-clamp-2">
                          {apartment.description}
                        </p>
                        <div className="flex justify-between items-center text-sm mb-3">
                          <div>
                            <span className="font-medium">
                              {apartment.number_of_rooms} rooms
                            </span>{" "}
                            • {apartment.area} м²
                          </div>
                          <div className="font-bold text-base">
                            {apartment.price_per_month.toLocaleString()} ₸
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          {apartment.address.street}{" "}
                          {apartment.address.house_number}
                        </div>
                        <div className="flex justify-end mt-2 space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:bg-gray-100"
                          >
                            <PenLine className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-200 hover:bg-gray-50"
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="rooms">
                <Card className="border border-gray-200 rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow className="border-gray-200">
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                          <div className="flex items-center">
                            Apartment
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 ml-1 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-white border border-gray-200 shadow-md">
                                  <p>The apartment this room belongs to</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableHead>
                        <TableHead>Date Published</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!isLoading &&
                        currentPageItems.map((room) => (
                          <TableRow
                            key={room.id}
                            className="hover:bg-gray-50 border-gray-200"
                          >
                            <TableCell>
                              <Checkbox />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-md bg-gray-200 mr-3 flex-shrink-0"></div>
                                <span className="font-medium">{room.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeVariant(room.status)}`}
                              >
                                {room.status}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">
                              {room.apartmentName}
                            </TableCell>
                            <TableCell>{room.datePublished}</TableCell>
                            <TableCell className="font-medium">
                              {room.price.toLocaleString()} ₸
                            </TableCell>
                            <TableCell>{room.location}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:bg-gray-100"
                                >
                                  <PenLine className="h-4 w-4 text-gray-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:bg-gray-100"
                                >
                                  <Trash2 className="h-4 w-4 text-gray-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      {isLoading && (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            <div className="flex items-center justify-center">
                              <div className="h-6 w-6 border-2 border-t-blue-600 rounded-full animate-spin"></div>
                              <span className="ml-2">Loading data...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {!isLoading && currentPageItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            {searchTerm ? (
                              <div>
                                <p className="text-gray-500">
                                  No results found for "{searchTerm}"
                                </p>
                                <Button
                                  variant="link"
                                  className="text-blue-600"
                                  onClick={() => setSearchTerm("")}
                                >
                                  Clear search
                                </Button>
                              </div>
                            ) : (
                              <p className="text-gray-500">
                                No rooms available
                              </p>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {filteredRooms.length > 0 && (
                    <div className="py-4 px-6 flex items-center justify-between border-t border-gray-200 bg-white">
                      <div className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">{startIndex + 1}</span> to{" "}
                        <span className="font-medium">
                          {Math.min(endIndex, filteredRooms.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {filteredRooms.length}
                        </span>{" "}
                        results
                      </div>

                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1)
                                  setCurrentPage(currentPage - 1);
                              }}
                              className={`${currentPage <= 1 ? "pointer-events-none opacity-50" : ""} border border-gray-200 rounded-lg text-gray-700`}
                            />
                          </PaginationItem>

                          {Array.from({ length: totalPages }).map(
                            (_, index) => {
                              const pageNumber = index + 1;

                              // Show first, last, and pages around current page
                              if (
                                pageNumber === 1 ||
                                pageNumber === totalPages ||
                                (pageNumber >= currentPage - 1 &&
                                  pageNumber <= currentPage + 1)
                              ) {
                                return (
                                  <PaginationItem key={pageNumber}>
                                    <PaginationLink
                                      href="#"
                                      isActive={pageNumber === currentPage}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentPage(pageNumber);
                                      }}
                                      className={`rounded-lg ${pageNumber === currentPage ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-700"}`}
                                    >
                                      {pageNumber}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              }

                              // Show ellipsis for gaps
                              if (
                                (pageNumber === 2 && currentPage > 3) ||
                                (pageNumber === totalPages - 1 &&
                                  currentPage < totalPages - 2)
                              ) {
                                return (
                                  <PaginationEllipsis
                                    key={`ellipsis-${pageNumber}`}
                                  />
                                );
                              }

                              return null;
                            },
                          )}

                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages)
                                  setCurrentPage(currentPage + 1);
                              }}
                              className={`${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""} border border-gray-200 rounded-lg text-gray-700`}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">
              © 2025 RentEase. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-gray-500 hover:text-blue-600">
              Terms
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-blue-600">
              Privacy
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-blue-600">
              Help
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
