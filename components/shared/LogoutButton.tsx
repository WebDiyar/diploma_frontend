"use client";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const handleLogOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return <Button onClick={handleLogOut}>Log out</Button>;
}
