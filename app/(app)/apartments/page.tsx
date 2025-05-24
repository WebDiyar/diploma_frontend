"use client";
import { useEffect, useState } from "react";
import {
  useDeleteApartment,
  useOwnerApartments,
  useSearchApartments,
  useUpdateApartment,
} from "@/hooks/apartments";
import {
  ApartmentSearchParams,
  Apartment,
} from "@/lib/api_from_swagger/apartments";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  MapPin,
  Home,
  DollarSign,
  CalendarDays,
  User,
  School,
  PawPrint,
  Edit,
  Trash2,
  Eye,
  Plus,
  Star,
  StarOff,
  Check,
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("kk-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Truncate text to a specific length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncating
 * @returns Truncated text with ellipsis if needed
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Calculate distance between two coordinate points in kilometers
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 * @param deg - Degrees
 * @returns Radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Fixed owner ID for demonstration purposes
const OWNER_ID = "user123";

/**
 * Owner's apartment dashboard page
 */
export default function OwnerApartmentsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch owner's apartments
  const {
    data: apartments,
    isLoading,
    isError,
    error,
    refetch,
  } = useOwnerApartments(OWNER_ID);

  // Update apartment mutation
  const updateMutation = useUpdateApartment({
    onSuccess: () => {
      toast.success("Apartment updated successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      refetch();
    },
    onError: (error) => {
      toast.error(`Error updating apartment: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    },
  });

  // Delete apartment mutation
  const deleteMutation = useDeleteApartment({
    onSuccess: () => {
      toast.success("Apartment deleted successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setDeleteDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error deleting apartment: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    },
  });

  // Toggle apartment promotion status
  const togglePromotion = (apartment: Apartment) => {
    updateMutation.mutate({
      apartmentId: apartment.apartmentId,
      apartmentData: {
        is_promoted: !apartment.is_promoted,
      },
    });
  };

  // Toggle apartment active status
  const toggleActive = (apartment: Apartment) => {
    updateMutation.mutate({
      apartmentId: apartment.apartmentId,
      apartmentData: {
        is_active: !apartment.is_active,
      },
    });
  };

  // Delete apartment
  const confirmDelete = () => {
    if (selectedApartment) {
      deleteMutation.mutate(selectedApartment.apartmentId);
    }
  };

  // Handle errors
  useEffect(() => {
    if (isError) {
      toast.error(
        `Error loading apartments: ${error?.message || "An unknown error occurred"}`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      );
    }
  }, [isError, error]);

  // Calculate dashboard metrics
  const activeApartments = apartments?.filter((a) => a.is_active) || [];
  const promotedApartments = apartments?.filter((a) => a.is_promoted) || [];
  const totalMonthlyRevenue = activeApartments.reduce(
    (total, apt) => total + apt.price_per_month,
    0,
  );
  const averagePrice = activeApartments.length
    ? Math.round(totalMonthlyRevenue / activeApartments.length)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Toast Container for notifications */}
      <ToastContainer />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Apartments</h1>
          <p className="text-muted-foreground">
            Manage your rental properties and listings
          </p>
        </div>
        <Button className="mt-4 md:mt-0" size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add New Apartment
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Dashboard Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Properties</CardDescription>
                <CardTitle className="text-2xl">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    apartments?.length || 0
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground flex items-center">
                  <Home className="mr-1 h-3 w-3" />
                  {isLoading ? (
                    <Skeleton className="h-3 w-24" />
                  ) : (
                    `${activeApartments.length} active listings`
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Promoted Listings</CardDescription>
                <CardTitle className="text-2xl">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    promotedApartments.length
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground flex items-center">
                  <Star className="mr-1 h-3 w-3" />
                  {isLoading ? (
                    <Skeleton className="h-3 w-24" />
                  ) : (
                    `${Math.round((promotedApartments.length / (apartments?.length || 1)) * 100)}% of total listings`
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Monthly Revenue Potential</CardDescription>
                <CardTitle className="text-2xl">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    formatPrice(totalMonthlyRevenue)
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground flex items-center">
                  <DollarSign className="mr-1 h-3 w-3" />
                  {isLoading ? (
                    <Skeleton className="h-3 w-24" />
                  ) : (
                    `From ${activeApartments.length} active properties`
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Average Price</CardDescription>
                <CardTitle className="text-2xl">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    formatPrice(averagePrice)
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground flex items-center">
                  <CalendarDays className="mr-1 h-3 w-3" />
                  {isLoading ? (
                    <Skeleton className="h-3 w-24" />
                  ) : (
                    `Per month average rate`
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Listings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Listings</CardTitle>
              <CardDescription>
                Your most recently added properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : isError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load apartments. Please try again later.
                  </AlertDescription>
                </Alert>
              ) : apartments?.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No apartments found</AlertTitle>
                  <AlertDescription>
                    You haven't added any apartments yet. Add your first
                    property to get started.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {apartments?.slice(0, 3).map((apartment) => (
                    <div
                      key={apartment.apartmentId}
                      className="flex items-center space-x-4 p-4 border rounded-md"
                    >
                      <div className="h-16 w-16 relative rounded-md overflow-hidden bg-muted">
                        {apartment.pictures && apartment.pictures.length > 0 ? (
                          <img
                            src={apartment.pictures[0]}
                            alt={apartment.apartment_name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        {!apartment.is_active && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <Badge variant="outline">Inactive</Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium truncate mr-2">
                            {apartment.apartment_name}
                          </h3>
                          {apartment.is_promoted && (
                            <Badge variant="secondary" className="h-5">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {apartment.address.street}, {apartment.district_name}
                        </p>
                        <p className="text-xs mt-1">
                          <span className="font-medium">
                            {formatPrice(apartment.price_per_month)}
                          </span>
                          /month
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-more-vertical"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" /> Edit Listing
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="flex items-center"
                            onClick={() => togglePromotion(apartment)}
                          >
                            {apartment.is_promoted ? (
                              <>
                                <StarOff className="mr-2 h-4 w-4" /> Remove
                                Promotion
                              </>
                            ) : (
                              <>
                                <Star className="mr-2 h-4 w-4" /> Promote
                                Listing
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center"
                            onClick={() => toggleActive(apartment)}
                          >
                            {apartment.is_active ? (
                              <>
                                <X className="mr-2 h-4 w-4" /> Deactivate
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" /> Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="flex items-center text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedApartment(apartment);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Listing
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setActiveTab("listings")}
              >
                View All Listings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>All Properties</CardTitle>
                  <CardDescription>
                    Manage all your apartment listings
                  </CardDescription>
                </div>
                <div className="mt-4 sm:mt-0">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add New
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : isError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load apartments. Please try again later.
                  </AlertDescription>
                </Alert>
              ) : apartments?.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No apartments found</AlertTitle>
                  <AlertDescription>
                    You haven't added any apartments yet. Add your first
                    property to get started.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Apartment</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Location
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Available From
                        </TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Featured</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apartments?.map((apartment) => (
                        <TableRow key={apartment.apartmentId}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                {apartment.pictures &&
                                apartment.pictures.length > 0 ? (
                                  <img
                                    src={apartment.pictures[0]}
                                    alt={apartment.apartment_name}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Home className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {truncateText(apartment.apartment_name, 20)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {apartment.number_of_rooms} rooms |{" "}
                                  {apartment.max_users} guests
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatPrice(apartment.price_per_month)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              per month
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="text-sm">
                              {truncateText(apartment.district_name, 15)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {truncateText(apartment.address.street, 20)}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDate(apartment.available_from)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={apartment.is_active}
                              onCheckedChange={() => toggleActive(apartment)}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant={
                                apartment.is_promoted ? "secondary" : "ghost"
                              }
                              size="icon"
                              onClick={() => togglePromotion(apartment)}
                            >
                              {apartment.is_promoted ? (
                                <Star className="h-4 w-4" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-more-vertical"
                                  >
                                    <circle cx="12" cy="12" r="1" />
                                    <circle cx="12" cy="5" r="1" />
                                    <circle cx="12" cy="19" r="1" />
                                  </svg>
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="flex items-center">
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center">
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="flex items-center text-destructive focus:text-destructive"
                                  onClick={() => {
                                    setSelectedApartment(apartment);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                View insights about your property listings
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="rounded-full h-12 w-12 bg-primary/10 flex items-center justify-center mx-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">
                      Analytics Coming Soon
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We're working on providing detailed analytics for your
                      listings.
                    </p>
                  </div>
                  <Button variant="outline">View Sample Report</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Apartment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this apartment? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedApartment && (
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {selectedApartment.pictures &&
                  selectedApartment.pictures.length > 0 ? (
                    <img
                      src={selectedApartment.pictures[0]}
                      alt={selectedApartment.apartment_name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {selectedApartment.apartment_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedApartment.address.street},{" "}
                    {selectedApartment.district_name}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">
                      {formatPrice(selectedApartment.price_per_month)}
                    </span>
                    /month
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Apartment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
