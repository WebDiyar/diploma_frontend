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
  ArrowLeft,
  MessageSquare,
  FileText,
  CreditCard,
  User,
  Briefcase,
  GraduationCap,
  Shield,
  Heart,
  ExternalLink,
  Download,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

// Types
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

interface BookingRequestDetails extends BookingRequest {
  tenant: BookingRequest["tenant"] & {
    age: number;
    occupation: string;
    education: string;
    bio: string;
    socialProfiles: {
      linkedin?: string;
      facebook?: string;
    };
    references: {
      name: string;
      relation: string;
      phone: string;
      email: string;
    }[];
    documents: {
      name: string;
      type: string;
      uploadDate: string;
    }[];
  };
  landlord: {
    name: string;
    avatar: string;
    email: string;
    phone: string;
    rating: number;
    responseRate: number;
    joinedDate: string;
    totalProperties: number;
    verified: boolean;
  };
  propertyDetails: {
    images: string[];
    description: string;
    amenities: string[];
    rules: string[];
    area: number;
    floor: number;
    totalFloors: number;
    furnished: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
  };
  applicationDetails: {
    preferredMoveInDate: string;
    reasonForStay: string;
    employmentStatus: string;
    monthlyIncome: number;
    previousRentalHistory: string;
    emergencyContact: {
      name: string;
      phone: string;
      relation: string;
    };
  };
}

