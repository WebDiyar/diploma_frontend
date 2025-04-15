"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Cookies from "js-cookie";

export default function TokenSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.rawToken) {
      const existing = Cookies.get("jwt_token");
      if (existing !== session.rawToken) {
        Cookies.set("jwt_token", session.rawToken, {
          expires: 7,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
        console.log("✅ JWT Token synced from session");
      }
    }
  }, [session, status]);

  return null;
}
