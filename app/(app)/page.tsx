"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [rawToken, setRawToken] = useState("");

  useEffect(() => {
    if (session?.rawToken) {
      setRawToken(session.rawToken);
    }
  }, [session]);

  return (
    <div className="text-sm text-gray-600 p-4">
      <p>Status: {status}</p>
      <p>{rawToken}</p>
    </div>
  );
}

// import Navigation from "@/components/shared/Navigation";
// import { getQueryClient } from "@/lib/getQueryClient";
// import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
// import { redirect } from "next/navigation";
// import { getCurrentUser } from "@/lib/session";
// import LogoutButton from "@/components/shared/LogoutButton";

// export default async function Home() {
//   const queryClient = getQueryClient();
//   const user = await getCurrentUser();

//   if (!user) {
//     redirect("/login");
//   }

//   return (
//     <>
//       <HydrationBoundary state={dehydrate(queryClient)}>
//         <Navigation />
//         Welcome, <span className="font-medium">{user.name}</span>
//         <LogoutButton />
//       </HydrationBoundary>
//     </>
//   );
// }
