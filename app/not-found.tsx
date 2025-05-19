"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  const goHome = () => {
    router.push("/");
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] w-full">
      <div className="w-full max-w-lg px-4">
        <div className="text-left">
          <p className="text-sm font-medium text-blue-600">404 error</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-800 sm:text-4xl md:text-5xl">
            Page not found
          </h1>
          <p className="mt-4 text-base text-gray-600">
            Sorry, the page you are looking for doesn&#39;t exist.
            <br />
            Here are some helpful links:
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              onClick={goBack}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Go back
            </Button>
            <Button
              onClick={goHome}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-700 border border-transparent rounded-md hover:bg-blue-800 focus:outline-none"
            >
              Take me home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
