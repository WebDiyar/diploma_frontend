// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Check, X } from "lucide-react";
import { api } from "@/lib/axios";

type Profile = {
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  phone: string;
  nationality: string;
  currentAddress: string;
  avatar_url?: string;
  bookingMessage?: string;
  studyOrWork: string;
  studyingAt?: string;
  fundingSource?: string;
  bio: string;
  documents?: Array<{
    id: number;
    name: string;
    url: string;
  }>;
  notificationPreferences?: {
    sms?: boolean;
    email?: boolean;
    phone?: boolean;
  };
  [key: string]: any;
  dateOfBirth?: string;
  preferredLanguage?: string;
  emergencyContact?: string;
  roomPreferences?: string;
  arrivalDate?: string;
  profileStatus?: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const form = useForm<Profile>();
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/profile');
        const profileData = response.data.data || response.data;
        setProfile(profileData);
        form.reset(profileData);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [form]);
  
  // Update profile
  const onSubmit = async () => {
    setSubmitting(true);
    
    try {
      const formData = form.getValues();
      const response = await api.patch('/api/profile', formData);
      
      // Update local state with the response
      const updatedProfile = response.data.data || response.data;
      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      
      // Close edit mode
      setEditMode(false);
      
      toast.success("Profile updated successfully", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error("Failed to update profile", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const cancelEdit = () => {
    form.reset(profile || undefined);
    setEditMode(false);
  };
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left column - Profile sidebar */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden shadow-md border-blue-100">
              <CardContent className="p-6 bg-white">
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <Avatar className="h-32 w-32 border-4 border-blue-100">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.firstName || "User"} />
                      <AvatarFallback className="text-2xl bg-blue-50 text-blue-700">{profile?.firstName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-white border-blue-200 hover:bg-blue-50 shadow-sm"
                    >
                      <Upload className="h-4 w-4 text-blue-600" />
                    </Button>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-center text-gray-800">
                    {profile?.firstName} {profile?.lastName}
                  </h2>
                  <p className="text-sm text-gray-500 text-center mb-6">
                    {profile?.email}
                  </p>
                  
                  <Button className="w-full mb-6 bg-blue-600 hover:bg-blue-700">
                    Upload new Picture
                  </Button>
                  
                  <div className="w-full space-y-5">
                    <h3 className="font-medium text-base text-gray-700 border-b border-gray-200 pb-2">Notifications Centre</h3>
                    
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700">SMS</span>
                      <Switch 
                        checked={profile?.notificationPreferences?.sms} 
                        className="data-[state=checked]:bg-blue-600"
                        onCheckedChange={(checked) => {
                          setProfile(prev => prev ? {
                            ...prev,
                            notificationPreferences: {
                              ...prev.notificationPreferences,
                              sms: checked ?? false
                            }
                          } : null);
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700">Email</span>
                      <Switch 
                        checked={profile?.notificationPreferences?.email}
                        className="data-[state=checked]:bg-blue-600"
                        onCheckedChange={(checked) => {
                          setProfile(prev => prev ? {
                            ...prev,
                            notificationPreferences: {
                              ...prev.notificationPreferences,
                              email: checked ?? false
                            }
                          } : null);
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700">Phone</span>
                      <Switch 
                        checked={profile?.notificationPreferences?.phone}
                        className="data-[state=checked]:bg-blue-600"
                        onCheckedChange={(checked) => {
                          setProfile(prev => prev ? {
                            ...prev,
                            notificationPreferences: {
                              ...prev.notificationPreferences,
                              phone: checked ?? false
                            }
                          } : null);
                        }}
                      />
                    </div>
                  </div>
                  
                  <Button variant="destructive" className="mt-8 w-full bg-red-600 hover:bg-red-700">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Profile content */}
          <div className="lg:col-span-3">
            <form onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}>
              <div className="space-y-6">
                {/* Basic Info */}
                <Card className="shadow-md border-blue-100">
                  <div className="p-6 bg-white">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">Basic Info</h2>
                      {!editMode && (
                        <Button 
                          type="button"
                          onClick={() => setEditMode(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        {editMode ? (
                          <Input
                            {...form.register("firstName")}
                            defaultValue={profile?.firstName}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">{profile?.firstName}</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        {editMode ? (
                          <Input
                            {...form.register("lastName")}
                            defaultValue={profile?.lastName}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">{profile?.lastName}</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 ">Gender</label>
                        {editMode ? (
                          <Select defaultValue={profile?.gender} onValueChange={(value) => form.setValue("gender", value)}>
                            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent className="bg-red-400"> 
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800 capitalize">{profile?.gender}</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        {editMode ? (
                          <Input
                            {...form.register("email")}
                            defaultValue={profile?.email}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">{profile?.email}</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        {editMode ? (
                          <Input
                            {...form.register("phone")}
                            defaultValue={profile?.phone}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">{profile?.phone}</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                        {editMode ? (
                          <Select defaultValue={profile?.nationality} onValueChange={(value) => form.setValue("nationality", value)}>
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
                          <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">{profile?.nationality}</div>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
                        {editMode ? (
                          <Input
                            {...form.register("currentAddress")}
                            defaultValue={profile?.currentAddress}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">{profile?.currentAddress}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Booking Request Message */}
                <Card className="shadow-md border-blue-100">
                  <div className="p-6 bg-white">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Booking Request Message</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enter a description...</label>
                      {editMode ? (
                        <Textarea
                          {...form.register("bookingMessage")}
                          defaultValue={profile?.bookingMessage}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-32"
                          placeholder="Enter a description..."
                        />
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800 min-h-32">
                          {profile?.bookingMessage || "No description provided."}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
                
                {/* Additional Details & Documents */}
                <Card className="shadow-md border-blue-100">
                    
                  <div className="p-6 bg-white">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Additional Details & Documents</h2>
                    
                    <div className="space-y-6">
                        {/* New Fields */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
  {editMode ? (
    <Input
      type="date"
      {...form.register("dateOfBirth")}
      defaultValue={profile?.dateOfBirth}
      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
    />
  ) : (
    <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
      {profile?.dateOfBirth || "Not provided"}
    </div>
  )}
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
  {editMode ? (
    <Input
      {...form.register("preferredLanguage")}
      defaultValue={profile?.preferredLanguage}
      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
    />
  ) : (
    <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
      {profile?.preferredLanguage || "Not specified"}
    </div>
  )}
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
  {editMode ? (
    <Input
      {...form.register("emergencyContact")}
      defaultValue={profile?.emergencyContact}
      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
    />
  ) : (
    <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
      {profile?.emergencyContact || "Not specified"}
    </div>
  )}
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Room Preferences</label>
  {editMode ? (
    <Textarea
      {...form.register("roomPreferences")}
      defaultValue={profile?.roomPreferences}
      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-16"
    />
  ) : (
    <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
      {profile?.roomPreferences || "None"}
    </div>
  )}
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label>
  {editMode ? (
    <Input
      type="date"
      {...form.register("arrivalDate")}
      defaultValue={profile?.arrivalDate}
      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
    />
  ) : (
    <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
      {profile?.arrivalDate || "Not provided"}
    </div>
  )}
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Status</label>
  <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
    {profile?.profileStatus || "Incomplete"}
  </div>
</div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Do You Study or Work?</label>
                        {editMode ? (
                          <Select defaultValue={profile?.studyOrWork} onValueChange={(value) => form.setValue("studyOrWork", value)}>
                            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Study">Study</SelectItem>
                              <SelectItem value="Work">Work</SelectItem>
                              <SelectItem value="Both">Both</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800 capitalize">
                            {profile?.studyOrWork}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Where Are You Studying?</label>
                        {editMode ? (
                          <Input
                            {...form.register("studyingAt")}
                            defaultValue={profile?.studyingAt}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
                            {profile?.studyingAt || "Not specified"}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">How Will You Fund Your Stay?</label>
                        {editMode ? (
                          <Input
                            {...form.register("fundingSource")}
                            defaultValue={profile?.fundingSource}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
                            {profile?.fundingSource || "Not specified"}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tell Us About Yourself</label>
                        {editMode ? (
                          <Textarea
                            {...form.register("bio")}
                            defaultValue={profile?.bio}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Documents (Passport/ID Card)</label>
                        <div className="mt-2 space-y-3">
                          {profile?.documents && profile.documents.length > 0 ? (
                            profile.documents.map(doc => (
                              <div key={doc.id} className="flex items-center p-3 border rounded-md bg-gray-50">
                                <span className="flex-grow">{doc.name}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 hover:bg-blue-50"
                                  onClick={() => window.open(doc.url, '_blank')}
                                >
                                  View
                                </Button>
                              </div>
                            ))
                          ) : (
                            <>
                              <Button 
                                type="button"
                                variant="outline" 
                                className="w-full border-dashed border-gray-300 hover:bg-blue-50 hover:border-blue-300 py-6 flex items-center justify-center"
                              >
                                <Upload className="h-5 w-5 mr-2 text-blue-600" />
                                <span>Upload File</span>
                              </Button>
                              
                              <Button 
                                type="button"
                                variant="outline" 
                                className="w-full border-dashed border-gray-300 hover:bg-blue-50 hover:border-blue-300 py-6 flex items-center justify-center"
                              >
                                <Upload className="h-5 w-5 mr-2 text-blue-600" />
                                <span>Upload File</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Edit mode controls */}
                {editMode && (
                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={cancelEdit}
                      className="flex items-center border-gray-300 hover:bg-gray-50"
                      disabled={submitting}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex items-center bg-blue-600 hover:bg-blue-700"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}