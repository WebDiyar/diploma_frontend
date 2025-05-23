"use client";

import { api } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [jwtToken, setJwtToken] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = session?.rawToken;
    if (token) {
      console.log("JWT Token:", token);
      setJwtToken(token);
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Use your API client
        console.log("Fetching profile...", session);
        console.log("session", session);
        console.log("session?.user", session?.user);
        const response = await api.get("/api/v1/profile");
        console.log("response", response);
        setProfile(response.data);
        console.log("response", response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // Get token either from session or cookies
  }, [session]);

  return (
    <div className="flex flex-col items-center justify-center my-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Authentication Status
        </h1>

        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-lg font-semibold text-gray-700">
              Status: <span className="font-normal">{status}</span>
            </p>
          </div>

          {session?.user && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-lg font-semibold text-gray-700 mb-2">
                User Info:
              </p>
              <p>ID: {session.user.id}</p>
              <p>Name: {session.user.name}</p>
              <p>Email: {session.user.email}</p>
            </div>
          )}

          {/* {jwtToken && (
            <div className="p-4 rounded-lg">
              <p className="text-lg font-semibold text-gray-700 mb-2">
                JWT Token:
              </p>
              <div className="bg-gray-100 p-3 rounded overflow-auto max-h-32">
                <code className="text-sm break-all">{jwtToken}</code>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
