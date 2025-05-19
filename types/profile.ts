export interface Profile {
  user_id: string;
  name: string;
  surname: string;
  email: string;
  gender: string;
  birth_date?: string;
  phone?: string;
  nationality?: string;
  country?: string;
  city?: string;
  bio?: string;
  university?: string;
  student_id_number?: string;
  group?: string;
  roommate_preferences?: string;
  language_preferences?: string[];
  budget_range?: {
    min: number;
    max: number;
  };
  avatar_url?: string;
  id_document_url?: string;
  document_verified?: boolean;
  social_links?: {
    telegram?: string;
    [key: string]: string | undefined;
  };
  created_at?: string;
  last_login?: string;
}

export interface ProfileUpdateResponse {
  message: string;
}
