"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Image from "next/image";
import { signIn, useSession, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

const registerSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check for session and save token on mount and when session changes
  useEffect(() => {
    const saveToken = async () => {
      if (session?.rawToken) {
        Cookies.set("jwt_token", session.rawToken, {
          expires: 7, // Default to 7 days
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
        console.log("JWT Token saved:", session.rawToken);

        // Redirect if we're on the register page
        if (window.location.pathname === "/register") {
          router.push("/");
        }
      }
    };

    if (status === "authenticated") {
      saveToken();
    }
  }, [session, status, router]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Registration failed");
      }

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Get the JWT token
      const session = await getSession();
      if (session?.rawToken) {
        Cookies.set("jwt_token", session.rawToken, {
          expires: 7,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
        console.log("JWT Token saved (register):", session.rawToken);
      }
      toast.success("Welcome!");

      router.push("/login");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl: "/" });
    // Token will be handled in useEffect when session is updated
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-[1172px] mx-auto overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left side with form */}
            <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-between relative">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold">Sign up</h1>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field, fieldState }) => (
                        <FormItem className="space-y-1">
                          <FormLabel>
                            Name<span className="text-blue-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your name"
                              className="border border-gray-200"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          {fieldState.error && (
                            <p className="text-sm text-red-500">
                              {fieldState.error.message}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field, fieldState }) => (
                        <FormItem className="space-y-1">
                          <FormLabel>
                            Email<span className="text-blue-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              className="border border-blue-300"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          {fieldState.error && (
                            <p className="text-sm text-red-500">
                              {fieldState.error.message}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field, fieldState }) => (
                        <FormItem className="space-y-1">
                          <FormLabel>
                            Password<span className="text-blue-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Create a password"
                              className="border border-gray-200"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          {fieldState.error && (
                            <p className="text-sm text-red-500">
                              {fieldState.error.message}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field, fieldState }) => (
                        <FormItem className="">
                          <FormLabel>
                            Repeat Password
                            <span className="text-blue-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Repeat a password"
                              className="border border-gray-200"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          {fieldState.error && (
                            <p className="text-sm text-red-500">
                              {fieldState.error.message}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white mt-6"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                  </form>
                </Form>

                <Button
                  variant="outline"
                  className="w-full border border-gray-200 flex items-center justify-center gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-700 font-medium">
                      Log in
                    </Link>
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <span className="text-gray-500">© FLAT</span>
                <span className="text-gray-500 flex items-center gap-2">
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
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  flat@gmail.com
                </span>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full border-[30px] border-blue-800 opacity-20 -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full border-[30px] border-blue-800 opacity-20 translate-y-1/2 -translate-x-1/2"></div>
            </div>

            {/* Right side with image */}
            <div className="hidden md:block md:w-1/2">
              <div className="h-full relative">
                <Image
                  src="/auth/register.png"
                  alt="Colorful buildings"
                  className="object-cover h-full w-full"
                  width={700}
                  height={800}
                  priority
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
