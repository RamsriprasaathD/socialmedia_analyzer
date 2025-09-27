"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

export default function SlotsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const timeInRecorded = useRef(false);

  // Function to create user if not exists and record time in
  const recordTimeIn = async (userEmail: string, userName: string) => {
    try {
      const response = await fetch('/api/time-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'time_in',
          email: userEmail,
          name: userName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record time in');
      }

      const data = await response.json();
      console.log('Time in recorded:', data);
    } catch (error) {
      console.error('Error recording time in:', error);
    }
  };

  // Function to record time out
  const recordTimeOut = async (userEmail: string) => {
    try {
      const response = await fetch('/api/time-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'time_out',
          email: userEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record time out');
      }

      const data = await response.json();
      console.log('Time out recorded:', data);
    } catch (error) {
      console.error('Error recording time out:', error);
    }
  };

  // Record time in when user logs in
  useEffect(() => {
    if (session?.user?.email && !timeInRecorded.current) {
      recordTimeIn(
        session.user.email,
        session.user.name || session.user.email
      );
      timeInRecorded.current = true;
    }
  }, [session]);

  // Record time out when user leaves the page or closes browser
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (session?.user?.email) {
        // Use sendBeacon for reliable data sending on page unload
        const data = JSON.stringify({
          action: 'time_out',
          email: session.user.email,
        });
        navigator.sendBeacon('/api/time-tracking', data);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && session?.user?.email) {
        recordTimeOut(session.user.email);
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session]);

  // Redirect to home if already signed in
  useEffect(() => {
    if (session?.user?.email) {
      router.push("/");
    }
  }, [session, router]);

  const handleSignIn = async () => {
    try {
      // Directly trigger Google OAuth
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const handleSignOut = async () => {
    // Record time out before signing out
    if (session?.user?.email) {
      await recordTimeOut(session.user.email);
    }
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-slate-800 text-white">
      <div className="container mx-auto p-4">
        {/* Navbar */}
        <div className="flex justify-between items-center mb-12 py-6">
          <h1 className="text-2xl font-semibold text-teal-400">
            Social Analytics - Reddit
          </h1>
          <div className="flex items-center space-x-4">
            {!session ? (
              <button
                onClick={handleSignIn}
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="bg-slate-700 rounded-2xl p-8 shadow-lg max-w-md w-full border border-slate-600 text-center">
            <div className="w-16 h-16 bg-teal-500 rounded-xl mx-auto mb-6 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <h2 className="text-3xl font-semibold mb-4 text-white">
              Welcome Back
            </h2>

            <p className="text-gray-300 mb-8 text-base">
              {!session
                ? "Sign in to access your account"
                : `Welcome, ${session.user?.name || session.user?.email}!`}
            </p>

            {status === "loading" && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-400 border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}