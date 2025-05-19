"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link href="/">
              <div className="w-[140px] h-[55px] bg-red-300"></div>
              {/* <Image
                src="/nav/aitu_logo.png"
                alt="Astana IT University"
                width={140}
                height={55}
                className="h-auto w-auto sm:w-[150px] md:w-[160px] lg:w-[170px] object-contain"
              /> */}
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 text-sm lg:text-base transition-colors"
            >
              Home
            </Link>
            <Link
              href="/yandex"
              className="text-gray-600 hover:text-gray-900 text-sm lg:text-base transition-colors"
            >
              Yandex Map
            </Link>
            <Link
              href="/profile"
              className="text-gray-600 hover:text-gray-900 text-sm lg:text-base transition-colors"
            >
              Profile
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 text-sm lg:text-base transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/about-us"
              className="text-gray-600 hover:text-gray-900 text-sm lg:text-base transition-colors"
            >
              About Us
            </Link>
          </nav>

          {/* Login and CTA Section */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {session?.rawToken ? (
              <>
                <Button
                  onClick={handleLogOut}
                  className="text-white bg-red-600 hover:bg-red-700"
                >
                  Log out
                </Button>
                <span>{session?.user.name}</span>
              </>
            ) : (
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 text-sm lg:text-base transition-colors"
              >
                Log In
              </Link>
            )}

            {/* Language selector icon */}
            <div className="text-gray-600 cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
            </div>

            <Link
              href="/rent-a-room"
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-3 lg:px-4 text-sm lg:text-base border border-gray-400 rounded shadow transition-colors"
            >
              Rent a Room
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={toggleMenu}
              aria-label="Toggle menu"
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
          <div className="md:hidden fixed inset-x-0 top-[73px] bg-white shadow-lg z-40 overflow-hidden transition-all duration-300">
            <div className="px-4 py-3 space-y-3 max-h-[calc(100vh-73px)] overflow-y-auto">
              <Link
                href="/"
                className="block text-gray-600 hover:text-gray-900 py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/landlords"
                className="block text-gray-600 hover:text-gray-900 py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Landlords
              </Link>
              <Link
                href="/dashboard"
                className="block text-gray-600 hover:text-gray-900 py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/about-us"
                className="block text-gray-600 hover:text-gray-900 py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>

              <div className="pt-2 flex flex-col space-y-3">
                <Link
                  href="/login"
                  className="block text-gray-600 hover:text-gray-900 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>

                {/* Language selector in mobile menu */}
                <div className="flex items-center text-gray-600 py-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                  <span>Language</span>
                </div>

                <Link
                  href="/landloads"
                  className="block w-full text-center bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Rent a Room
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
