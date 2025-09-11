"use client";

import { auth, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FirebaseError } from "firebase/app";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const api = process.env.NEXT_PUBLIC_API_URL;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      try {
        // Try to create new user
        const res = await axios.post(`${api}/api/User`, {
          UserId: user.uid,
          Email: user.email,
          FirstName: user.displayName?.split(" ")[0] || "",
          LastName: user.displayName?.split(" ")[1] || "",
        });
        if (res.status === 201) {
          toast.success("Logged in successfully");
          router.push("/dashboard");
        }
      } catch (err: unknown) {
        // If user already exists (400 status), still proceed with login
        if (
          axios.isAxiosError(err) &&
          err.response?.status === 400 &&
          err.response.data === "User already exists"
        ) {
          toast.success("Logged in successfully");
          router.push("/dashboard");
        } else {
          // If it's another type of error, show it
          toast.error("Failed to complete sign-in process");
          console.error("Error during sign-in:", err);
        }
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        console.log("Error code:", error.code);
        console.log("Error message:", error.message);

        switch (error.code) {
          case "auth/popup-closed-by-user":
            toast.error("Sign-in cancelled");
            break;
          case "auth/popup-blocked":
            toast.error("Popup blocked. Please allow popups and try again");
            break;
          case "auth/cancelled-popup-request":
            toast.error("Sign-in cancelled");
            break;
          case "auth/network-request-failed":
            toast.error("Network error. Please check your connection");
            break;
          case "auth/too-many-requests":
            toast.error("Too many attempts. Please try again later");
            break;
          default:
            toast.error("Failed to sign in with Google. Please try again");
            console.log("Unhandled Google sign-in error code:", error.code);
            break;
        }
      } else {
        toast.error("An unexpected error occurred. Please try again");
        console.error("Unexpected error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.log("Login error:", error);

      if (error instanceof FirebaseError) {
        console.log("Error code:", error.code);
        console.log("Error message:", error.message);

        switch (error.code) {
          case "auth/user-not-found":
            toast.error("No account found with this email");
            break;
          case "auth/wrong-password":
            toast.error("Incorrect password");
            break;
          case "auth/invalid-email":
            toast.error("Invalid email address");
            break;
          case "auth/user-disabled":
            toast.error("This account has been disabled");
            break;
          case "auth/invalid-credential":
            toast.error("Invalid email or password");
            break;
          case "auth/too-many-requests":
            toast.error("Too many failed attempts. Please try again later");
            break;
          case "auth/network-request-failed":
            toast.error("Network error. Please check your connection");
            break;
          default:
            toast.error("Failed to log in. Please try again");
            console.log("Unhandled error code:", error.code);
            break;
        }
        setLoading(false);
      } else {
        // For unexpected errors
        toast.error("Something went wrong. Please try again");
        console.error("Unexpected error:", error);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Button variant="link" onClick={() => router.push("/register")}>
              Sign Up
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email}</span>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <span className="text-red-500 text-sm">
                    {errors.password}
                  </span>
                )}
              </div>
              <CardFooter className="flex-col gap-2 px-0 pt-6">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                >
                  {loading ? (
                    "Signing in..."
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Image 
                        src="/google.svg" 
                        alt="Google" 
                        width={20} 
                        height={20}
                        className="w-5 h-5"
                      />
                      Sign in with Google
                    </div>
                  )}
                </Button>
              </CardFooter>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
