"use client";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Upload,
  Check,
  User,
  Plus,
  X,
  Trash2,
  CheckCircle,
  MessageCircle,
  Badge,
} from "lucide-react";
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
import "react-toastify/dist/ReactToastify.css";

// Zod schema for profile validation
const profileSchema = z.object({
  surname: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
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
  is_landlord: z.boolean(),
});

export default function AddProfilePage() {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [newLanguageItem, setNewLanguageItem] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    is_landlord: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Prevent going back
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      history.pushState(null, "", window.location.href);
    };

    history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

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

        // Pre-fill name and email from existing profile
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

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBudgetChange = (type: "min" | "max", value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    const newBudget = {
      ...formData.budget_range,
      [type]: numValue,
    };
    updateField("budget_range", newBudget);
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

  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddLanguage = () => {
    if (!newLanguageItem.trim()) return;

    const currentLanguages = formData.language_preferences || [];
    if (currentLanguages.includes(newLanguageItem.trim())) {
      toast.error("This language is already in the list");
      return;
    }

    updateField("language_preferences", [
      ...currentLanguages,
      newLanguageItem.trim(),
    ]);
    setNewLanguageItem("");
  };

  const handleRemoveLanguage = (index: number) => {
    const currentLanguages = formData.language_preferences || [];
    const newLanguages = [...currentLanguages];
    newLanguages.splice(index, 1);
    updateField("language_preferences", newLanguages);
  };

  const validateForm = () => {
    try {
      // Prepare data for validation
      const dataToValidate = {
        ...formData,
        budget_range: {
          min: formData.budget_range.min || 0,
          max: formData.budget_range.max || 0,
        },
      };

      profileSchema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          newErrors[path] = err.message;
        });
        setErrors(newErrors);

        // Show first error in toast
        toast.error(error.errors[0].message);
        return false;
      }
      return false;
    }
  };

  const handleSubmitProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      console.log("Submitting profile data...");

      const dataToSend = { ...formData };
      console.log("Data to send:", dataToSend);

      const updatedData = await updateUserProfile(dataToSend);
      console.log("Profile submitted successfully:", updatedData);

      toast.success("Profile completed successfully!", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        // Replace current history entry instead of pushing new one
        window.history.replaceState(null, "", "/profile");
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

  const getFieldError = (fieldName: string) => {
    return errors[fieldName];
  };

  const isFieldError = (fieldName: string) => {
    return !!errors[fieldName];
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <ToastContainer />

      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
            <p className="text-gray-700">Completing your profile...</p>
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
                      First Name (from account)
                    </label>
                    <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800 border">
                      {formData.name || "Not provided"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <Input
                      value={formData.surname || ""}
                      onChange={(e) => updateField("surname", e.target.value)}
                      className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                        isFieldError("surname")
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      placeholder="Enter your last name"
                    />
                    {getFieldError("surname") && (
                      <p className="text-red-500 text-sm mt-1">
                        {getFieldError("surname")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <Select
                      value={formData.gender || ""}
                      onValueChange={(value) => updateField("gender", value)}
                    >
                      <SelectTrigger
                        className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                          isFieldError("gender") ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {getFieldError("gender") && (
                      <p className="text-red-500 text-sm mt-1">
                        {getFieldError("gender")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address (from account)
                    </label>
                    <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800 border">
                      {formData.email || "Not provided"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                        isFieldError("phone")
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {getFieldError("phone") && (
                      <p className="text-red-500 text-sm mt-1">
                        {getFieldError("phone")}
                      </p>
                    )}
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
                      <SelectTrigger
                        className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                          isFieldError("nationality") ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Kazakh">🇰🇿 Kazakh</SelectItem>
                        <SelectItem value="Russian">🇷🇺 Russian</SelectItem>
                        <SelectItem value="American">🇺🇸 American</SelectItem>
                        <SelectItem value="Other">🌍 Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {getFieldError("nationality") && (
                      <p className="text-red-500 text-sm mt-1">
                        {getFieldError("nationality")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <Input
                      value={formData.city || ""}
                      onChange={(e) => updateField("city", e.target.value)}
                      className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                        isFieldError("city")
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      placeholder="Enter your city"
                    />
                    {getFieldError("city") && (
                      <p className="text-red-500 text-sm mt-1">
                        {getFieldError("city")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <Input
                      value={formData.country || ""}
                      onChange={(e) => updateField("country", e.target.value)}
                      className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                        isFieldError("country")
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      placeholder="Enter your country"
                    />
                    {getFieldError("country") && (
                      <p className="text-red-500 text-sm mt-1">
                        {getFieldError("country")}
                      </p>
                    )}
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
                    <Avatar
                      className={`h-32 w-32 border-4 ${
                        isFieldError("avatar_url")
                          ? "border-red-200"
                          : "border-blue-100"
                      }`}
                    >
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

                  {getFieldError("avatar_url") && (
                    <p className="text-red-500 text-sm mt-2">
                      {getFieldError("avatar_url")}
                    </p>
                  )}
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
                    <Select
                      value={formData.university || ""}
                      onValueChange={(value) =>
                        updateField("university", value)
                      }
                    >
                      <SelectTrigger
                        className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                          isFieldError("university") ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select university" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Astana IT University">
                          Astana IT University (AITU)
                        </SelectItem>
                        <SelectItem value="Nazarbayev University">
                          Nazarbayev University
                        </SelectItem>
                        <SelectItem value="L.N. Gumilyov Eurasian National University">
                          L.N. Gumilyov Eurasian National University
                        </SelectItem>
                        <SelectItem value="S. Seifullin Kazakh Agro Technical University">
                          S. Seifullin Kazakh Agro Technical University
                        </SelectItem>
                        <SelectItem value="Astana Medical University">
                          Astana Medical University
                        </SelectItem>
                        <SelectItem value="Kazakh University of Economics, Finance and International Trade">
                          Kazakh University of Economics, Finance and
                          International Trade
                        </SelectItem>
                        <SelectItem value="Maqsut Narikbayev University">
                          Maqsut Narikbayev University (KAZGUU)
                        </SelectItem>
                        <SelectItem value="Eurasian Humanities Institute">
                          Eurasian Humanities Institute
                        </SelectItem>
                        <SelectItem value="Academy of Public Administration under the President of Kazakhstan">
                          Academy of Public Administration under the President
                          of Kazakhstan
                        </SelectItem>
                        <SelectItem value="Kazakh University of Technology and Business">
                          Kazakh University of Technology and Business
                        </SelectItem>
                        <SelectItem value="Turan-Astana University">
                          Turan-Astana University
                        </SelectItem>
                        <SelectItem value="Astana University">
                          Astana University
                        </SelectItem>
                        <SelectItem value="Kazakh National University of Arts">
                          Kazakh National University of Arts
                        </SelectItem>
                        <SelectItem value="Esil University">
                          Esil University
                        </SelectItem>
                        <SelectItem value="Astana International University">
                          Astana International University (AIU)
                        </SelectItem>
                        <SelectItem value="Moscow State University Branch in Kazakhstan">
                          Moscow State University Branch in Kazakhstan
                        </SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {getFieldError("university") && (
                      <p className="text-red-500 text-sm mt-1">
                        {getFieldError("university")}
                      </p>
                    )}
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
                      className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                        isFieldError("studentId_number")
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      placeholder="Enter your student ID"
                    />
                    {getFieldError("studentId_number") && (
                      <p className="text-red-500 text-sm mt-1">
                        {getFieldError("studentId_number")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group *
                    </label>
                    <Input
                      value={formData.group || ""}
                      onChange={(e) => updateField("group", e.target.value)}
                      className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                        isFieldError("group")
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      placeholder="Enter your group"
                    />
                    {getFieldError("group") && (
                      <p className="text-red-500 text-sm mt-1">
                        {getFieldError("group")}
                      </p>
                    )}
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
                      className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                        isFieldError("birth_date")
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                    />
                    {getFieldError("birth_date") && (
                      <p className="text-red-500 text-sm mt-1">
                        {getFieldError("birth_date")}
                      </p>
                    )}
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
                      className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-24 ${
                        isFieldError("bio")
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      placeholder="Tell us about yourself..."
                    />
                    {getFieldError("bio") && (
                      <p className="text-red-500 text-sm mt-1">
                        {getFieldError("bio")}
                      </p>
                    )}
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
                      className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-16 ${
                        isFieldError("roommate_preferences")
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      placeholder="Share your roommate preferences..."
                    />
                    {getFieldError("roommate_preferences") && (
                      <p className="text-red-500 text-sm mt-1">
                        {getFieldError("roommate_preferences")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Housing Preferences */}
            <Card className="shadow-md border-blue-100">
              <div className="p-8 bg-white">
                <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                  Housing Preferences
                </h2>

                <div className="space-y-8">
                  {/* Budget Range Section */}
                  <div className="p-6 rounded-xl border border-blue-100">
                    <label className="block text-lg font-semibold text-gray-800 mb-4">
                      Budget Range (KZT) *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 block">
                          Minimum Budget
                        </label>
                        <Input
                          type="number"
                          value={formData.budget_range?.min ?? ""}
                          onChange={(e) =>
                            handleBudgetChange("min", e.target.value)
                          }
                          className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-lg py-3 ${
                            isFieldError("budget_range.min")
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }`}
                          placeholder="Enter minimum budget"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 block">
                          Maximum Budget
                        </label>
                        <Input
                          type="number"
                          value={formData.budget_range?.max ?? ""}
                          onChange={(e) =>
                            handleBudgetChange("max", e.target.value)
                          }
                          className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-lg py-3 ${
                            isFieldError("budget_range.max")
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }`}
                          placeholder="Enter maximum budget"
                        />
                      </div>
                    </div>
                    {(getFieldError("budget_range") ||
                      getFieldError("budget_range.max")) && (
                      <p className="text-red-500 text-sm mt-2">
                        {getFieldError("budget_range") ||
                          getFieldError("budget_range.max")}
                      </p>
                    )}
                  </div>

                  {/* Language Preferences Section */}
                  <div className="p-6 rounded-xl border border-purple-100">
                    <div className="flex items-center justify-between mb-6">
                      <label className="block text-lg font-semibold text-gray-800">
                        Language Preferences *
                      </label>
                      <Badge className="border-purple-200 bg-purple-50">
                        Add your preferred languages
                      </Badge>
                    </div>

                    <div className="flex gap-3 mb-6">
                      <Input
                        placeholder="Add language (e.g., English, Russian, Kazakh)"
                        value={newLanguageItem}
                        onChange={(e) => setNewLanguageItem(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddLanguage()
                        }
                        className={`border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-lg py-3 ${
                          isFieldError("language_preferences")
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }`}
                      />
                      <Button
                        onClick={handleAddLanguage}
                        className="bg-purple-600 hover:bg-purple-700 px-6 py-3"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {formData.language_preferences.map(
                        (language: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-white p-4 rounded-xl border border-purple-100 shadow-sm"
                          >
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-purple-500 mr-3" />
                              <span className="font-semibold text-gray-800 text-lg">
                                {language}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveLanguage(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ),
                      )}
                    </div>

                    {!formData.language_preferences?.length && (
                      <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-purple-200">
                        <MessageCircle className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                          No languages added yet
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Use the form above to add your preferred languages
                        </p>
                      </div>
                    )}

                    {getFieldError("language_preferences") && (
                      <p className="text-red-500 text-sm mt-2">
                        {getFieldError("language_preferences")}
                      </p>
                    )}
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
                      className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                        isFieldError("social_links")
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
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
                      className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                        isFieldError("social_links")
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
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
                      className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                        isFieldError("social_links")
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      placeholder="+7 XXX XXX XXXX"
                    />
                  </div>
                </div>

                {getFieldError("social_links") && (
                  <p className="text-red-500 text-sm mt-2">
                    {getFieldError("social_links")}
                  </p>
                )}
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
                    Completing Profile...
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
