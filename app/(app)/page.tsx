import Navigation from "@/components/shared/Navigation";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import LogoutButton from "@/components/shared/LogoutButton";

export default async function Home() {
  const queryClient = getQueryClient();
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Navigation />
        Welcome, <span className="font-medium">{user.name}</span>
        <LogoutButton />
      </HydrationBoundary>
    </>
  );
}
