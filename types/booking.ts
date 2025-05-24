export interface BookingRequest {
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

export interface BookingRequestDetails extends BookingRequest {
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

export const fakeBookingRequests: BookingRequest[] = [
  {
    id: "1",
    room: "Room 1",
    apartment: "Almaty Heights Residence",
    apartmentId: "apt_001",
    price: 180000,
    tenant: {
      name: "Aigerim Nazarbayeva",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612345b?w=32&h=32&fit=crop&crop=face",
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
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
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
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
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
      "Graduate student at Kazakh National University looking for accommodation.",
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
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
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
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face",
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
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face",
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
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=32&h=32&fit=crop&crop=face",
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
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face",
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
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
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
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
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

// utils/formatters.ts
export const formatPrice = (price: number): string => {
  // Fix hydration issue by using consistent formatting
  return price.toLocaleString("en-US") + " KZT";
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// Function to get booking request by ID
export const getBookingRequestById = (
  id: string,
): BookingRequest | undefined => {
  return fakeBookingRequests.find((request) => request.id === id);
};

// Mock function to get detailed booking request (this would normally be an API call)
export const getDetailedBookingRequest = (
  id: string,
): BookingRequestDetails | undefined => {
  const baseRequest = getBookingRequestById(id);
  if (!baseRequest) return undefined;

  // Mock additional details - in real app this would come from API
  const mockDetails: BookingRequestDetails = {
    ...baseRequest,
    tenant: {
      ...baseRequest.tenant,
      age: 24,
      occupation: "Graduate Student",
      education: "Master's in Computer Science at Kazakh National University",
      bio: "I'm a dedicated graduate student pursuing my Master's degree in Computer Science. I'm passionate about AI and machine learning research. I value clean, quiet living spaces and respect shared accommodations.",
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
          email: "nurlan.tokayev@gmail.com",
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
      description:
        "Beautiful furnished room in a modern apartment complex. Located in the heart of Almaty with easy access to universities, shopping centers, and public transport.",
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
        name: "Nurlan Tokayev",
        phone: "+7 (702) 345-6789",
        relation: "Father",
      },
    },
  };

  return mockDetails;
};
