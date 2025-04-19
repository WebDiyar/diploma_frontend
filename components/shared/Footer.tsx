"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SocialIcon } from "react-social-icons";

const Footer = () => {
  return (
    <footer className="bg-white   text-black w-full py-8">
      <div className="container mx-auto px-4">
        <div className="grid justify-items-start gap-10 sm:grid-cols-2 sm:justify-items-center lg:grid-cols-4 lg:justify-items-center">
          {/* Logo and Tagline */}
          <div className="flex flex-col space-y-1 md:space-y-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/nav/aitu_logo.png"
                alt="Astana IT University Logo"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>

            <p className="text-base font-medium">
              Find Your Dream
              <br />
              Accommodation
            </p>

            <div className="flex space-x-4">
              <SocialIcon
                url="https://www.tiktok.com"
                style={{ height: 25, width: 25 }}
              />
              <SocialIcon
                url="https://www.instagram.com"
                style={{ height: 25, width: 25 }}
              />
              <SocialIcon
                url="https://www.facebook.com"
                style={{ height: 25, width: 25 }}
              />
              <SocialIcon
                url="https://www.linkedin.com"
                style={{ height: 25, width: 25 }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col space-y-1 md:space-y-4">
            <h3 className="text-base font-bold text-blue-700">NAVIGATION</h3>
            <nav className="flex flex-col space-y-3">
              <Link
                href="/about"
                className="text-base hover:text-blue-700 transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/faq"
                className="text-base hover:text-blue-700 transition-colors"
              >
                FAQ
              </Link>
            </nav>
          </div>

          {/* Tenants */}
          <div className="flex flex-col space-y-1 md:space-y-4">
            <h3 className="text-base font-bold text-blue-700">TENANTS</h3>
            <nav className="flex flex-col space-y-3">
              <Link
                href="/video-chat"
                className="text-base hover:text-blue-700 transition-colors"
              >
                Video Chat
              </Link>
              <Link
                href="/housing-guide"
                className="text-base hover:text-blue-700 transition-colors"
              >
                Housing Guide
              </Link>
              <Link
                href="/terms"
                className="text-base hover:text-blue-700 transition-colors"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/privacy"
                className="text-base hover:text-blue-700 transition-colors"
              >
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* Resources */}
          <div className="flex flex-col space-y-1 md:space-y-4">
            <h3 className="text-base font-bold text-blue-700">RESOURCES</h3>
            <div className="flex flex-col space-y-3">
              <p className="text-base">
                EXPO, Syganak St. 55,
                <br />
                Astana
              </p>
              <a
                href="mailto:flat@gmail.com"
                className="text-base hover:text-blue-700 transition-colors"
              >
                flat@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
