export interface User {
  userId: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  admin: boolean;
  gender: string;
  birth_date: string;
  phone: string;
  nationality: string;
  country: string;
  city: string;
  bio: string;
  university: string;
  studentId_number: string;
  group: string;
  roommate_preferences: string;
  language_preferences: string[];
  budget_range: {
    [key: string]: number | undefined;
  };
  avatar_url: string;
  id_document_url: string;
  document_verified: boolean;
  social_links: {
    [key: string]: string;
  };
  is_landlord: boolean;
  is_verified_landlord: boolean;
  createdAt: string;
  updatedAt: string;
  last_login: string;
}

export interface ApiError {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}
