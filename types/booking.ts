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