// Fake data
const fakeBookingRequests: BookingRequest[] = [
  {
    id: "1",
    room: "Room 1",
    apartment: "Almaty Heights Residence",
    apartmentId: "apt_001",
    price: 180000,
    tenant: {
      name: "Aigerim Nazarbayeva",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612345b?w=128&h=128&fit=crop&crop=face",
      email: "aigerim.nazarbayeva@gmail.com",
      phone: "+7 (701) 123-4567",
      country: "KZ",
    },
    location: "Nazarbayev Avenue, 42",
    dateApplication: "2024-01-01",
    status: "rejected",
    checkInDate: "2024-02-01",
    checkOutDate: "2024-08-01",
    duration: 6,
    message:
      "Looking for a quiet place to study during my internship at Tengizchevroil.",
  },
  {
    id: "2",
    room: "Room 2",
    apartment: "Almaty Heights Residence",
    apartmentId: "apt_001",
    price: 180000,
    tenant: {
      name: "Dias Mukashev",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face",
      email: "dias.mukashev@gmail.com",
      phone: "+7 (702) 234-5678",
      country: "KZ",
    },
    location: "Abai Avenue, 17",
    dateApplication: "2023-09-20",
    status: "accepted",
    checkInDate: "2023-10-01",
    checkOutDate: "2024-03-31",
    duration: 6,
    message:
      "IT professional working remotely for Kaspi.kz, very clean and organized.",
  },
  {
    id: "3",
    room: "Room 3",
    apartment: "Almaty Heights Residence",
    apartmentId: "apt_001",
    price: 180000,
    tenant: {
      name: "Assel Tokayeva",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face",
      email: "assel.tokayeva@gmail.com",
      phone: "+7 (703) 345-6789",
      country: "KZ",
    },
    location: "Dostyk Avenue, 88",
    dateApplication: "2023-11-01",
    status: "waiting",
    checkInDate: "2023-12-01",
    checkOutDate: "2024-05-31",
    duration: 6,
    message:
      "Graduate student at Kazakh National University looking for accommodation near campus. I'm working on my thesis in machine learning and need a quiet environment for studying. I'm very clean, respectful, and responsible.",
  },
  {
    id: "4",
    room: "Room 1",
    apartment: "Astana Business Center",
    apartmentId: "apt_002",
    price: 200000,
    tenant: {
      name: "Arman Serikbaev",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face",
      email: "arman.serikbaev@gmail.com",
      phone: "+7 (704) 456-7890",
      country: "KZ",
    },
    location: "Mangilik El Avenue, 5",
    dateApplication: "2023-11-01",
    status: "waiting",
    checkInDate: "2023-12-15",
    checkOutDate: "2024-06-15",
    duration: 6,
    message:
      "Young professional working in Samruk-Kazyna, references available.",
  },
  {
    id: "5",
    room: "Room 2",
    apartment: "Astana Business Center",
    apartmentId: "apt_002",
    price: 200000,
    tenant: {
      name: "Danel Aitbayev",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=face",
      email: "danel.aitbayev@gmail.com",
      phone: "+7 (705) 567-8901",
      country: "KZ",
    },
    location: "Kenesary Street, 15",
    dateApplication: "2023-11-01",
    status: "waiting",
    checkInDate: "2024-01-01",
    checkOutDate: "2024-07-01",
    duration: 6,
    message: "Quiet engineer from KazMunayGas, excellent rental history.",
  },
  {
    id: "6",
    room: "Room 3",
    apartment: "Astana Business Center",
    apartmentId: "apt_002",
    price: 200000,
    tenant: {
      name: "Zhanna Akhmetova",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&h=128&fit=crop&crop=face",
      email: "zhanna.akhmetova@gmail.com",
      phone: "+7 (706) 678-9012",
      country: "KZ",
    },
    location: "Republic Avenue, 33",
    dateApplication: "2023-11-01",
    status: "waiting",
    checkInDate: "2024-01-15",
    checkOutDate: "2024-07-15",
    duration: 6,
    message:
      "Art student at Kurmangazy Conservatory, looking for inspiring environment.",
  },
  {
    id: "7",
    room: "Room 4",
    apartment: "Astana Business Center",
    apartmentId: "apt_002",
    price: 200000,
    tenant: {
      name: "Yerlan Ospanov",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=128&h=128&fit=crop&crop=face",
      email: "yerlan.ospanov@gmail.com",
      phone: "+7 (707) 789-0123",
      country: "KZ",
    },
    location: "Turan Avenue, 21",
    dateApplication: "2023-09-20",
    status: "accepted",
    checkInDate: "2023-10-01",
    checkOutDate: "2024-04-01",
    duration: 6,
    message: "Software engineer at Halyk Bank, works from home occasionally.",
  },
  {
    id: "8",
    room: "Room 1",
    apartment: "Shymkent Garden Plaza",
    apartmentId: "apt_003",
    price: 150000,
    tenant: {
      name: "Madina Bektenova",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=face",
      email: "madina.bektenova@gmail.com",
      phone: "+7 (708) 890-1234",
      country: "KZ",
    },
    location: "Kabanbay Batyr Avenue, 45",
    dateApplication: "2023-09-20",
    status: "pending",
    checkInDate: "2024-02-01",
    checkOutDate: "2024-08-01",
    duration: 6,
    message:
      "Medical student at South Kazakhstan Medical Academy, very responsible.",
  },
  {
    id: "9",
    room: "Room 2",
    apartment: "Shymkent Garden Plaza",
    apartmentId: "apt_003",
    price: 150000,
    tenant: {
      name: "Timur Zhaksybekov",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face",
      email: "timur.zhaksybekov@gmail.com",
      phone: "+7 (709) 901-2345",
      country: "KZ",
    },
    location: "Al-Farabi Street, 67",
    dateApplication: "2024-01-15",
    status: "pending",
    checkInDate: "2024-03-01",
    checkOutDate: "2024-09-01",
    duration: 6,
    message:
      "Business analyst at ArcelorMittal Temirtau, seeking clean accommodation.",
  },
  {
    id: "10",
    room: "Room 1",
    apartment: "Aktobe Central Park",
    apartmentId: "apt_004",
    price: 140000,
    tenant: {
      name: "Saltanat Omarova",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face",
      email: "saltanat.omarova@gmail.com",
      phone: "+7 (710) 012-3456",
      country: "KZ",
    },
    location: "Aiteke Bi Street, 123",
    dateApplication: "2024-01-10",
    status: "waiting",
    checkInDate: "2024-02-15",
    checkOutDate: "2024-08-15",
    duration: 6,
    message:
      "Teacher at Nazarbayev Intellectual School, quiet and responsible tenant.",
  },
];

