"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getSession, signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  // const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    const saveToken = async () => {
      if (session?.rawToken) {
        Cookies.set("jwt_token", session.rawToken, {
          expires: 7,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
        console.log("JWT Token saved:", session.rawToken);
      }
    };

    if (status === "authenticated") {
      saveToken();
    }
  }, [session, status]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) throw new Error(result.error);

      const session = await getSession();
      if (session?.rawToken) {
        const expiryDays = values.rememberMe ? 7 : 1;
        Cookies.set("jwt_token", session.rawToken, {
          expires: expiryDays,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
        console.log("JWT Token saved (credentials):", session.rawToken);
      }

      toast.success("Logged in successfully");
      router.push("/profile");
    } catch (error: any) {
      setErrorMessage(error.message || "Login failed");
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signIn("google", { callbackUrl: "/" });
      // Token will be handled in useEffect when session is updated
    } catch (error: any) {
      setErrorMessage("Google sign-in failed. Please try again.");
      toast.error(error.message || "Google sign-in failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-[1172px] mx-auto overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left side - Image */}
            <div className="hidden md:block md:w-1/2">
              <div className="h-full relative">
                <Image
                  src="/auth/login.png"
                  alt="login"
                  className="object-cover h-full w-full"
                  width={700}
                  height={800}
                  priority
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>

            {/* Right side - Login form */}
            <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-4 text-center">
                  Log in
                </h1>
                <p className="text-gray-600 mb-8 text-center">
                  Welcome back! Please enter your details.
                </p>

                {errorMessage && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
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
                              placeholder="Write a password"
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

                    <div className="flex flex-row justify-between items-center ">
                      <FormField
                        control={form.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                id="remember"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor="remember"
                              className="text-sm text-gray-600"
                            >
                              Remember me
                            </FormLabel>
                          </FormItem>
                        )}
                      />

                      <div className="flex">
                        <Link
                          href="/forgot-password"
                          className="text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white mb-4"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign in"}
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
                  Sign in with Google
                </Button>

                <div className="mt-6 text-center text-sm text-gray-600">
                  <span> Don&rsquo;t have an account? </span>
                  <Link
                    href="/register"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Sign up
                  </Link>
                </div>
              </div>

              <div className="mt-8 text-center text-gray-500">© FLAT</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
