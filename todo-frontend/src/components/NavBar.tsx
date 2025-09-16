"use client";

import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LogOut, Home } from "lucide-react";

export default function NavBar(){

    const router = useRouter();

    const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      router.push("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

    return(
        <nav className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white shadow-lg">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-wide">Todo App</h1>
                <div className="flex space-x-2">
                    <button className="flex items-center bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm">
                        <Home className="h-4 w-4 mr-2" />
                        Dashboard
                    </button>
                    <button className="flex items-center bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}