// Mock function to get detailed booking request
const getDetailedBookingRequest = (
  id: string,
): BookingRequestDetails | undefined => {
  const baseRequest = fakeBookingRequests.find((req) => req.id === id);
  if (!baseRequest) return undefined;

  // Create mock detailed data based on the base request
  const mockDetails: BookingRequestDetails = {
    ...baseRequest,
    tenant: {
      ...baseRequest.tenant,
      age: Math.floor(Math.random() * 15) + 20, // 20-35 years old
      occupation: getRandomOccupation(),
      education: getRandomEducation(),
      bio: getRandomBio(baseRequest.tenant.name),
      socialProfiles: {
        linkedin: "https://linkedin.com/in/tenant-profile",
        facebook: "https://facebook.com/tenant.profile",
      },
      references: [
        {
          name: "Dr. Askar Boranbayev",
          relation: "Academic Supervisor",
          phone: "+7 (701) 234-5678",
          email: "a.boranbayev@kaznu.kz",
        },
        {
          name: "Nurlan Tokayev",
          relation: "Father",
          phone: "+7 (702) 345-6789",
          email: "parent@gmail.com",
        },
      ],
      documents: [
        {
          name: "Student ID Card",
          type: "identification",
          uploadDate: "2023-10-15",
        },
        {
          name: "Income Statement",
          type: "financial",
          uploadDate: "2023-10-16",
        },
        {
          name: "Character Reference Letter",
          type: "reference",
          uploadDate: "2023-10-17",
        },
      ],
    },
    landlord: {
      name: "Baurzhan Nurmagambetov",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
      email: "baurzhan.nurmagambetov@gmail.com",
      phone: "+7 (777) 123-4567",
      rating: 4.8,
      responseRate: 95,
      joinedDate: "2021-03-15",
      totalProperties: 12,
      verified: true,
    },
    propertyDetails: {
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600",
      ],
      description: `Beautiful furnished room in ${baseRequest.apartment}. Located in the heart of Almaty with easy access to universities, shopping centers, and public transport.`,
      amenities: [
        "WiFi",
        "Air Conditioning",
        "Heating",
        "Kitchen Access",
        "Washing Machine",
        "Parking",
        "Security",
        "Elevator",
      ],
      rules: [
        "No smoking inside",
        "No parties",
        "Quiet hours 10 PM - 8 AM",
        "Keep common areas clean",
        "No overnight guests without permission",
      ],
      area: 18,
      floor: 5,
      totalFloors: 12,
      furnished: true,
      petsAllowed: false,
      smokingAllowed: false,
    },
    applicationDetails: {
      preferredMoveInDate: baseRequest.checkInDate,
      reasonForStay: "Academic studies - completing Master's thesis",
      employmentStatus: "Student with part-time research assistant position",
      monthlyIncome: 120000,
      previousRentalHistory:
        "Lived in university dormitory for 2 years, excellent record",
      emergencyContact: {
        name: "Emergency Contact",
        phone: "+7 (702) 345-6789",
        relation: "Father",
      },
    },
  };

  return mockDetails;
};

// Helper functions for random data
const getRandomOccupation = () => {
  const occupations = [
    "Graduate Student",
    "Software Engineer",
    "Medical Student",
    "Business Analyst",
    "Teacher",
    "Research Assistant",
  ];
  return occupations[Math.floor(Math.random() * occupations.length)];
};

const getRandomEducation = () => {
  const educations = [
    "Master's in Computer Science at Kazakh National University",
    "Bachelor's in Business Administration at KIMEP University",
    "PhD in Medical Sciences at Asfendiyarov University",
    "Master's in Engineering at Nazarbayev University",
  ];
  return educations[Math.floor(Math.random() * educations.length)];
};

const getRandomBio = (name: string) => {
  return `I'm ${name.split(" ")[0]}, a dedicated professional looking for a comfortable place to stay. I value clean, quiet living spaces and respect shared accommodations. I'm responsible, organized, and looking forward to being a great tenant.`;
};

// Utility functions
const formatPrice = (price: number): string => {
  return price.toLocaleString("en-US") + " KZT";
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "accepted":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 text-lg px-4 py-2">
          <Check className="h-4 w-4 mr-2" />
          Accepted
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100 text-lg px-4 py-2">
          <X className="h-4 w-4 mr-2" />
          Rejected
        </Badge>
      );
    case "waiting":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 text-lg px-4 py-2">
          <Clock className="h-4 w-4 mr-2" />
          Waiting for Review
        </Badge>
      );
    default:
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 text-lg px-4 py-2">
          <AlertCircle className="h-4 w-4 mr-2" />
          Pending
        </Badge>
      );
  }
};

const getRatingStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />,
    );
  }

  if (hasHalfStar) {
    stars.push(
      <Star key="half" className="h-4 w-4 fill-yellow-200 text-yellow-400" />,
    );
  }

  const remainingStars = 5 - Math.ceil(rating);
  for (let i = 0; i < remainingStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
  }

  return stars;
};

// Main Booking Request Details Page
export default function BookingRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [bookingDetails, setBookingDetails] =
    useState<BookingRequestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    if (id) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const details = getDetailedBookingRequest(id);
        if (details) {
          setBookingDetails(details);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
        setIsLoading(false);
      }, 1000);
    }
  }, [params.id]);

  const handleAccept = async () => {
    if (!bookingDetails) return;
    setIsProcessing(true);
    try {
      setBookingDetails((prev) =>
        prev ? { ...prev, status: "accepted" } : null,
      );
      toast.success("🎉 Booking request accepted!", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!bookingDetails) return;
    setIsProcessing(true);
    try {
      setBookingDetails((prev) =>
        prev ? { ...prev, status: "rejected" } : null,
      );
      toast.success("❌ Booking request rejected", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendResponse = () => {
    if (response.trim()) {
      toast.success("📧 Response sent to tenant!", {
        position: "top-right",
        autoClose: 3000,
      });
      setResponse("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Booking Request Not Found
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                  The booking request you're looking for doesn't exist or has
                  been removed.
                </p>
                <Button
                  onClick={() => router.push("/booking")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Booking Requests
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!bookingDetails) {
    return null;
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
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/booking")}
                className="border-gray-200 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Requests
              </Button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Booking Request Details
                </h1>
                <p className="text-gray-600">
                  Review tenant application and property details
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(bookingDetails.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property & Application Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Overview */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="relative">
                <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img
                    src={
                      bookingDetails.propertyDetails.images[selectedImageIndex]
                    }
                    alt={bookingDetails.apartment}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h2 className="text-2xl font-bold">
                      {bookingDetails.apartment}
                    </h2>
                    <p className="text-white/90 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {bookingDetails.location}
                    </p>
                  </div>
                </div>

                {/* Image Navigation */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  {bookingDetails.propertyDetails.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        selectedImageIndex === index
                          ? "bg-white"
                          : "bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Home className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">
                      {bookingDetails.room}
                    </p>
                    <p className="text-xs text-gray-500">Room</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <SquareUser className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">
                      {bookingDetails.propertyDetails.area}m²
                    </p>
                    <p className="text-xs text-gray-500">Area</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Building2 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">
                      Floor {bookingDetails.propertyDetails.floor}
                    </p>
                    <p className="text-xs text-gray-500">
                      of {bookingDetails.propertyDetails.totalFloors}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(bookingDetails.price)}
                    </p>
                    <p className="text-xs text-gray-500">per month</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-600">
                      {bookingDetails.propertyDetails.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Amenities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {bookingDetails.propertyDetails.amenities.map(
                        (amenity, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-gray-50"
                          >
                            {amenity}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      House Rules
                    </h3>
                    <ul className="space-y-1">
                      {bookingDetails.propertyDetails.rules.map(
                        (rule, index) => (
                          <li
                            key={index}
                            className="text-gray-600 text-sm flex items-center"
                          >
                            <Shield className="h-3 w-3 text-blue-500 mr-2 flex-shrink-0" />
                            {rule}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Message */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Application Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {bookingDetails.message}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Application Details */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Application Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Preferred Move-in Date
                      </p>
                      <p className="text-gray-900">
                        {formatDate(
                          bookingDetails.applicationDetails.preferredMoveInDate,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Reason for Stay
                      </p>
                      <p className="text-gray-900">
                        {bookingDetails.applicationDetails.reasonForStay}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Employment Status
                      </p>
                      <p className="text-gray-900">
                        {bookingDetails.applicationDetails.employmentStatus}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Monthly Income
                      </p>
                      <p className="text-gray-900">
                        {formatPrice(
                          bookingDetails.applicationDetails.monthlyIncome,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Previous Rental History
                      </p>
                      <p className="text-gray-900">
                        {
                          bookingDetails.applicationDetails
                            .previousRentalHistory
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Emergency Contact
                      </p>
                      <p className="text-gray-900">
                        {
                          bookingDetails.applicationDetails.emergencyContact
                            .name
                        }{" "}
                        (
                        {
                          bookingDetails.applicationDetails.emergencyContact
                            .relation
                        }
                        )
                      </p>
                      <p className="text-sm text-gray-600">
                        {
                          bookingDetails.applicationDetails.emergencyContact
                            .phone
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Section */}
            {(bookingDetails.status === "pending" ||
              bookingDetails.status === "waiting") && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-blue-600" />
                    Send Response to Tenant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Write your response to the tenant..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="min-h-[120px] border-gray-200 focus:border-blue-500"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      The tenant will receive your message via email
                    </p>
                    <Button
                      onClick={handleSendResponse}
                      disabled={!response.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Tenant & Landlord Info */}
          <div className="space-y-8">
            {/* Tenant Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Tenant Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={bookingDetails.tenant.avatar}
                      alt={bookingDetails.tenant.name}
                    />
                    <AvatarFallback>
                      {bookingDetails.tenant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {bookingDetails.tenant.name}
                    </h3>
                    <p className="text-gray-600">
                      {bookingDetails.tenant.age} years old
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(`mailto:${bookingDetails.tenant.email}`)
                        }
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(`tel:${bookingDetails.tenant.phone}`)
                        }
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500">
                      Occupation:
                    </span>
                    <span className="text-sm text-gray-900">
                      {bookingDetails.tenant.occupation}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500">
                      Education:
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 ml-6">
                    {bookingDetails.tenant.education}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    About
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {bookingDetails.tenant.bio}
                  </p>
                </div>

                {/* Social Profiles */}
                {(bookingDetails.tenant.socialProfiles.linkedin ||
                  bookingDetails.tenant.socialProfiles.facebook) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Social Profiles
                    </h4>
                    <div className="flex space-x-2">
                      {bookingDetails.tenant.socialProfiles.linkedin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              bookingDetails.tenant.socialProfiles.linkedin,
                            )
                          }
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          LinkedIn
                        </Button>
                      )}
                      {bookingDetails.tenant.socialProfiles.facebook && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              bookingDetails.tenant.socialProfiles.facebook,
                            )
                          }
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Facebook
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* References */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    References
                  </h4>
                  <div className="space-y-2">
                    {bookingDetails.tenant.references.map((ref, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">
                          {ref.name}
                        </p>
                        <p className="text-xs text-gray-600">{ref.relation}</p>
                        <div className="flex space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            {ref.phone}
                          </span>
                          <span className="text-xs text-gray-500">
                            {ref.email}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Submitted Documents
                  </h4>
                  <div className="space-y-2">
                    {bookingDetails.tenant.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-2"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {doc.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Uploaded {formatDate(doc.uploadDate)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Landlord Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Landlord Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={bookingDetails.landlord.avatar}
                      alt={bookingDetails.landlord.name}
                    />
                    <AvatarFallback>
                      {bookingDetails.landlord.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {bookingDetails.landlord.name}
                      </h3>
                      {bookingDetails.landlord.verified && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      {getRatingStars(bookingDetails.landlord.rating)}
                      <span className="text-sm text-gray-600 ml-2">
                        {bookingDetails.landlord.rating}/5.0
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-600">
                      {bookingDetails.landlord.responseRate}%
                    </p>
                    <p className="text-xs text-gray-600">Response Rate</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-600">
                      {bookingDetails.landlord.totalProperties}
                    </p>
                    <p className="text-xs text-gray-600">Properties</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Member since:</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(bookingDetails.landlord.joinedDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm text-gray-900">
                      {bookingDetails.landlord.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="text-sm text-gray-900">
                      {bookingDetails.landlord.phone}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {(bookingDetails.status === "pending" ||
              bookingDetails.status === "waiting") && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-center">Take Action</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleAccept}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Accept Application
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 py-3"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Reject Application
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Booking Timeline */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Booking Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">
                    Application Date:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(bookingDetails.dateApplication)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Check-in Date:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(bookingDetails.checkInDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Check-out Date:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(bookingDetails.checkOutDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {bookingDetails.duration} months
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
