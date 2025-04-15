"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className=" py-4 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto ">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex-shrink-0 p-4">
            <Link href="/">
              {/* Replace with actual logo */}
              <Image
                src="/nav/aitu_logo.png"
                alt="logo"
                width={170}
                height={75}
                className=" object-cover"
              />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={toggleMenu}
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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-8 ">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link
              href="/landlords"
              className="text-gray-600 hover:text-gray-900"
            >
              Landlords
            </Link>
            <Link
              href="/erasmus-life"
              className="text-gray-600 hover:text-gray-900"
            >
              Erasmus Life
            </Link>
            <Link
              href="/about-us"
              className="text-gray-600 hover:text-gray-900"
            >
              About Us
            </Link>
          </nav>

          {/* Login and CTA Section */}
          <div className="hidden md:flex items-center space-x-4 ">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Log In
            </Link>
            <div className="h-5 flex items-center">
              <span className="text-gray-400 mx-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z" />
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                </svg>
              </span>
            </div>
            <Link
              href="/rent-a-room"
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
            >
              Rent a Room
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-4 pb-3">
              <Link
                href="/"
                className="block text-gray-600 hover:text-gray-900"
              >
                Home
              </Link>
              <Link
                href="/landlords"
                className="block text-gray-600 hover:text-gray-900"
              >
                Landlords
              </Link>
              <Link
                href="/erasmus-life"
                className="block text-gray-600 hover:text-gray-900"
              >
                Erasmus Life
              </Link>
              <Link
                href="/about-us"
                className="block text-gray-600 hover:text-gray-900"
              >
                About Us
              </Link>
              <div className="pt-4 border-t border-gray-200">
                <Link
                  href="/login"
                  className="block text-gray-600 hover:text-gray-900 mb-4"
                >
                  Log In
                </Link>
                <Link
                  href="/rent-a-room"
                  className="block w-full text-center bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
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
