"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

export default function LogoutButton() {
  const handleLogOut = async () => {
    Cookies.remove("jwt_token");
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <Button
      onClick={handleLogOut}
      className="text-white bg-red-600 hover:bg-red-700"
    >
      Log out
    </Button>
  );
}
