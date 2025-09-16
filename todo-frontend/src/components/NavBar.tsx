"use client";

import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";


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
        <nav className="bg-blue-600 p-4 text-white">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">Todo App</h1>
                <div>
                    <button className="bg-blue-800 px-4 py-2 rounded mr-2 hover:bg-blue-700 transition">Dashboard</button>
                    <button className="bg-blue-800 px-4 py-2 rounded hover:bg-blue-700 transition" onClick={handleLogout}>Logout</button>
                </div>
            </div>
        </nav>
    );
}