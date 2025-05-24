"use client";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Check, X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
import {
  useProfileStore,
  useLoadProfile,
  useSaveProfile,
} from "@/store/profileStore";
import Cookies from "js-cookie";
import { z } from "zod";
import { useRouter } from "next/navigation";

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

export default function ProfilePage() {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [idDocumentPreview, setIdDocumentPreview] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idDocumentInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
    profile,
    editedProfile,
    isEditing,
    loading,
    error,
    startEditing,
    cancelEditing,
    updateField,
    hasChanges,
    setProfile,
  } = useProfileStore();

  const { loadProfile } = useLoadProfile();
  const { saveChanges } = useSaveProfile();

  useEffect(() => {
    const token = Cookies.get("jwt_token");
    console.log("JWT Token profile:", token);
    if (!token) {
      console.error("No JWT token found. Redirecting to login...");
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log("Fetching profile data...");
        const data = await loadProfile(getUserProfile);
        console.log("Profile fetched successfully:", data);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarPreview(profile.avatar_url);
    }
    if (profile?.id_document_url) {
      setIdDocumentPreview(profile.id_document_url);
    }
  }, [profile]);

  const handleBudgetChange = (type: "min" | "max", value: string) => {
    const numValue = value === "" ? undefined : Number(value);

    // Create the new budget object
    const newBudget = {
      ...editedProfile?.budget_range,
      [type]: numValue,
    };

    // Update the field without validation first
    updateField("budget_range", newBudget);

    // Check validation, but only show toast if there's an error
    try {
      // Only validate if both values are defined
      if (newBudget.min !== undefined && newBudget.max !== undefined) {
        budgetRangeSchema.parse(newBudget);
      }
    } catch (error) {
      // Show validation error
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message, {
          position: "top-right",
          autoClose: 3000,
        });
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

    // Проверяем тип файла (только PDF и DOCX)
    const fileType = file.type;
    if (
      fileType !== "application/pdf" &&
      fileType !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      toast.error("Please upload a PDF or DOCX file", {
        position: "top-right",
        autoClose: 3000,
      });
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not provided";

    const date = new Date(dateString);
    return date.toLocaleString("ru-KZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Almaty",
    });
  };

  const handleSaveChanges = async () => {
    if (!hasChanges()) {
      toast.info("No changes to save", {
        position: "top-right",
        autoClose: 3000,
      });
      cancelEditing();
      return;
    }

    setIsSaving(true);

    try {
      console.log("Saving profile changes...");
      const updatedData = await saveChanges(updateUserProfile);

      console.log("Profile updated with:", updatedData);

      toast.success("Profile updated successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      const refreshedProfile = await loadProfile(getUserProfile);
      console.log("Profile refreshed with latest data:", refreshedProfile);
    } catch (error) {
      console.error("Failed to update profile:", error);

      if (error instanceof ProfileNotFoundError) {
        toast.error("Profile not found. Please contact support.", {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        toast.error("Failed to update profile. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguagePreferencesChange = (value: string) => {
    // Разделяем строку по запятым и удаляем лишние пробелы
    const languages = value
      .split(".")
      .map((lang) => lang.trim())
      .filter(Boolean);
    // Явно указываем, что это массив строк
    updateField("language_preferences", languages as unknown as string[]);
  };

  if (loading && !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load profile data</p>
          <Button
            onClick={() => loadProfile(getUserProfile)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Initializing profile...</p>
        </div>
      </div>
    );
  }

  //  return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
  //       <ToastContainer
  //         position="top-right"
  //         autoClose={3000}
  //         hideProgressBar={false}
  //         newestOnTop={false}
  //         closeOnClick
  //         rtl={false}
  //         pauseOnFocusLoss
  //         draggable
  //         pauseOnHover
  //         theme="light"
  //         className="z-50"
  //       />

  //       {/* Loading Overlay */}
  //       {isSaving && (
  //         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
  //           <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm mx-4">
  //             <div className="relative">
  //               <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
  //               <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-blue-200 opacity-25"></div>
  //             </div>
  //             <p className="text-gray-700 font-medium text-lg">Saving changes...</p>
  //             <p className="text-gray-500 text-sm mt-1">Please wait</p>
  //           </div>
  //         </div>
  //       )}

  //       {/* Header */}
  //       <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
  //         <div className="container mx-auto px-6 py-4">
  //           <div className="flex items-center justify-between">
  //             <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
  //               Profile Settings
  //             </h1>
  //             <div className="flex items-center gap-3">
  //               {profile?.is_verified_landlord && (
  //                 <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium">
  //                   <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
  //                   Verified Landlord
  //                 </div>
  //               )}
  //               {profile?.document_verified && (
  //                 <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
  //                   <Check className="w-3 h-3" />
  //                   Document Verified
  //                 </div>
  //               )}
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       <div className="container mx-auto px-6 py-8">
  //         <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
  //           {/* Left Sidebar - Profile Card */}
  //           <div className="xl:col-span-1">
  //             <div className="sticky top-24">
  //               <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden">
  //                 {/* Profile Header with Gradient */}
  //                 <div className="relative h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
  //                   <div className="absolute inset-0 bg-black/10"></div>
  //                   <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
  //                     <div className="relative">
  //                       <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
  //                         <AvatarImage
  //                           src={isEditing ? (avatarPreview ?? "") : profile?.avatar_url}
  //                           alt={profile?.name || "User"}
  //                           className="object-cover"
  //                         />
  //                         <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
  //                           {profile?.name?.charAt(0)?.toUpperCase() || "U"}
  //                         </AvatarFallback>
  //                       </Avatar>
  //                       {isEditing && (
  //                         <Button
  //                           variant="outline"
  //                           size="sm"
  //                           className="absolute bottom-2 right-2 rounded-full w-10 h-10 p-0 bg-white border-2 border-blue-200 hover:bg-blue-50 shadow-lg transition-all duration-200 hover:scale-105"
  //                           onClick={handleAvatarUploadClick}
  //                         >
  //                           <Upload className="h-4 w-4 text-blue-600" />
  //                         </Button>
  //                       )}
  //                       <input
  //                         type="file"
  //                         ref={fileInputRef}
  //                         className="hidden"
  //                         accept="image/*"
  //                         onChange={handleFileChange}
  //                       />
  //                     </div>
  //                   </div>
  //                 </div>

  //                 {/* Profile Info */}
  //                 <div className="pt-20 pb-8 px-6">
  //                   <div className="text-center mb-6">
  //                     <h2 className="text-2xl font-bold text-gray-900 mb-1">
  //                       {profile?.name} {profile?.surname}
  //                     </h2>
  //                     <p className="text-gray-600 mb-1 flex items-center justify-center gap-2">
  //                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
  //                         <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
  //                         <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
  //                       </svg>
  //                       {profile?.email}
  //                     </p>
  //                     {profile?.phone && (
  //                       <p className="text-gray-600 flex items-center justify-center gap-2">
  //                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
  //                           <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
  //                         </svg>
  //                         {profile.phone}
  //                       </p>
  //                     )}
  //                   </div>

  //                   {!isEditing && (
  //                     <Button
  //                       className="w-full mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
  //                       onClick={handleAvatarUploadClick}
  //                       disabled={!isEditing}
  //                     >
  //                       <Upload className="w-4 h-4 mr-2" />
  //                       Upload New Picture
  //                     </Button>
  //                   )}

  //                   {/* Account Status */}
  //                   <div className="space-y-4">
  //                     <h3 className="font-semibold text-lg text-gray-800 border-b border-gray-200 pb-2 mb-4">
  //                       Account Status
  //                     </h3>

  //                     <div className="space-y-3">
  //                       <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl">
  //                         <span className="text-gray-700 font-medium">Created</span>
  //                         <span className="text-gray-900 font-semibold text-sm">
  //                           {formatDate(profile?.createdAt)}
  //                         </span>
  //                       </div>

  //                       <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl">
  //                         <span className="text-gray-700 font-medium">Last Login</span>
  //                         <span className="text-gray-900 font-semibold text-sm">
  //                           {formatDate(profile?.last_login)}
  //                         </span>
  //                       </div>

  //                       <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl">
  //                         <span className="text-gray-700 font-medium">User ID</span>
  //                         <span className="text-gray-900 font-mono text-xs bg-gray-200 px-2 py-1 rounded">
  //                           {profile?.userId?.slice(-8) || "N/A"}
  //                         </span>
  //                       </div>

  //                       <div className="grid grid-cols-2 gap-3">
  //                         <div className="text-center p-3 bg-gray-50/80 rounded-xl">
  //                           <div className={`text-sm font-medium ${profile?.admin ? 'text-emerald-600' : 'text-gray-500'}`}>
  //                             Admin
  //                           </div>
  //                           <div className={`text-xs ${profile?.admin ? 'text-emerald-700' : 'text-gray-400'}`}>
  //                             {profile?.admin ? "Yes" : "No"}
  //                           </div>
  //                         </div>

  //                         <div className="text-center p-3 bg-gray-50/80 rounded-xl">
  //                           <div className={`text-sm font-medium ${profile?.is_landlord ? 'text-blue-600' : 'text-gray-500'}`}>
  //                             Landlord
  //                           </div>
  //                           <div className={`text-xs ${profile?.is_landlord ? 'text-blue-700' : 'text-gray-400'}`}>
  //                             {profile?.is_landlord ? "Yes" : "No"}
  //                           </div>
  //                         </div>
  //                       </div>
  //                     </div>
  //                   </div>

  //                   {/* Action Buttons */}
  //                   <div className="mt-8 space-y-3">
  //                     <Button
  //                       variant="destructive"
  //                       className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
  //                     >
  //                       <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
  //                         <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  //                       </svg>
  //                       Delete Account
  //                     </Button>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>

  //           {/* Right Content Area */}
  //         <div className="xl:col-span-3">
  //           <div className="space-y-8">
  //             {/* Basic Information Card */}
  //             <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden">
  //               <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
  //                 <div className="flex justify-between items-center">
  //                   <div>
  //                     <h2 className="text-2xl font-bold text-white mb-1">Basic Information</h2>
  //                     <p className="text-blue-100">Personal details and contact information</p>
  //                   </div>
  //                   {!isEditing && (
  //                     <Button
  //                       onClick={startEditing}
  //                       className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm rounded-xl px-6 py-2.5 font-medium transition-all duration-200 hover:scale-105"
  //                     >
  //                       <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
  //                         <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.828-2.828z"/>
  //                       </svg>
  //                       Edit Profile
  //                     </Button>
  //                   )}
  //                 </div>
  //               </div>

  //               <div className="p-8">
  //                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  //                   {/* First Name */}
  //                   <div className="space-y-2">
  //                     <label className="block text-sm font-semibold text-gray-700 mb-2">
  //                       First Name
  //                     </label>
  //                     {isEditing ? (
  //                       <Input
  //                         value={editedProfile?.name || ""}
  //                         onChange={(e) => updateField("name", e.target.value)}
  //                         className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200"
  //                         placeholder="Enter your first name"
  //                       />
  //                     ) : (
  //                       <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl text-gray-900 font-medium border border-gray-200">
  //                         {profile?.name || "Not provided"}
  //                       </div>
  //                     )}
  //                   </div>

  //                   {/* Last Name */}
  //                   <div className="space-y-2">
  //                     <label className="block text-sm font-semibold text-gray-700 mb-2">
  //                       Last Name
  //                     </label>
  //                     {isEditing ? (
  //                       <Input
  //                         value={editedProfile?.surname || ""}
  //                         onChange={(e) => updateField("surname", e.target.value)}
  //                         className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200"
  //                         placeholder="Enter your last name"
  //                       />
  //                     ) : (
  //                       <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl text-gray-900 font-medium border border-gray-200">
  //                         {profile?.surname || "Not provided"}
  //                       </div>
  //                     )}
  //                   </div>

  //                   {/* Gender */}
  //                   <div className="space-y-2">
  //                     <label className="block text-sm font-semibold text-gray-700 mb-2">
  //                       Gender
  //                     </label>
  //                     {isEditing ? (
  //                       <Select
  //                         value={editedProfile?.gender || ""}
  //                         onValueChange={(value) => updateField("gender", value)}
  //                       >
  //                         <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl px-4 py-3 h-auto">
  //                           <SelectValue placeholder="Select gender" />
  //                         </SelectTrigger>
  //                         <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
  //                           <SelectItem value="male" className="rounded-lg">
  //                             <div className="flex items-center gap-2">
  //                               <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
  //                               Male
  //                             </div>
  //                           </SelectItem>
  //                           <SelectItem value="female" className="rounded-lg">
  //                             <div className="flex items-center gap-2">
  //                               <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
  //                               Female
  //                             </div>
  //                           </SelectItem>
  //                           <SelectItem value="other" className="rounded-lg">
  //                             <div className="flex items-center gap-2">
  //                               <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
  //                               Other
  //                             </div>
  //                           </SelectItem>
  //                         </SelectContent>
  //                       </Select>
  //                     ) : (
  //                       <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl text-gray-900 font-medium border border-gray-200 capitalize">
  //                         {profile?.gender ? (
  //                           <div className="flex items-center gap-2">
  //                             <div className={`w-2 h-2 rounded-full ${
  //                               profile.gender === 'male' ? 'bg-blue-500' :
  //                               profile.gender === 'female' ? 'bg-pink-500' : 'bg-purple-500'
  //                             }`}></div>
  //                             {profile.gender}
  //                           </div>
  //                         ) : "Not specified"}
  //                       </div>
  //                     )}
  //                   </div>

  //                   {/* Email */}
  //                   <div className="space-y-2">
  //                     <label className="block text-sm font-semibold text-gray-700 mb-2">
  //                       Email Address
  //                     </label>
  //                     {isEditing ? (
  //                       <Input
  //                         type="email"
  //                         value={editedProfile?.email || ""}
  //                         onChange={(e) => updateField("email", e.target.value)}
  //                         className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200"
  //                         placeholder="Enter your email"
  //                       />
  //                     ) : (
  //                       <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl text-gray-900 font-medium border border-gray-200">
  //                         {profile?.email || "Not provided"}
  //                       </div>
  //                     )}
  //                   </div>

  //                   {/* Phone */}
  //                   <div className="space-y-2">
  //                     <label className="block text-sm font-semibold text-gray-700 mb-2">
  //                       Phone Number
  //                     </label>
  //                     {isEditing ? (
  //                       <Input
  //                         type="tel"
  //                         value={editedProfile?.phone || ""}
  //                         onChange={(e) => updateField("phone", e.target.value)}
  //                         className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200"
  //                         placeholder="Enter your phone number"
  //                       />
  //                     ) : (
  //                       <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl text-gray-900 font-medium border border-gray-200">
  //                         {profile?.phone || "Not provided"}
  //                       </div>
  //                     )}
  //                   </div>

  //                   {/* Nationality */}
  //                   <div className="space-y-2">
  //                     <label className="block text-sm font-semibold text-gray-700 mb-2">
  //                       Nationality
  //                     </label>
  //                     {isEditing ? (
  //                       <Select
  //                         value={editedProfile?.nationality || ""}
  //                         onValueChange={(value) => updateField("nationality", value)}
  //                       >
  //                         <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl px-4 py-3 h-auto">
  //                           <SelectValue placeholder="Select nationality" />
  //                         </SelectTrigger>
  //                         <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
  //                           <SelectItem value="Kazakh" className="rounded-lg">🇰🇿 Kazakh</SelectItem>
  //                           <SelectItem value="Russian" className="rounded-lg">🇷🇺 Russian</SelectItem>
  //                           <SelectItem value="American" className="rounded-lg">🇺🇸 American</SelectItem>
  //                           <SelectItem value="Other" className="rounded-lg">🌍 Other</SelectItem>
  //                         </SelectContent>
  //                       </Select>
  //                     ) : (
  //                       <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl text-gray-900 font-medium border border-gray-200">
  //                         {profile?.nationality || "Not provided"}
  //                       </div>
  //                     )}
  //                   </div>

  //                   {/* City */}
  //                   <div className="space-y-2">
  //                     <label className="block text-sm font-semibold text-gray-700 mb-2">
  //                       City
  //                     </label>
  //                     {isEditing ? (
  //                       <Input
  //                         value={editedProfile?.city || ""}
  //                         onChange={(e) => updateField("city", e.target.value)}
  //                         className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200"
  //                         placeholder="Enter your city"
  //                       />
  //                     ) : (
  //                       <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl text-gray-900 font-medium border border-gray-200">
  //                         {profile?.city || "Not provided"}
  //                       </div>
  //                     )}
  //                   </div>

  //                   {/* Country */}
  //                   <div className="space-y-2">
  //                     <label className="block text-sm font-semibold text-gray-700 mb-2">
  //                       Country
  //                     </label>
  //                     {isEditing ? (
  //                       <Input
  //                         value={editedProfile?.country || ""}
  //                         onChange={(e) => updateField("country", e.target.value)}
  //                         className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200"
  //                         placeholder="Enter your country"
  //                       />
  //                     ) : (
  //                       <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl text-gray-900 font-medium border border-gray-200">
  //                         {profile?.country || "Not provided"}
  //                       </div>
  //                     )}
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>

  //             {/* Educational Information Card */}
  //             <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden">
  //               <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
  //                 <h2 className="text-2xl font-bold text-white mb-1">Educational Information</h2>
  //                 <p className="text-emerald-100">University and academic details</p>
  //               </div>

  //               <div className="p-8">
  //                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  //                   {/* University */}
  //                   <div className="space-y-2">
  //                     <label className="block text-sm font-semibold text-gray-700 mb-2">
  //                       University
  //                     </label>
  //                     {isEditing ? (
  //                       <Input
  //                         value={editedProfile?.university || ""}
  //                         onChange={(e) => updateField("university", e.target.value)}
  //                         className="border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200"
  //                         placeholder="Enter your university"
  //                       />
  //                     ) : (
  //                       <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl text-gray-900 font-medium border border-gray-200">
  //                         {profile?.university || "Not provided"}
  //                       </div>
  //                     )}
  //                   </div>

  //                   {/* Student ID */}
  //                   <div className="space-y-2">
  //                     <label className="block text-sm font-semibold text-gray-700 mb-2">
  //                       Student ID
  //                     </label>
  //                     {isEditing ? (
  //                       <Input
  //                         value={editedProfile?.studentId_number || ""}
  //                         onChange={(e) => updateField("studentId_number", e.target.value)}
  //                         className="border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200"
  //                         placeholder="Enter your student ID"
  //                       />
  //                     ) : (
  //                       <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl text-gray-900 font-medium border border-gray-200 font-mono">
  //                         {profile?.studentId_number || "Not provided"}
  //                       </div>
  //                     )}
  //                   </div>

  //                   {/* Group */}
  //                   <div className="space-y-2">
  //                     <label className="block text-sm font-semibold text-gray-700 mb-2">
  //                       Group
  //                     </label>
  //                     {isEditing ? (
  //                       <Input
  //                         value={editedProfile?.group || ""}
  //                         onChange={(e) => updateField("group", e.target.value)}
  //                         className="border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200"
  //                         placeholder="Enter your group"
  //                       />
  //                     ) : (
  //                       <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl text-gray-900 font-medium border border-gray-200">
  //                         {profile?.group || "Not provided"}
  //                       </div>
  //                     )}
  //                   </div>

  //                   {/* Date of Birth */}
  //                   <div className="space-y-2">
  //                     <label className="block text-sm font-semibold text-gray-700 mb-2">
  //                       Date of Birth
  //                     </label>
  //                     {isEditing ? (
  //                       <Input
  //                         type="date"
  //                         value={editedProfile?.birth_date?.split("T")[0] || ""}
  //                         onChange={(e) => updateField("birth_date", e.target.value)}
  //                         className="border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-gray-900 transition-all duration-200"
  //                       />
  //                     ) : (
  //                       <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl text-gray-900 font-medium border border-gray-200">
  //                         {profile?.birth_date
  //                           ? new Date(profile.birth_date).toLocaleDateString('en-US', {
  //                               year: 'numeric',
  //                               month: 'long',
  //                               day: 'numeric'
  //                             })
  //                           : "Not provided"}
  //                       </div>
  //                     )}
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>

  //             {/* Additional Details Card */}
  //             <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden">
  //               <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
  //                 <h2 className="text-2xl font-bold text-white mb-1">Additional Details</h2>
  //                 <p className="text-purple-100">Personal bio and preferences</p>
  //               </div>

  //               <div className="p-8 space-y-6">
  //                 {/* Bio */}
  //                 <div className="space-y-2">
  //                   <label className="block text-sm font-semibold text-gray-700 mb-2">
  //                     Bio
  //                   </label>
  //                   {isEditing ? (
  //                     <Textarea
  //                       value={editedProfile?.bio || ""}
  //                       onChange={(e) => updateField("bio", e.target.value)}
  //                       className="border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 transition-all duration-200 min-h-32 resize-none"
  //                       placeholder="Tell us about yourself..."
  //                     />
  //                   ) : (
  //                     <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-4 rounded-xl text-gray-900 border border-gray-200 min-h-32">
  //                       {profile?.bio || (
  //                         <span className="text-gray-500 italic">No information provided.</span>
  //                       )}
  //                     </div>
  //                   )}
  //                 </div>

  //                 {/* Roommate Preferences */}
  //                 <div className="space-y-2">
  //                   <label className="block text-sm font-semibold text-gray-700 mb-2">
  //                     Roommate Preferences
  //                   </label>
  //                   {isEditing ? (
  //                     <Textarea
  //                       value={editedProfile?.roommate_preferences || ""}
  //                       onChange={(e) => updateField("roommate_preferences", e.target.value)}
  //                       className="border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 transition-all duration-200 min-h-24 resize-none"
  //                       placeholder="Share your roommate preferences..."
  //                     />
  //                   ) : (
  //                     <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-4 rounded-xl text-gray-900 border border-gray-200 min-h-24">
  //                       {profile?.roommate_preferences || (
  //                         <span className="text-gray-500 italic">None specified</span>
  //                       )}
  //                     </div>
  //                   )}
  //                 </div>
  //               </div>
  //             </div>

  //             {/* Document Verification Card */}
  //             <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden">
  //               <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
  //                 <div className="flex items-center justify-between">
  //                   <div>
  //                     <h2 className="text-2xl font-bold text-white mb-1">Document Verification</h2>
  //                     <p className="text-orange-100">Upload your ID document for verification</p>
  //                   </div>
  //                   {profile?.document_verified && (
  //                     <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
  //                       <Check className="w-6 h-6 text-white" />
  //                     </div>
  //                   )}
  //                 </div>
  //               </div>

  //               <div className="p-8">
  //                 <div className="space-y-4">
  //                   <label className="block text-sm font-semibold text-gray-700 mb-4">
  //                     ID Document (PDF or DOCX only)
  //                   </label>

  //                   {/* Document Display */}
  //                   {(isEditing ? idDocumentPreview : profile?.id_document_url) ? (
  //                     <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border-2 border-gray-200 transition-all duration-200 hover:shadow-lg">
  //                       <div className="flex flex-col items-center text-center">
  //                         {(() => {
  //                           const url = isEditing ? idDocumentPreview || "" : profile?.id_document_url || "";
  //                           if (url.includes("data:application/pdf")) {
  //                             return (
  //                               <div className="flex flex-col items-center">
  //                                 <div className="bg-red-100 text-red-600 p-4 rounded-2xl mb-4 shadow-lg">
  //                                   <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
  //                                     <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  //                                   </svg>
  //                                 </div>
  //                                 <h4 className="font-semibold text-gray-900 mb-2">PDF Document</h4>
  //                                 <a
  //                                   href={url}
  //                                   download="document.pdf"
  //                                   target="_blank"
  //                                   rel="noopener noreferrer"
  //                                   className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105"
  //                                 >
  //                                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
  //                                     <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  //                                   </svg>
  //                                   Download PDF
  //                                 </a>
  //                               </div>
  //                             );
  //                           } else if (url.includes("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
  //                             return (
  //                               <div className="flex flex-col items-center">
  //                                 <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl mb-4 shadow-lg">
  //                                   <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
  //                                     <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  //                                   </svg>
  //                                 </div>
  //                                 <h4 className="font-semibold text-gray-900 mb-2">DOCX Document</h4>
  //                                 <a
  //                                   href={url}
  //                                   download="document.docx"
  //                                   className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105"
  //                                 >
  //                                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
  //                                     <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  //                                   </svg>
  //                                   Download DOCX
  //                                 </a>
  //                               </div>
  //                             );
  //                           } else if (url) {
  //                             return (
  //                               <div className="flex flex-col items-center">
  //                                 <div className="bg-gray-100 text-gray-600 p-4 rounded-2xl mb-4 shadow-lg">
  //                                   <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
  //                                     <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  //                                   </svg>
  //                                 </div>
  //                                 <h4 className="font-semibold text-gray-900 mb-2">Document Uploaded</h4>
  //                                 <p className="text-gray-600">Document successfully uploaded</p>
  //                               </div>
  //                             );
  //                           }
  //                         })()}
  //                       </div>
  //                     </div>
  //                   ) : (
  //                     <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border-2 border-dashed border-gray-300 text-center transition-all duration-200 hover:border-gray-400">
  //                       <div className="flex flex-col items-center">
  //                         <div className="bg-gray-200 text-gray-400 p-4 rounded-2xl mb-4">
  //                           <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
  //                             <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm5 2a1 1 0 10-2 0v6a1 1 0 102 0V6zm3 2a1 1 0 10-2 0v4a1 1 0 102 0V8z" clipRule="evenodd" />
  //                           </svg>
  //                         </div>
  //                         <h4 className="font-medium text-gray-700 mb-2">No Document Uploaded</h4>
  //                         <p className="text-gray-500 text-sm">Upload your ID document for verification</p>
  //                       </div>
  //                     </div>
  //                   )}

  //                   {/* Upload Button */}
  //                   {isEditing && (
  //                     <div className="pt-4">
  //                       <Button
  //                         onClick={handleIdDocumentUploadClick}
  //                         className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
  //                       >
  //                         <Upload className="w-5 h-5 mr-2" />
  //                         Upload ID Document (PDF or DOCX)
  //                       </Button>
  //                       <input
  //                         type="file"
  //                         ref={idDocumentInputRef}
  //                         className="hidden"
  //                         accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  //                         onChange={handleIdDocumentChange}
  //                       />
  //                     </div>
  //                   )}

  //                   {/* Verification Status */}
  //                   {profile?.document_verified && (
  //                     <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mt-4">
  //                       <div className="flex items-center gap-3">
  //                         <div className="bg-green-500 rounded-full p-1">
  //                           <Check className="w-4 h-4 text-white" />
  //                         </div>
  //                         <div>
  //                           <h4 className="font-semibold text-green-800">Document Verified</h4>
  //                           <p className="text-green-600 text-sm">Your document has been successfully verified</p>
  //                         </div>
  //                       </div>
  //                     </div>
  //                   )}
  //                 </div>
  //               </div>
  //             </div>

  //             {/* Housing Preferences Card */}
  //             <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden">
  //               <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
  //                 <h2 className="text-2xl font-bold text-white mb-1">Housing Preferences</h2>
  //                 <p className="text-teal-100">Budget range and language preferences</p>
  //               </div>

  //               <div className="p-8">
  //                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  //                   {/* Budget Range */}
  //                   <div className="space-y-4">
  //                     <label className="block text-sm font-semibold text-gray-700 mb-3">
  //                       Budget Range (KZT)
  //                     </label>
  //                     {isEditing ? (
  //                       <div className="space-y-4">
  //                         <div className="grid grid-cols-2 gap-4">
  //                           <div>
  //                             <label className="text-xs font-medium text-gray-600 mb-2 block">
  //                               Minimum Budget
  //                             </label>
  //                             <Input
  //                               type="number"
  //                               value={editedProfile?.budget_range?.min ?? ""}
  //                               onChange={(e) => handleBudgetChange("min", e.target.value)}
  //                               className="border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200"
  //                               placeholder="0"
  //                             />
  //                           </div>
  //                           <div>
  //                             <label className="text-xs font-medium text-gray-600 mb-2 block">
  //                               Maximum Budget
  //                             </label>
  //                             <Input
  //                               type="number"
  //                               value={editedProfile?.budget_range?.max ?? ""}
  //                               onChange={(e) => handleBudgetChange("max", e.target.value)}
  //                               className="border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200"
  //                               placeholder="0"
  //                             />
  //                           </div>
  //                         </div>
  //                       </div>
  //                     ) : (
  //                       <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4">
  //                         {profile?.budget_range ? (
  //                           <div className="space-y-3">
  //                             {profile.budget_range.min !== undefined && (
  //                               <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg shadow-sm">
  //                                 <span className="text-gray-600 font-medium">Minimum:</span>
  //                                 <span className="text-gray-900 font-bold text-lg">
  //                                   {profile.budget_range.min.toLocaleString()} ₸
  //                                 </span>
  //                               </div>
  //                             )}
  //                             {profile.budget_range.max !== undefined && (
  //                               <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg shadow-sm">
  //                                 <span className="text-gray-600 font-medium">Maximum:</span>
  //                                 <span className="text-gray-900 font-bold text-lg">
  //                                   {profile.budget_range.max.toLocaleString()} ₸
  //                                 </span>
  //                               </div>
  //                             )}
  //                             {profile.budget_range.min === undefined && profile.budget_range.max === undefined && (
  //                               <div className="text-center py-4">
  //                                 <span className="text-gray-500 italic">Budget range not specified</span>
  //                               </div>
  //                             )}
  //                           </div>
  //                         ) : (
  //                           <div className="text-center py-4">
  //                             <span className="text-gray-500 italic">Budget range not specified</span>
  //                           </div>
  //                         )}
  //                       </div>
  //                     )}
  //                   </div>

  //                   {/* Language Preferences */}
  //                   <div className="space-y-4">
  //                     <label className="block text-sm font-semibold text-gray-700 mb-3">
  //                       Language Preferences
  //                     </label>
  //                     {isEditing ? (
  //                       <Input
  //                         value={
  //                           Array.isArray(editedProfile?.language_preferences)
  //                             ? editedProfile.language_preferences.join(", ")
  //                             : typeof editedProfile?.language_preferences === "string"
  //                               ? editedProfile.language_preferences
  //                               : ""
  //                         }
  //                         onChange={(e) => handleLanguagePreferencesChange(e.target.value)}
  //                         className="border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200"
  //                         placeholder="e.g. English, Russian, Kazakh (separate with commas)"
  //                       />
  //                     ) : (
  //                       <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4">
  //                         {Array.isArray(profile?.language_preferences) && profile.language_preferences.length > 0 ? (
  //                           <div className="flex flex-wrap gap-2">
  //                             {profile.language_preferences.map((lang, index) => (
  //                               <span
  //                                 key={index}
  //                                 className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium"
  //                               >
  //                                 <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
  //                                 {lang}
  //                               </span>
  //                             ))}
  //                           </div>
  //                         ) : (
  //                           <div className="text-center py-2">
  //                             <span className="text-gray-500 italic">No language preferences specified</span>
  //                           </div>
  //                         )}
  //                       </div>
  //                     )}
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>

  //             {/* Social Links Card */}
  //             <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden">
  //               <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-6">
  //                 <h2 className="text-2xl font-bold text-white mb-1">Social Links</h2>
  //                 <p className="text-pink-100">Connect your social media accounts</p>
  //               </div>

  //               <div className="p-8">
  //                 {isEditing ? (
  //                   <div className="space-y-6">
  //                     {/* Instagram */}
  //                     <div className="space-y-2">
  //                       <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
  //                         <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg mr-3">
  //                           <svg
  //                             xmlns="http://www.w3.org/2000/svg"
  //                             width="16"
  //                             height="16"
  //                             fill="white"
  //                             viewBox="0 0 16 16"
  //                           >
  //                             <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
  //                           </svg>
  //                         </div>
  //                         Instagram
  //                       </label>
  //                       <Input
  //                         value={editedProfile?.social_links?.instagram || ""}
  //                         onChange={(e) =>
  //                           updateField("social_links", {
  //                             ...editedProfile?.social_links,
  //                             instagram: e.target.value,
  //                           })
  //                         }
  //                         className="border-2 border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200"
  //                         placeholder="@yourusername"
  //                       />
  //                     </div>

  //                     {/* Telegram */}
  //                     <div className="space-y-2">
  //                       <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
  //                         <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg mr-3">
  //                           <svg
  //                             xmlns="http://www.w3.org/2000/svg"
  //                             width="16"
  //                             height="16"
  //                             fill="white"
  //                             viewBox="0 0 16 16"
  //                           >
  //                             <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z" />
  //                           </svg>
  //                         </div>
  //                         Telegram
  //                       </label>
  //                       <Input
  //                         value={editedProfile?.social_links?.telegram || ""}
  //                         onChange={(e) =>
  //                           updateField("social_links", {
  //                             ...editedProfile?.social_links,
  //                             telegram: e.target.value,
  //                           })
  //                         }
  //                         className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200"
  //                         placeholder="@yourusername"
  //                       />
  //                     </div>

  //                     {/* WhatsApp */}
  //                     <div className="space-y-2">
  //                       <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
  //                         <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg mr-3">
  //                           <svg
  //                             xmlns="http://www.w3.org/2000/svg"
  //                             width="16"
  //                             height="16"
  //                             fill="white"
  //                             viewBox="0 0 16 16"
  //                           >
  //                             <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
  //                           </svg>
  //                         </div>
  //                         WhatsApp
  //                       </label>
  //                       <Input
  //                         value={editedProfile?.social_links?.whatsapp || ""}
  //                         onChange={(e) =>
  //                           updateField("social_links", {
  //                             ...editedProfile?.social_links,
  //                             whatsapp: e.target.value,
  //                           })
  //                         }
  //                         className="border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200"
  //                         placeholder="+7 XXX XXX XXXX"
  //                       />
  //                     </div>
  //                   </div>
  //                 ) : (
  //                   <div className="space-y-4">
  //                     {profile?.social_links ? (
  //                       <div className="grid gap-4">
  //                         {profile.social_links.instagram && (
  //                           <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 transition-all duration-200 hover:shadow-lg group">
  //                             <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-200">
  //                               <svg
  //                                 xmlns="http://www.w3.org/2000/svg"
  //                                 width="20"
  //                                 height="20"
  //                                 fill="white"
  //                                 viewBox="0 0 16 16"
  //                               >
  //                                 <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
  //                               </svg>
  //                             </div>
  //                             <div>
  //                               <h4 className="font-semibold text-gray-900">Instagram</h4>
  //                               <p className="text-purple-600 font-medium">{profile.social_links.instagram}</p>
  //                             </div>
  //                           </div>
  //                         )}

  //                         {profile.social_links.telegram && (
  //                           <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-100 transition-all duration-200 hover:shadow-lg group">
  //                             <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-200">
  //                               <svg
  //                                 xmlns="http://www.w3.org/2000/svg"
  //                                 width="20"
  //                                 height="20"
  //                                 fill="white"
  //                                 viewBox="0 0 16 16"
  //                               >
  //                                 <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z" />
  //                               </svg>
  //                             </div>
  //                             <div>
  //                               <h4 className="font-semibold text-gray-900">Telegram</h4>
  //                               <p className="text-blue-600 font-medium">{profile.social_links.telegram}</p>
  //                             </div>
  //                           </div>
  //                         )}

  //                         {profile.social_links.whatsapp && (
  //                           <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-100 transition-all duration-200 hover:shadow-lg group">
  //                             <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-200">
  //                               <svg
  //                                 xmlns="http://www.w3.org/2000/svg"
  //                                 width="20"
  //                                 height="20"
  //                                 fill="white"
  //                                 viewBox="0 0 16 16"
  //                               >
  //                                 <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
  //                               </svg>
  //                             </div>
  //                             <div>
  //                               <h4 className="font-semibold text-gray-900">WhatsApp</h4>
  //                               <p className="text-green-600 font-medium">{profile.social_links.whatsapp}</p>
  //                             </div>
  //                           </div>
  //                         )}

  //                         {!profile.social_links.instagram && !profile.social_links.telegram && !profile.social_links.whatsapp && (
  //                           <div className="text-center py-8 text-gray-500">
  //                             <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
  //                               <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
  //                                 <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v1.5h16V5a2 2 0 00-2-2H4zm2 6a2 2 0 114 0v1H6V9zm7.5 1.5h-15v6A2 2 0 004 18h12a2 2 0 002-2v-6zM7 15a1 1 0 102 0 1 1 0 00-2 0zm6 0a1 1 0 102 0 1 1 0 00-2 0z" clipRule="evenodd" />
  //                               </svg>
  //                             </div>
  //                             <span className="italic">No social links provided</span>
  //                           </div>
  //                         )}
  //                       </div>
  //                     ) : (
  //                       <div className="text-center py-8 text-gray-500">
  //                         <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
  //                           <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
  //                             <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v1.5h16V5a2 2 0 00-2-2H4zm2 6a2 2 0 114 0v1H6V9zm7.5 1.5h-15v6A2 2 0 004 18h12a2 2 0 002-2v-6zM7 15a1 1 0 102 0 1 1 0 00-2 0zm6 0a1 1 0 102 0 1 1 0 00-2 0z" clipRule="evenodd" />
  //                           </svg>
  //                         </div>
  //                         <span className="italic">No social links provided</span>
  //                       </div>
  //                     )}
  //                   </div>
  //                 )}
  //               </div>
  //             </div>

  //             {/* Landlord Information */}
  //             {(profile?.is_landlord || isEditing) && (
  //               <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden">
  //                 <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
  //                   <div className="flex items-center justify-between">
  //                     <div>
  //                       <h2 className="text-2xl font-bold text-white mb-1">Landlord Information</h2>
  //                       <p className="text-indigo-100">Property management and verification status</p>
  //                     </div>
  //                     <div className="flex items-center gap-3">
  //                       {profile?.is_landlord && !profile?.is_verified_landlord && (
  //                         <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-300/30 text-yellow-100 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
  //                           <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
  //                           Pending Verification
  //                         </div>
  //                       )}
  //                       {profile?.is_landlord && profile?.is_verified_landlord && (
  //                         <div className="bg-green-500/20 backdrop-blur-sm border border-green-300/30 text-green-100 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
  //                           <Check className="w-4 h-4" />
  //                           Verified Landlord
  //                         </div>
  //                       )}
  //                     </div>
  //                   </div>
  //                 </div>

  //                 <div className="p-8">
  //                   <div className="space-y-6">
  //                     {/* Landlord Registration Toggle */}
  //                     {isEditing && (
  //                       <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
  //                         <label className="flex items-center space-x-4 cursor-pointer">
  //                           <div className="relative">
  //                             <input
  //                               type="checkbox"
  //                               checked={editedProfile?.is_landlord || false}
  //                               onChange={(e) => updateField("is_landlord", e.target.checked)}
  //                               className="sr-only"
  //                             />
  //                             <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
  //                               editedProfile?.is_landlord
  //                                 ? 'bg-indigo-600'
  //                                 : 'bg-gray-300'
  //                             }`}>
  //                               <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200 transform ${
  //                                 editedProfile?.is_landlord
  //                                   ? 'translate-x-6'
  //                                   : 'translate-x-0.5'
  //                               } mt-0.5`}></div>
  //                             </div>
  //                           </div>
  //                           <div>
  //                             <span className="text-lg font-semibold text-gray-900">Register as a landlord</span>
  //                             <p className="text-gray-600 text-sm">Enable property listing and tenant management features</p>
  //                           </div>
  //                         </label>
  //                       </div>
  //                     )}

  //                     {/* Landlord Status Information */}
  //                     {(profile?.is_landlord || (isEditing && editedProfile?.is_landlord)) && (
  //                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //                         {/* Verification Status */}
  //                         <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
  //                           <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
  //                             <div className={`w-3 h-3 rounded-full ${
  //                               profile?.is_verified_landlord
  //                                 ? 'bg-green-500'
  //                                 : 'bg-yellow-500 animate-pulse'
  //                             }`}></div>
  //                             Verification Status
  //                           </h4>
  //                           <div className="space-y-2">
  //                             <div className="flex items-center justify-between">
  //                               <span className="text-gray-600">Account Type:</span>
  //                               <span className="font-medium text-gray-900">Landlord</span>
  //                             </div>
  //                             <div className="flex items-center justify-between">
  //                               <span className="text-gray-600">Verified:</span>
  //                               <span className={`font-medium ${
  //                                 profile?.is_verified_landlord
  //                                   ? 'text-green-600'
  //                                   : 'text-yellow-600'
  //                               }`}>
  //                                 {profile?.is_verified_landlord ? 'Yes' : 'Pending'}
  //                               </span>
  //                             </div>
  //                           </div>
  //                         </div>

  //                         {/* Document Status */}
  //                         <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
  //                           <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
  //                             <div className={`w-3 h-3 rounded-full ${
  //                               profile?.document_verified
  //                                 ? 'bg-green-500'
  //                                 : 'bg-red-500'
  //                             }`}></div>
  //                             Document Status
  //                           </h4>
  //                           <div className="space-y-2">
  //                             <div className="flex items-center justify-between">
  //                               <span className="text-gray-600">ID Document:</span>
  //                               <span className={`font-medium ${
  //                                 profile?.id_document_url
  //                                   ? 'text-blue-600'
  //                                   : 'text-gray-500'
  //                               }`}>
  //                                 {profile?.id_document_url ? 'Uploaded' : 'Missing'}
  //                               </span>
  //                             </div>
  //                             <div className="flex items-center justify-between">
  //                               <span className="text-gray-600">Verified:</span>
  //                               <span className={`font-medium ${
  //                                 profile?.document_verified
  //                                   ? 'text-green-600'
  //                                   : 'text-red-600'
  //                               }`}>
  //                                 {profile?.document_verified ? 'Yes' : 'No'}
  //                               </span>
  //                             </div>
  //                           </div>
  //                         </div>
  //                       </div>
  //                     )}

  //                     {/* Status Messages */}
  //                     {(profile?.is_landlord || (isEditing && editedProfile?.is_landlord)) && (
  //                       <div className="space-y-4">
  //                         {profile?.is_verified_landlord ? (
  //                           <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6 rounded-2xl">
  //                             <div className="flex items-start gap-4">
  //                               <div className="bg-green-500 rounded-full p-2 mt-1">
  //                                 <Check className="w-5 h-5 text-white" />
  //                               </div>
  //                               <div>
  //                                 <h4 className="font-semibold text-green-800 mb-2">Congratulations! You're a verified landlord</h4>
  //                                 <p className="text-green-700 mb-4">Your landlord account is verified and active. You can now:</p>
  //                                 <ul className="space-y-2 text-green-700">
  //                                   <li className="flex items-center gap-2">
  //                                     <Check className="w-4 h-4 text-green-600" />
  //                                     List and manage properties
  //                                   </li>
  //                                   <li className="flex items-center gap-2">
  //                                     <Check className="w-4 h-4 text-green-600" />
  //                                     Connect with potential tenants
  //                                   </li>
  //                                   <li className="flex items-center gap-2">
  //                                     <Check className="w-4 h-4 text-green-600" />
  //                                     Access landlord dashboard
  //                                   </li>
  //                                 </ul>
  //                               </div>
  //                             </div>
  //                           </div>
  //                         ) : (
  //                           <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 p-6 rounded-2xl">
  //                             <div className="flex items-start gap-4">
  //                               <div className="bg-yellow-500 rounded-full p-2 mt-1">
  //                                 <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
  //                                   <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  //                                 </svg>
  //                               </div>
  //                               <div>
  //                                 <h4 className="font-semibold text-yellow-800 mb-2">Verification in Progress</h4>
  //                                 <p className="text-yellow-700 mb-4">Your landlord account is pending verification. Our team is reviewing your information and documents.</p>
  //                                 <div className="space-y-2 text-yellow-700">
  //                                   <p className="text-sm">Next steps:</p>
  //                                   <ul className="space-y-1 ml-4 text-sm">
  //                                     <li>• Ensure all required documents are uploaded</li>
  //                                     <li>• Wait for our team to complete the verification process</li>
  //                                     <li>• You'll receive an email notification once verified</li>
  //                                   </ul>
  //                                 </div>
  //                               </div>
  //                             </div>
  //                           </div>
  //                         )}
  //                       </div>
  //                     )}
  //                   </div>
  //                 </div>
  //               </div>
  //             )}

  //             {/* Action Buttons */}
  //             {isEditing && (
  //               <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
  //                 <div className="flex flex-col sm:flex-row justify-end gap-4">
  //                   <Button
  //                     type="button"
  //                     variant="outline"
  //                     onClick={cancelEditing}
  //                     className="flex items-center justify-center border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
  //                     disabled={isSaving}
  //                   >
  //                     <X className="h-5 w-5 mr-2" />
  //                     Cancel Changes
  //                   </Button>
  //                   <Button
  //                     type="button"
  //                     onClick={handleSaveChanges}
  //                     className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
  //                     disabled={isSaving || !hasChanges()}
  //                   >
  //                     {isSaving ? (
  //                       <>
  //                         <Loader2 className="h-5 w-5 mr-2 animate-spin" />
  //                         Saving...
  //                       </>
  //                     ) : (
  //                       <>
  //                         <Check className="h-5 w-5 mr-2" />
  //                         Save Changes
  //                       </>
  //                     )}
  //                   </Button>
  //                 </div>
  //               </div>
  //             )}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
            <p className="text-gray-700">Saving changes...</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left column - Profile sidebar */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden shadow-md border-blue-100">
              <CardContent className="p-6 bg-white">
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <Avatar className="h-32 w-32 border-4 border-blue-100">
                      <AvatarImage
                        src={
                          isEditing
                            ? (avatarPreview ?? "")
                            : profile?.avatar_url
                        }
                        alt={profile?.name || "User"}
                      />
                      <AvatarFallback className="text-2xl bg-blue-50 text-blue-700">
                        {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-white border-blue-200 hover:bg-blue-50 shadow-sm"
                      onClick={handleAvatarUploadClick}
                      disabled={!isEditing}
                    >
                      <Upload className="h-4 w-4 text-blue-600" />
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>

                  <h2 className="text-xl font-semibold text-center text-gray-800">
                    {profile?.name} {profile?.surname}
                  </h2>
                  <p className="text-sm text-gray-500 text-center mb-2">
                    {profile?.email}
                  </p>
                  <p className="text-sm text-gray-500 text-center mb-6">
                    {profile?.phone || "No phone number"}
                  </p>

                  <Button
                    className="w-full mb-6 bg-blue-600 hover:bg-blue-700"
                    onClick={handleAvatarUploadClick}
                    disabled={!isEditing}
                  >
                    Upload new Picture
                  </Button>

                  <div className="w-full space-y-5">
                    <h3 className="font-medium text-base text-gray-700 border-b border-gray-200 pb-2">
                      Account Status
                    </h3>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700">Created At</span>
                      <span className="text-gray-700 font-medium">
                        {formatDate(profile?.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700">Updated At</span>
                      <span className="text-gray-700 font-medium">
                        {formatDate(profile?.updatedAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700">Last Login</span>
                      <span className="text-gray-700 font-medium">
                        {formatDate(profile?.last_login)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700">User ID</span>
                      <span className="text-gray-700 font-medium text-xs">
                        {profile?.userId || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700">Admin</span>
                      <span className="text-gray-700 font-medium">
                        {profile?.admin ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700">Landlord</span>
                      <span className="text-gray-700 font-medium">
                        {profile?.is_landlord ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700">Verified Landlord</span>
                      <span className="text-gray-700 font-medium">
                        {profile?.is_verified_landlord ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700">Document Verified</span>
                      <span className="text-gray-700 font-medium">
                        {profile?.document_verified ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    className="mt-8 w-full bg-red-600 hover:bg-red-700"
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Profile content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Basic Info */}
              <Card className="shadow-md border-blue-100">
                <div className="p-6 bg-white">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Basic Info
                    </h2>
                    {!isEditing && (
                      <Button
                        type="button"
                        onClick={startEditing}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Edit
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      {isEditing ? (
                        <Input
                          value={editedProfile?.name || ""}
                          onChange={(e) => updateField("name", e.target.value)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
                          {profile?.name || "Not provided"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      {isEditing ? (
                        <Input
                          value={editedProfile?.surname || ""}
                          onChange={(e) =>
                            updateField("surname", e.target.value)
                          }
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
                          {profile?.surname || "Not provided"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      {isEditing ? (
                        <Select
                          value={editedProfile?.gender || ""}
                          onValueChange={(value) =>
                            updateField("gender", value)
                          }
                        >
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800 capitalize">
                          {profile?.gender || "Not specified"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      {isEditing ? (
                        <Input
                          value={editedProfile?.email || ""}
                          onChange={(e) => updateField("email", e.target.value)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
                          {profile?.email || "Not provided"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <Input
                          value={editedProfile?.phone || ""}
                          onChange={(e) => updateField("phone", e.target.value)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
                          {profile?.phone || "Not provided"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nationality
                      </label>
                      {isEditing ? (
                        <Select
                          value={editedProfile?.nationality || ""}
                          onValueChange={(value) =>
                            updateField("nationality", value)
                          }
                        >
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select nationality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Kazakh">Kazakh</SelectItem>
                            <SelectItem value="Russian">Russian</SelectItem>
                            <SelectItem value="American">American</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
                          {profile?.nationality || "Not provided"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      {isEditing ? (
                        <Input
                          value={editedProfile?.city || ""}
                          onChange={(e) => updateField("city", e.target.value)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
                          {profile?.city || "Not provided"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      {isEditing ? (
                        <Input
                          value={editedProfile?.country || ""}
                          onChange={(e) =>
                            updateField("country", e.target.value)
                          }
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
                          {profile?.country || "Not provided"}
                        </div>
                      )}
                    </div>
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
                        University
                      </label>
                      {isEditing ? (
                        <Input
                          value={editedProfile?.university || ""}
                          onChange={(e) =>
                            updateField("university", e.target.value)
                          }
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
                          {profile?.university || "Not provided"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student ID
                      </label>
                      {isEditing ? (
                        <Input
                          value={editedProfile?.studentId_number || ""}
                          onChange={(e) =>
                            updateField("studentId_number", e.target.value)
                          }
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
                          {profile?.studentId_number || "Not provided"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Group
                      </label>
                      {isEditing ? (
                        <Input
                          value={editedProfile?.group || ""}
                          onChange={(e) => updateField("group", e.target.value)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
                          {profile?.group || "Not provided"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editedProfile?.birth_date?.split("T")[0] || ""}
                          onChange={(e) =>
                            updateField("birth_date", e.target.value)
                          }
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
                          {profile?.birth_date
                            ? new Date(profile.birth_date).toLocaleDateString()
                            : "Not provided"}
                        </div>
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
                        Bio
                      </label>
                      {isEditing ? (
                        <Textarea
                          value={editedProfile?.bio || ""}
                          onChange={(e) => updateField("bio", e.target.value)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-24"
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800 min-h-24">
                          {profile?.bio || "No information provided."}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Roommate Preferences
                      </label>
                      {isEditing ? (
                        <Textarea
                          value={editedProfile?.roommate_preferences || ""}
                          onChange={(e) =>
                            updateField("roommate_preferences", e.target.value)
                          }
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-16"
                          placeholder="Share your roommate preferences..."
                        />
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
                          {profile?.roommate_preferences || "None"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Document Verification */}
              <Card className="shadow-md border-blue-100">
                <div className="p-6 bg-white">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Document Verification
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Document (PDF or DOCX only)
                    </label>

                    <div className="flex flex-col space-y-4">
                      {(
                        isEditing ? idDocumentPreview : profile?.id_document_url
                      ) ? (
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                          <div className="flex flex-col items-center">
                            {(() => {
                              const url = isEditing
                                ? idDocumentPreview || ""
                                : profile?.id_document_url || "";
                              if (url.includes("data:application/pdf")) {
                                return (
                                  <div className="flex flex-col items-center">
                                    <div className="bg-rose-100 text-rose-700 p-3 rounded-full mb-2">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                    <a
                                      href={url}
                                      download="document.pdf"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline text-sm"
                                    >
                                      View or Download PDF Document
                                    </a>
                                  </div>
                                );
                              } else if (
                                url.includes(
                                  "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                )
                              ) {
                                return (
                                  <div className="flex flex-col items-center">
                                    <div className="bg-blue-100 text-blue-700 p-3 rounded-full mb-2">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                    <a
                                      href={url}
                                      download="document.docx"
                                      className="text-blue-600 hover:underline text-sm"
                                    >
                                      Download DOCX Document
                                    </a>
                                  </div>
                                );
                              } else if (url) {
                                return (
                                  <div className="flex flex-col items-center">
                                    <div className="bg-gray-100 text-gray-700 p-3 rounded-full mb-2">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
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
                              }
                            })()}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 px-3 py-6 rounded-md text-gray-500 text-center border border-gray-200">
                          No ID document uploaded
                        </div>
                      )}

                      {isEditing && (
                        <>
                          <Button
                            onClick={handleIdDocumentUploadClick}
                            className="bg-blue-600 hover:bg-blue-700 w-full"
                          >
                            Upload ID Document (PDF or DOCX)
                          </Button>
                          <input
                            type="file"
                            ref={idDocumentInputRef}
                            className="hidden"
                            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleIdDocumentChange}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="shadow-md border-blue-100">
                <div className="p-6 bg-white">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Housing Preferences
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Budget Range (KZT)
                      </label>
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">
                              Minimum
                            </label>
                            <Input
                              type="number"
                              value={editedProfile?.budget_range?.min ?? ""}
                              onChange={(e) =>
                                handleBudgetChange("min", e.target.value)
                              }
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Enter minimum budget"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">
                              Maximum
                            </label>
                            <Input
                              type="number"
                              value={editedProfile?.budget_range?.max ?? ""}
                              onChange={(e) =>
                                handleBudgetChange("max", e.target.value)
                              }
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Enter maximum budget"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 px-4 py-3 rounded-md text-gray-800">
                          {profile?.budget_range ? (
                            <div className="space-y-2">
                              {profile.budget_range.min !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Minimum:
                                  </span>
                                  <span className="font-medium">
                                    {profile.budget_range.min.toLocaleString()}{" "}
                                    KZT
                                  </span>
                                </div>
                              )}
                              {profile.budget_range.max !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Maximum:
                                  </span>
                                  <span className="font-medium">
                                    {profile.budget_range.max.toLocaleString()}{" "}
                                    KZT
                                  </span>
                                </div>
                              )}
                              {profile.budget_range.min === undefined &&
                                profile.budget_range.max === undefined && (
                                  <div>Not provided</div>
                                )}
                            </div>
                          ) : (
                            <div>Not provided</div>
                          )}
                        </div>
                      )}

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Language Preferences
                        </label>
                        {isEditing ? (
                          <Input
                            value={
                              Array.isArray(editedProfile?.language_preferences)
                                ? editedProfile.language_preferences.join(", ")
                                : typeof editedProfile?.language_preferences ===
                                    "string"
                                  ? editedProfile.language_preferences
                                  : ""
                            }
                            onChange={(e) =>
                              handleLanguagePreferencesChange(e.target.value)
                            }
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="e.g. English, Russian, Kazakh (separate with commas)"
                          />
                        ) : (
                          <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
                            {Array.isArray(profile?.language_preferences) &&
                            profile.language_preferences.length > 0 ? (
                              <ol className="list-decimal pl-5 space-y-1">
                                {profile.language_preferences.map(
                                  (lang, index) => (
                                    <li key={index}>{lang}</li>
                                  ),
                                )}
                              </ol>
                            ) : (
                              "Not provided"
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Social Links */}
              <Card className="shadow-md border-blue-100">
                <div className="p-6 bg-white">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Social Links
                  </h2>

                  <div className="space-y-6">
                    {isEditing ? (
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
                            value={editedProfile?.social_links?.instagram || ""}
                            onChange={(e) =>
                              updateField("social_links", {
                                ...editedProfile?.social_links,
                                instagram: e.target.value,
                              })
                            }
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Your Instagram username"
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
                            value={editedProfile?.social_links?.telegram || ""}
                            onChange={(e) =>
                              updateField("social_links", {
                                ...editedProfile?.social_links,
                                telegram: e.target.value,
                              })
                            }
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Your Telegram username"
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
                            value={editedProfile?.social_links?.whatsapp || ""}
                            onChange={(e) =>
                              updateField("social_links", {
                                ...editedProfile?.social_links,
                                whatsapp: e.target.value,
                              })
                            }
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Your WhatsApp number"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className=" px-1 py-3 rounded-md">
                        {profile?.social_links ? (
                          <div className="space-y-3">
                            {profile.social_links.instagram && (
                              <div className="flex items-center bg-gray-50 py-2 rounded-md">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  fill="currentColor"
                                  className="text-pink-500 mr-3 ml-2"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                                </svg>
                                <span className="text-gray-800 font-medium">
                                  {profile.social_links.instagram}
                                </span>
                              </div>
                            )}
                            {profile.social_links.telegram && (
                              <div className="flex items-center bg-gray-50 py-2 rounded-md">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  fill="currentColor"
                                  className="text-blue-500 mr-3 ml-2"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z" />
                                </svg>
                                <span className="text-gray-800 font-medium">
                                  {profile.social_links.telegram}
                                </span>
                              </div>
                            )}
                            {profile.social_links.whatsapp && (
                              <div className="flex items-center bg-gray-50 py-2 rounded-md">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  fill="currentColor"
                                  className="text-green-500 mr-3 ml-2"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916-.1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                                </svg>
                                <span className="text-gray-800 font-medium">
                                  {profile.social_links.whatsapp}
                                </span>
                              </div>
                            )}
                            {!profile.social_links.instagram &&
                              !profile.social_links.telegram &&
                              !profile.social_links.whatsapp && (
                                <div className="text-gray-500">
                                  No social links provided
                                </div>
                              )}
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            No social links provided
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Landlord Information */}
              {(profile?.is_landlord || isEditing) && (
                <Card className="shadow-md border-blue-100">
                  <div className="p-6 bg-white">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Landlord Information
                      </h2>
                      {profile?.is_landlord &&
                        !profile?.is_verified_landlord && (
                          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                            Pending Verification
                          </div>
                        )}
                      {profile?.is_landlord &&
                        profile?.is_verified_landlord && (
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            Verified Landlord
                          </div>
                        )}
                    </div>

                    <div className="space-y-4">
                      {isEditing && (
                        <div className="mb-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={editedProfile?.is_landlord || false}
                              onChange={(e) =>
                                updateField("is_landlord", e.target.checked)
                              }
                              className="rounded border-gray-300 text-blue-600"
                            />
                            <span className="text-gray-700">
                              Register as a landlord
                            </span>
                          </label>
                        </div>
                      )}

                      {(profile?.is_landlord ||
                        (isEditing && editedProfile?.is_landlord)) && (
                        <div className="bg-blue-50 p-4 rounded-md">
                          <p className="text-sm text-blue-800">
                            {profile?.is_verified_landlord
                              ? "Your landlord account is verified. You can now list properties."
                              : "Your landlord account is pending verification. Our team will review your information shortly."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Edit mode controls */}
              {isEditing && (
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEditing}
                    className="flex items-center border-gray-300 hover:bg-gray-50"
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveChanges}
                    className="flex items-center bg-blue-600 hover:bg-blue-700"
                    disabled={isSaving || !hasChanges()}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
