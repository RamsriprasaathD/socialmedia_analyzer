"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

export default function SlotsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  if(session?.user?.email){
    router.push("/");
  }

  const handleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Navbar</h1>
          <div className="flex items-center space-x-4">
            {!session ? (
              <button
                onClick={handleSignIn}
                className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}