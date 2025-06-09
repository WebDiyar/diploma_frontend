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
  X,
  CheckCircle,
  Trash2,
  Plus,
  Badge,
  MessageCircle,
} from "lucide-react";
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
import { useRouter } from "next/navigation";
import { budgetRangeSchema } from "@/zod/profile_validation";
import { toast, ToastContainer } from "react-toastify";
import { z } from "zod";
import { useDeleteUser } from "@/hooks/users";

export default function ProfilePage() {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  } = useProfileStore();

  const { loadProfile } = useLoadProfile();
  const { saveChanges } = useSaveProfile();

  const deleteUser = useDeleteUser({
    onSuccess: () => {
      toast.success("Account deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      Cookies.remove("jwt_token");
      router.push("/login");
    },
    onError: (error) => {
      toast.error("Failed to delete account. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });

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

  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not provided";

    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
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
      console.log("🟡 Data being sent to backend:", editedProfile);

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

  const [newLanguageItem, setNewLanguageItem] = useState("");

  const handleAddLanguage = () => {
    if (!newLanguageItem.trim()) return;

    const currentLanguages = editedProfile?.language_preferences || [];
    if (currentLanguages.includes(newLanguageItem.trim())) {
      toast.error("This language is already in the list", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    updateField("language_preferences", [
      ...currentLanguages,
      newLanguageItem.trim(),
    ]);
    setNewLanguageItem("");
  };

  const handleRemoveLanguage = (index: number) => {
    const currentLanguages = editedProfile?.language_preferences || [];
    const newLanguages = [...currentLanguages];
    newLanguages.splice(index, 1);
    updateField("language_preferences", newLanguages);
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      if (profile?.userId) {
        deleteUser.mutate(profile.userId);
      }
    }
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
                    className="w-full mb-6 bg-[#a4faff] hover:bg-[#46b9c0] cursor-pointer text-[#111827]"
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
                  </div>

                  {/* <Button
                    variant="destructive"
                    className="mt-8 w-full bg-red-600 hover:bg-red-700"
                    onClick={handleDeleteAccount}
                    disabled={deleteUser.isPending}
                  >
                    {deleteUser.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </Button> */}
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
                        className="bg-[#a4faff] hover:bg-[#46b9c0] cursor-pointer text-[#111827]"
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
                          <SelectContent className="bg-white">
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
                          <SelectContent className="bg-white">
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
                        <Select
                          value={editedProfile?.university || ""}
                          onValueChange={(value) =>
                            updateField("university", value)
                          }
                        >
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                              Academy of Public Administration under the
                              President of Kazakhstan
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

              {/* Housing Preferences - Improved and Wider */}
              <Card className="shadow-md border-blue-100">
                <div className="p-8 bg-white">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                    Housing Preferences
                  </h2>

                  <div className="space-y-8">
                    {/* Budget Range Section */}
                    <div className=" p-6 rounded-xl border border-blue-100">
                      <label className="block text-lg font-semibold text-gray-800 mb-4">
                        Budget Range (KZT)
                      </label>
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 block">
                              Minimum Budget
                            </label>
                            <Input
                              type="number"
                              value={editedProfile?.budget_range?.min ?? ""}
                              onChange={(e) =>
                                handleBudgetChange("min", e.target.value)
                              }
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-lg py-3"
                              placeholder="Enter minimum budget"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 block">
                              Maximum Budget
                            </label>
                            <Input
                              type="number"
                              value={editedProfile?.budget_range?.max ?? ""}
                              onChange={(e) =>
                                handleBudgetChange("max", e.target.value)
                              }
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-lg py-3"
                              placeholder="Enter maximum budget"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white px-6 py-4 rounded-lg border border-gray-200">
                          {profile?.budget_range ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {profile.budget_range.min !== undefined && (
                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                  <span className="text-gray-600 font-medium">
                                    Minimum:
                                  </span>
                                  <span className="font-bold text-[14px] text-green-700 sm:text-[16px]">
                                    {profile.budget_range.min.toLocaleString()}{" "}
                                    KZT
                                  </span>
                                </div>
                              )}
                              {profile.budget_range.max !== undefined && (
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                  <span className="text-gray-600 font-medium">
                                    Maximum:
                                  </span>
                                  <span className="font-bold text-[14px] text-blue-700 sm:text-[16px] ">
                                    {profile.budget_range.max.toLocaleString()}{" "}
                                    KZT
                                  </span>
                                </div>
                              )}
                              {profile.budget_range.min === undefined &&
                                profile.budget_range.max === undefined && (
                                  <div className="col-span-2 text-center text-gray-500 py-4">
                                    Budget range not provided
                                  </div>
                                )}
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 py-4">
                              Budget range not provided
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Language Preferences Section */}
                    <div className=" p-6 rounded-xl border border-purple-100">
                      <div className="flex items-center justify-between mb-6">
                        <label className="block text-lg font-semibold text-gray-800">
                          Language Preferences
                        </label>
                        {isEditing && (
                          <Badge className=" border-purple-200 bg-purple-50">
                            Add your preferred languages
                          </Badge>
                        )}
                      </div>

                      {isEditing && (
                        <div className="flex gap-3 mb-6">
                          <Input
                            placeholder="Add language (e.g., English, Russian, Kazakh)"
                            value={newLanguageItem}
                            onChange={(e) => setNewLanguageItem(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleAddLanguage()
                            }
                            className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-lg py-3"
                          />
                          <Button
                            onClick={handleAddLanguage}
                            className="bg-purple-600 hover:bg-purple-700 px-6 py-3"
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>
                      )}

                      <div className="space-y-3">
                        {(
                          editedProfile?.language_preferences ||
                          profile?.language_preferences ||
                          []
                        ).map((language, index) => (
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
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveLanguage(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {!(
                        editedProfile?.language_preferences ||
                        profile?.language_preferences
                      )?.length && (
                        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-purple-200">
                          <MessageCircle className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">
                            No languages added yet
                          </p>
                          {isEditing && (
                            <p className="text-sm text-gray-400 mt-2">
                              Use the form above to add your preferred languages
                            </p>
                          )}
                        </div>
                      )}
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
                      <div className="px-1 py-3 rounded-md">
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
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  className="text-green-500 mr-2 ml-2"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
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
