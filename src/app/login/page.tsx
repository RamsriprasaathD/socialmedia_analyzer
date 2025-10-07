"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { TrendingUp, MessageSquare, Users, BarChart3, Eye, ThumbsUp } from "lucide-react";

export default function SlotsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const timeInRecorded = useRef(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [particles] = useState(() => 
    [...Array(20)].map(() => ({
      width: Math.random() * 300 + 50,
      height: Math.random() * 300 + 50,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    }))
  );

  // Only render particles after client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session]);

  // Track mouse position for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Mouse tracking for future interactive features
      const x = e.clientX;
      const y = e.clientY;
      // Store for potential use
      void x;
      void y;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Redirect to home if already signed in
  useEffect(() => {
    if (session?.user?.email) {
      router.push("/");
    }
  }, [session, router]);

  const handleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const handleSignOut = async () => {
    if (session?.user?.email) {
      await recordTimeOut(session.user.email);
    }
    signOut({ callbackUrl: "/" });
  };

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Trending Topics",
      description: "Track viral content and emerging trends across Reddit communities"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Sentiment Analysis",
      description: "Understand community sentiment with advanced NLP analytics"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "User Insights",
      description: "Analyze user behavior, engagement patterns, and demographics"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Performance Metrics",
      description: "Real-time statistics on posts, comments, and engagement rates"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Content Monitoring",
      description: "Monitor specific subreddits and keywords for relevant discussions"
    },
    {
      icon: <ThumbsUp className="w-6 h-6" />,
      title: "Engagement Tracking",
      description: "Measure upvotes, comments, and community interaction metrics"
    }
  ];

  const stats = [
    { label: "Subreddits Tracked", value: "20" },
    { label: "Daily Posts Analyzed", value: "500+" },
    { label: "Active Users", value: "10K+" },
    { label: "Data Points", value: "1B+" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
      {/* Animated background effect */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-transparent to-orange-500/20"></div>
        {isMounted && particles.map((particle, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-orange-500/10"
            style={{
              width: particle.width,
              height: particle.height,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
      `}</style>

      <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 max-w-7xl">
        {/* Navbar */}
        <nav className="flex justify-between items-center mb-6 sm:mb-8 md:mb-16 py-3 sm:py-4 backdrop-blur-sm bg-black/20 rounded-xl sm:rounded-2xl px-3 sm:px-6 border border-orange-500/20">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Reddit Analytics
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {!session ? (
              <button
                onClick={handleSignIn}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 sm:px-4 md:px-8 py-2 md:py-3 rounded-lg sm:rounded-xl transition-all duration-300 font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 active:scale-95 sm:hover:scale-105 text-xs sm:text-sm md:text-base whitespace-nowrap"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="bg-gray-800 hover:bg-gray-700 text-white px-3 sm:px-4 md:px-8 py-2 md:py-3 rounded-lg sm:rounded-xl transition-all duration-300 font-semibold border border-gray-700 hover:border-gray-600 active:scale-95 sm:hover:scale-105 text-xs sm:text-sm md:text-base whitespace-nowrap"
              >
                Sign Out
              </button>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-12 md:mb-16">
          {/* Left Column - Main Content */}
          <div className="flex flex-col justify-center space-y-4 sm:space-y-6 md:space-y-8 order-2 lg:order-1">
            <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 w-fit">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-orange-400 text-xs sm:text-sm font-medium">Real-time Analytics</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent">
                Unlock Reddit&apos;s
              </span>
              <br />
              <span className="text-orange-500">Data Insights</span>
            </h2>

            <p className="text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed">
              Dive deep into Reddit&apos;s vast ecosystem with powerful analytics tools. Track trending topics, analyze sentiment, and gain actionable insights from millions of conversations happening in real-time.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 pt-2 sm:pt-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-orange-500/40 transition-all duration-300"
                >
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-500">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Login Card */}
          <div className="flex items-center justify-center order-1 lg:order-2">
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl w-full max-w-md border border-orange-500/30 backdrop-blur-sm relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-600/10 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg shadow-orange-500/50">
                  <svg
                    className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white"
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

                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-center bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                  Welcome Back
                </h3>

                <p className="text-gray-400 mb-6 sm:mb-8 text-sm md:text-base text-center px-2">
                  {!session
                    ? "Sign in to access your analytics dashboard"
                    : `Welcome, ${session.user?.name || session.user?.email}!`}
                </p>

                {status === "loading" && (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-3 border-orange-500 border-t-transparent"></div>
                  </div>
                )}

                {!session && status !== "loading" && (
                  <button
                    onClick={handleSignIn}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:from-orange-700 active:to-orange-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300 font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 active:scale-95 sm:hover:scale-105 flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12 md:mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-3 bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">
            Powerful Features
          </h3>
          <p className="text-gray-400 text-center mb-8 md:mb-12 text-sm md:text-base">
            Everything you need to understand Reddit&apos;s pulse
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`bg-gradient-to-br from-gray-900 to-black border rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
                  hoveredCard === index
                    ? 'border-orange-500/60 shadow-xl shadow-orange-500/20 scale-105'
                    : 'border-orange-500/20 hover:border-orange-500/40'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                  hoveredCard === index
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/50'
                    : 'bg-orange-500/10'
                }`}>
                  <div className={`transition-colors duration-300 ${
                    hoveredCard === index ? 'text-white' : 'text-orange-500'
                  }`}>
                    {feature.icon}
                  </div>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-white">{feature.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">
            Ready to Get Started?
          </h3>
          <p className="text-gray-400 mb-6 text-sm md:text-base max-w-2xl mx-auto">
            Join thousands of marketers, researchers, and businesses leveraging Reddit data for strategic insights
          </p>
          {!session && (
            <button
              onClick={handleSignIn}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 md:px-12 py-3 md:py-4 rounded-xl transition-all duration-300 font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 text-sm md:text-base"
            >
              Get Started Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}