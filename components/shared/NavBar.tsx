"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ["/", "/login", "/register"];

  useEffect(() => {
    const isPublic = publicPaths.includes(pathname);
    if (status === "unauthenticated" && !isPublic) {
      toast.warning("You are not logged in. Please log in..");
      router.push("/login");
    }
  }, [status, pathname, router]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogOut = async () => {
    Cookies.remove("jwt_token");
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header
      className={`sticky top-0 w-full py-3 px-4 md:px-6 lg:px-8 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-white"
      }`}
    >
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/nav/aitu_logo.png"
            alt="Astana IT University Logo"
            width={140}
            height={55}
            className="h-auto w-auto sm:w-[150px] md:w-[160px] lg:w-[170px] object-contain"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link
            href="/apartments"
            className="text-gray-600 hover:text-gray-900"
          >
            All Apartments
          </Link>
          <Link
            href="/my-apartments"
            className="text-gray-600 hover:text-gray-900"
          >
            My Apartments
          </Link>
          <Link href="/booking" className="text-gray-600 hover:text-gray-900">
            Bookings
          </Link>
          <Link href="/profile" className="text-gray-600 hover:text-gray-900">
            Profile
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {session?.rawToken ? (
            <>
              <span
                className="cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                <span className="underline">Name:</span> {session.user.name}
              </span>
              <Button
                onClick={handleLogOut}
                className="text-white bg-red-600 hover:bg-red-700"
              >
                Log out
              </Button>
            </>
          ) : (
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Log In
            </Link>
          )}
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMenu}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[73px] bg-white shadow-lg z-40">
          <div className="px-4 py-3 space-y-3">
            {["/", "/apartments", "/my-apartments", "/booking", "/profile"].map(
              (path) => (
                <Link
                  key={path}
                  href={path}
                  className="block text-gray-600 hover:text-gray-900 py-2 border-b border-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {path === "/"
                    ? "Home"
                    : path.replace("/", "").replace("-", " ")}
                </Link>
              ),
            )}
            <div className="pt-2 flex flex-col space-y-3">
              {!session?.rawToken ? (
                <Link
                  href="/login"
                  className="block text-gray-600 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>
              ) : (
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogOut();
                  }}
                  className="text-white bg-red-600 hover:bg-red-700"
                >
                  Log out
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
