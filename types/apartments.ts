export interface Address {
  street: string;
  house_number: string;
  apartment_number: string;
  entrance: string;
  has_intercom: boolean;
  landmark: string;
}

export interface Apartment {
  apartmentId?: string;
  ownerId?: string;
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
  created_at?: string;
  updated_at?: string;
  is_active: boolean;
}

export interface ApartmentCreationParams
  extends Omit<Apartment, "created_at" | "updated_at"> {}

export interface ApiError {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}

export interface ApartmentSearchParams {
  min_price?: number;
  max_price?: number;
  location?: string;
  university?: string;
  room_type?: string;
  skip?: number;
  limit?: number;
}

export interface NearbySearchParams {
  latitude: number;
  longitude: number;
  radius_km?: number;
  skip?: number;
  limit?: number;
}

export interface AvailabilitySearchParams {
  check_in: string;
  check_out: string;
  skip?: number;
  limit?: number;
}

export interface PaginationParams {
  skip?: number;
  limit?: number;
}
