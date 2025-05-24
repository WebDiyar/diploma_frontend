"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "lucide-react";
import { toast } from "react-toastify";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

export default function AboutUsPage() {
  const [showMore, setShowMore] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    fullName: "",
    question: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    toast.success("Submitted your question data!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
    });
    setFormData({
      fullName: "",
      question: "",
    });
    console.log("Submitted question data: ", formData);
  };

  return (
    <div className="w-full">
      {/* Hero section */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Left column - About Us content */}
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-blue-600 text-lg sm:text-xl font-medium">
                About Us
              </h2>
              <h1 className="text-gray-800 text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                Finding Living
                <br />
                Accommodations Together
              </h1>
            </div>

            {/* Right column - Service description */}
            <div className="space-y-4 sm:space-y-6">
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                Are you a student looking for accommodation near Astana IT
                University? Or maybe near your university? Our platform makes it
                easy to find, compare, and book the best apartments near your
                university. We provide verified landlords, secure payments, and
                a seamless booking experience to ensure you get the best housing
                without stress.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Collapsible open={showMore}>
        <CollapsibleContent>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
            <div className="bg-white p-6 sm:p-8 shadow-lg rounded-lg ">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
                Our Mission & Values
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
                    Our Mission
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base mb-4">
                    To provide students with safe, affordable, and comfortable
                    housing options that enhance their university experience. We
                    believe that where you live affects how you learn, and we
                    are committed to helping students find their ideal home away
                    from home.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
                    Our Values
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <span>Trust and Transparency</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <span>Student-Centered Solutions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <span>Community Building</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <span>Innovation in Housing Solutions</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 sm:mt-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
                  How We Started
                </h3>
                <p className="text-gray-700 text-sm sm:text-base">
                  Founded by former Astana IT University students who
                  experienced firsthand the challenges of finding reliable
                  housing, our platform was born from a genuine need within the
                  student community. What started as a small project to help
                  fellow students has grown into a trusted platform serving the
                  entire university community. Our founders&#39; personal
                  experiences with housing difficulties have shaped our approach
                  to solving these problems for current and future students.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Our Future Section with image */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white shadow-md rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Apartment Image */}
            <div className="p-4 sm:p-6">
              <Image
                src="/aboutus/our_future.png"
                alt="Modern apartment interior"
                width={600}
                height={400}
                className="rounded-lg w-full h-auto object-cover"
              />
            </div>

            {/* Right side - Our Future text */}
            <div className="p-4 sm:p-6 flex flex-col justify-center">
              <h2 className="text-blue-700 text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                Our Future
              </h2>
              <p className="text-gray-700 text-sm sm:text-base mb-4 sm:mb-6">
                FLAT is a dedicated platform designed for students who need
                safe, comfortable, and affordable accommodation in Astana. Many
                students struggle to find a trustworthy rental service,
                especially those from other cities. Our platform solves this
                issue by connecting students with verified landlords and
                offering secure payment options
              </p>

              {/* Three option bubbles */}
              <div className="flex flex-wrap gap-2 justify-between mt-4 sm:mt-6">
                <Badge
                  variant="secondary"
                  className="py-1.5 px-3 sm:py-2 sm:px-4 bg-gray-100 text-gray-700 font-normal text-xs sm:text-sm"
                >
                  Apartments
                </Badge>
                <Badge
                  variant="secondary"
                  className="py-1.5 px-3 sm:py-2 sm:px-4 bg-gray-100 text-gray-700 font-normal text-xs sm:text-sm"
                >
                  Reservation <br />
                  (Trimester)
                </Badge>
                <Badge
                  variant="secondary"
                  className="py-1.5 px-3 sm:py-2 sm:px-4 bg-gray-100 text-gray-700 font-normal text-xs sm:text-sm"
                >
                  Students
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meet Our Team Section */}
      <div className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-gray-800 text-2xl sm:text-3xl md:text-4xl font-bold mb-10 sm:mb-16">
            Meet our team
          </h2>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {/* Team Member 1 */}
            <div className="flex flex-col items-center">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden mb-4 sm:mb-6">
                <Image
                  src="/aboutus/diyar.png"
                  alt="Diyar Amangeldi"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-gray-800 text-xl sm:text-2xl font-semibold mb-1">
                Diyar Amangeldi
              </h3>
              <p className="text-blue-600 text-sm sm:text-base">
                Frontend Engineer, UI/UX designer
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="flex flex-col items-center">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden mb-4 sm:mb-6">
                <Image
                  src="/aboutus/aldiyar.png"
                  alt="Aldiyar Sagidolla"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-gray-800 text-xl sm:text-2xl font-semibold mb-1">
                Aldiyar Sagidolla
              </h3>
              <p className="text-blue-600 text-sm sm:text-base">
                QA Engineer, Backend Developer
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="flex flex-col items-center">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden mb-4 sm:mb-6">
                <Image
                  src="/aboutus/maxim.png"
                  alt="Maxim Turbulyak"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-gray-800 text-xl sm:text-2xl font-semibold mb-1">
                Maxim Turbulyak
              </h3>
              <p className="text-blue-600 text-sm sm:text-base">
                Full Stack Engineer, Software Architect
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Testimonials Section */}
      <div className="w-full py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-blue-700 text-lg sm:text-xl font-medium mb-2">
            Student Testimonials
          </h2>
          <h3 className="text-gray-800 text-2xl sm:text-3xl font-bold mb-8 sm:mb-12">
            That is What Our Students Say
          </h3>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Testimonial 1 */}
            <div className="bg-blue-700 rounded-lg p-4 sm:p-6 text-left shadow-sm">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden mr-3">
                  <Image
                    src="/aboutus/maxim.png"
                    alt="Aruzhan Ospanova"
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h4 className="text-white text-lg sm:text-xl font-medium">
                  Aruzhan Ospanova
                </h4>
              </div>
              <p className="text-white text-sm sm:text-base">
                A very convenient service! I found an apartment in one day, and
                the landlord was really helpful.
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-blue-700 rounded-lg p-4 sm:p-6 text-left shadow-sm">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden mr-3">
                  <Image
                    src="/aboutus/maxim.png"
                    alt="Almas Muratuly"
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h4 className="text-white text-lg sm:text-xl font-medium">
                  Almas Muratuly
                </h4>
              </div>
              <p className="text-white text-sm sm:text-base">
                Safe payments and verified landlords made my booking
                stress-free. Highly recommended!
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-blue-700 rounded-lg p-4 sm:p-6 text-left shadow-sm">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden mr-3">
                  <Image
                    src="/aboutus/maxim.png"
                    alt="Toktar Sultan"
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h4 className="text-white text-lg sm:text-xl font-medium">
                  Toktar Sultan
                </h4>
              </div>
              <p className="text-white text-sm sm:text-base">
                I was worried about scams, but this platform provided real,
                affordable housing. Now I live near my university with no issues
              </p>
            </div>
          </div>

          {/* Read More Button */}
          <div className="mt-6 sm:mt-8">
            <Button
              variant="outline"
              className="bg-white text-gray-800 font-medium py-1.5 px-6 sm:py-2 sm:px-8 shadow-sm border-[0.3px] cursor-pointer"
            >
              Read More
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="w-full bg-blue-700 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Have Questions? Need Assistance? We are Here to Help!
          </h2>
          <p className="text-white text-base sm:text-lg mb-6 sm:mb-8">
            Our Team Is Available To Assist You With Any Questions, Concerns, Or
            Booking Issues. Contact Us Anytime!
          </p>

          {/* Contact Form */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-3xl mx-auto">
            <Input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full bg-white sm:w-auto flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-md border-0"
            />
            <Input
              type="text"
              name="question"
              value={formData.question}
              onChange={handleChange}
              placeholder="Enter your Question...."
              className="w-full bg-white sm:w-auto flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-md border-0"
            />
            <Button
              className="bg-white hover:bg-blue-200 text-[#2143b3] font-medium py-2 sm:py-3 px-6 sm:px-8 rounded-md transition-colors border-0 shadow-sm"
              onClick={handleSubmit}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
