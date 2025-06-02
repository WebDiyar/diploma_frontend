"use client";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Check, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getUserProfile,
  updateUserProfile,
  ProfileNotFoundError,
} from "@/lib/api_from_swagger/users";
import Cookies from "js-cookie";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";

// Zod schema for complete profile validation
const profileSchema = z.object({
  name: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  nationality: z.string().min(1, "Nationality is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  university: z.string().min(1, "University is required"),
  studentId_number: z.string().min(1, "Student ID is required"),
  group: z.string().min(1, "Group is required"),
  birth_date: z.string().min(1, "Date of birth is required"),
  bio: z.string().min(1, "Bio is required"),
  roommate_preferences: z.string().min(1, "Roommate preferences are required"),
  budget_range: z
    .object({
      min: z.number().min(0, "Minimum budget must be 0 or greater"),
      max: z.number().min(1, "Maximum budget must be greater than 0"),
    })
    .refine((data) => data.max >= data.min, {
      message: "Maximum budget must be greater than or equal to minimum budget",
      path: ["max"],
    }),
  language_preferences: z
    .array(z.string())
    .min(1, "At least one language preference is required"),
  social_links: z
    .object({
      instagram: z.string().optional(),
      telegram: z.string().optional(),
      whatsapp: z.string().optional(),
    })
    .refine(
      (data) => {
        return data.instagram || data.telegram || data.whatsapp;
      },
      {
        message: "At least one social link is required",
      },
    ),
  avatar_url: z.string().min(1, "Profile picture is required"),
  id_document_url: z.string().min(1, "ID document is required"),
  is_landlord: z.boolean(),
});

const budgetRangeSchema = z
  .object({
    min: z.number().nonnegative(),
    max: z
      .number()
      .nonnegative()
      .refine((val) => val > 0, {
        message: "Maximum value must be greater than 0",
      }),
  })
  .refine((data) => !data.min || !data.max || data.max >= data.min, {
    message: "Maximum value must be greater than minimum value",
    path: ["max"],
  });

export default function ProfileSetupPage() {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [idDocumentPreview, setIdDocumentPreview] = useState<string | null>(
    null,
  );
  const [formData, setFormData] = useState<any>({
    name: "",
    surname: "",
    gender: "",
    email: "",
    phone: "",
    nationality: "",
    city: "",
    country: "",
    university: "",
    studentId_number: "",
    group: "",
    birth_date: "",
    bio: "",
    roommate_preferences: "",
    budget_range: { min: undefined, max: undefined },
    language_preferences: [],
    social_links: {
      instagram: "",
      telegram: "",
      whatsapp: "",
    },
    avatar_url: "",
    id_document_url: "",
    is_landlord: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const idDocumentInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("jwt_token");

    if (!token) {
      console.error("No JWT token found. Redirecting to login...");
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log("Fetching existing profile data...");
        const data = await getUserProfile();
        console.log("Profile fetched successfully:", data);

        // Only pre-fill name and email (which will be disabled)
        if (data) {
          setFormData((prev: any) => ({
            ...prev,
            name: data.name || "",
            email: data.email || "",
          }));
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBudgetChange = (type: "min" | "max", value: string) => {
    const numValue = value === "" ? undefined : Number(value);

    const newBudget = {
      ...formData.budget_range,
      [type]: numValue,
    };

    updateField("budget_range", newBudget);

    try {
      if (newBudget.min !== undefined && newBudget.max !== undefined) {
        budgetRangeSchema.parse(newBudget);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatarPreview(base64String);
      updateField("avatar_url", base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleIdDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    if (
      fileType !== "application/pdf" &&
      fileType !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      toast.error("Please upload a PDF or DOCX file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setIdDocumentPreview(base64String);
      updateField("id_document_url", base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleIdDocumentUploadClick = () => {
    idDocumentInputRef.current?.click();
  };

  const handleLanguagePreferencesChange = (value: string) => {
    const languages = value
      .split(",")
      .map((lang) => lang.trim())
      .filter(Boolean);
    updateField("language_preferences", languages);
  };

  const validateAllFields = () => {
    try {
      // Prepare data for validation
      const dataToValidate = {
        ...formData,
        budget_range: {
          min: formData.budget_range.min || 0,
          max: formData.budget_range.max || 0,
        },
      };

      const isValidation: any = profileSchema.parse(dataToValidate);
      console.log("Validation resultsssss:", isValidation.isValid);

      return isValidation;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const missingFields = error.errors.map((err) => err.message);
        return { isValid: false, errors: missingFields };
      }
      return { isValid: false, errors: ["Validation failed"] };
    }
  };
  const handleSubmitProfile = async () => {
    // Validate all fields before submission
    console.log("Validating profile data...");
    const validation = validateAllFields();
    console.log("Validation result:", validation);

    if (validation.length === 1) {
      toast.success(`Successfully submitted profile!`);
    } else if (validation.errors && validation.isValid === false) {
      toast.error(`Please fill in all required fields`);
      return;
    }

    setIsSaving(true);

    try {
      console.log("Submitting profile data...");

      const dataToSend = { ...formData };
      console.log("Data to send:", dataToSend);

      const updatedData = await updateUserProfile(dataToSend);
      console.log("Profile submitted successfully:", updatedData);

      toast.success("Profile submitted successfully!");

      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (error) {
      console.error("Failed to submit profile:", error);

      if (error instanceof ProfileNotFoundError) {
        toast.error("Profile not found. Please contact support.");
      } else {
        toast.error("Failed to submit profile. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <ToastContainer />
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
            <p className="text-gray-700">Submitting profile...</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600">
              Fill in your information to get started
            </p>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="shadow-md border-blue-100">
              <div className="p-6 bg-white">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <Input
                      value={formData.name || ""}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your first name"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <Input
                      value={formData.surname || ""}
                      onChange={(e) => updateField("surname", e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <Select
                      value={formData.gender || ""}
                      onValueChange={(value) => updateField("gender", value)}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your email"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality *
                    </label>
                    <Select
                      value={formData.nationality || ""}
                      onValueChange={(value) =>
                        updateField("nationality", value)
                      }
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Kazakh">🇰🇿 Kazakh</SelectItem>
                        <SelectItem value="Russian">🇷🇺 Russian</SelectItem>
                        <SelectItem value="American">🇺🇸 American</SelectItem>
                        <SelectItem value="Other">🌍 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <Input
                      value={formData.city || ""}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <Input
                      value={formData.country || ""}
                      onChange={(e) => updateField("country", e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your country"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Profile Picture */}
            <Card className="shadow-md border-blue-100">
              <div className="p-6 bg-white">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Profile Picture *
                </h2>

                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <Avatar className="h-32 w-32 border-4 border-blue-100">
                      <AvatarImage
                        src={avatarPreview || ""}
                        alt="Profile picture"
                      />
                      <AvatarFallback className="text-2xl bg-blue-50 text-blue-700">
                        <User className="h-12 w-12" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-white border-blue-200 hover:bg-blue-50 shadow-sm"
                      onClick={handleAvatarUploadClick}
                    >
                      <Upload className="h-4 w-4 text-[#25cad3]" />
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>

                  <Button
                    className="bg-[#a4faff] hover:bg-[#a4faff] cursor-pointer text-[#232c2d]"
                    onClick={handleAvatarUploadClick}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Profile Picture
                  </Button>
                </div>
              </div>
            </Card>

            {/* Educational Information */}
            <Card className="shadow-md border-blue-100">
              <div className="p-6 bg-white">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Educational Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      University *
                    </label>
                    <Input
                      value={formData.university || ""}
                      onChange={(e) =>
                        updateField("university", e.target.value)
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your university"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID *
                    </label>
                    <Input
                      value={formData.studentId_number || ""}
                      onChange={(e) =>
                        updateField("studentId_number", e.target.value)
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your student ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group *
                    </label>
                    <Input
                      value={formData.group || ""}
                      onChange={(e) => updateField("group", e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your group"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <Input
                      type="date"
                      value={formData.birth_date || ""}
                      onChange={(e) =>
                        updateField("birth_date", e.target.value)
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Additional Details */}
            <Card className="shadow-md border-blue-100">
              <div className="p-6 bg-white">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Additional Details
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio *
                    </label>
                    <Textarea
                      value={formData.bio || ""}
                      onChange={(e) => updateField("bio", e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-24"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roommate Preferences *
                    </label>
                    <Textarea
                      value={formData.roommate_preferences || ""}
                      onChange={(e) =>
                        updateField("roommate_preferences", e.target.value)
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-16"
                      placeholder="Share your roommate preferences..."
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Document Verification */}
            <Card className="shadow-md border-blue-100">
              <div className="p-6 bg-white">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Document Verification *
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Document (PDF or DOCX only) *
                  </label>

                  <div className="flex flex-col space-y-4">
                    {idDocumentPreview ? (
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <div className="flex flex-col items-center">
                          {(() => {
                            if (
                              idDocumentPreview.includes("data:application/pdf")
                            ) {
                              return (
                                <div className="flex flex-col items-center">
                                  <div className="bg-rose-100 text-rose-700 p-3 rounded-full mb-2">
                                    <svg
                                      className="h-8 w-8"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                  <p className="text-sm text-gray-700">
                                    PDF Document Uploaded
                                  </p>
                                </div>
                              );
                            } else if (
                              idDocumentPreview.includes(
                                "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                              )
                            ) {
                              return (
                                <div className="flex flex-col items-center">
                                  <div className="bg-blue-100 text-blue-700 p-3 rounded-full mb-2">
                                    <svg
                                      className="h-8 w-8"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                  <p className="text-sm text-gray-700">
                                    DOCX Document Uploaded
                                  </p>
                                </div>
                              );
                            }
                            return (
                              <div className="flex flex-col items-center">
                                <div className="bg-gray-100 text-gray-700 p-3 rounded-full mb-2">
                                  <svg
                                    className="h-8 w-8"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-700">
                                  Document Uploaded
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 px-3 py-6 rounded-md text-gray-500 text-center border border-gray-200">
                        No ID document uploaded
                      </div>
                    )}

                    <Button
                      onClick={handleIdDocumentUploadClick}
                      className="bg-blue-600 hover:bg-blue-700 w-full"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload ID Document (PDF or DOCX)
                    </Button>
                    <input
                      type="file"
                      ref={idDocumentInputRef}
                      className="hidden"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleIdDocumentChange}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Housing Preferences */}
            <Card className="shadow-md border-blue-100">
              <div className="p-6 bg-white">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Housing Preferences
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget Range (KZT) *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Minimum Budget
                        </label>
                        <Input
                          type="number"
                          value={formData.budget_range?.min ?? ""}
                          onChange={(e) =>
                            handleBudgetChange("min", e.target.value)
                          }
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Maximum Budget
                        </label>
                        <Input
                          type="number"
                          value={formData.budget_range?.max ?? ""}
                          onChange={(e) =>
                            handleBudgetChange("max", e.target.value)
                          }
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language Preferences *
                    </label>
                    <Input
                      value={
                        Array.isArray(formData.language_preferences)
                          ? formData.language_preferences.join(", ")
                          : ""
                      }
                      onChange={(e) =>
                        handleLanguagePreferencesChange(e.target.value)
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g. English, Russian, Kazakh (separate with commas)"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Social Links */}
            <Card className="shadow-md border-blue-100">
              <div className="p-6 bg-white">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Social Links (At least one required) *
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="text-pink-500 mr-2"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                      </svg>
                      Instagram
                    </label>
                    <Input
                      value={formData.social_links?.instagram || ""}
                      onChange={(e) =>
                        updateField("social_links", {
                          ...formData.social_links,
                          instagram: e.target.value,
                        })
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="@yourusername"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="text-blue-500 mr-2"
                        viewBox="0 0 16 16"
                      >
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z" />
                      </svg>
                      Telegram
                    </label>
                    <Input
                      value={formData.social_links?.telegram || ""}
                      onChange={(e) =>
                        updateField("social_links", {
                          ...formData.social_links,
                          telegram: e.target.value,
                        })
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="@yourusername"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="text-green-500 mr-2"
                        viewBox="0 0 16 16"
                      >
                        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                      </svg>
                      WhatsApp
                    </label>
                    <Input
                      value={formData.social_links?.whatsapp || ""}
                      onChange={(e) =>
                        updateField("social_links", {
                          ...formData.social_links,
                          whatsapp: e.target.value,
                        })
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="+7 XXX XXX XXXX"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Landlord Registration */}
            <Card className="shadow-md border-blue-100">
              <div className="p-6 bg-white">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Landlord Registration (Optional)
                </h2>

                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_landlord || false}
                      onChange={(e) =>
                        updateField("is_landlord", e.target.checked)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-lg font-medium text-gray-900">
                        Register as a landlord
                      </span>
                      <p className="text-gray-600 text-sm">
                        Enable property listing and tenant management features
                      </p>
                    </div>
                  </label>
                </div>

                {formData.is_landlord && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Your landlord account will be
                      pending verification after submission. Our team will
                      review your information and documents before activation.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center py-8">
              <Button
                onClick={handleSubmitProfile}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Submitting Profile...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Complete Profile Setup
                  </>
                )}
              </Button>
            </div>

            {/* Required Fields Note */}
            <div className="text-center text-sm text-gray-500 pb-8">
              <p>* All marked fields are required to complete profile setup</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
