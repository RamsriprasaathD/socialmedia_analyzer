"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Users,
  Eye,
  TrendingUp,
  MessageCircle,
  Award,
  Clock,
  LogOut,
  Heart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [hashtags, setHashtags] = useState({});
  const [sentiments, setSentiments] = useState({ positive: 0, negative: 0, neutral: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);

  // Chatbot states
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatRef = useRef(null);

  // Auth
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  // Record login/out time
  const recordTime = async (action, email, name = "") => {
    try {
      await fetch("/api/time-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, email, name }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (session?.user?.email) recordTime("time_in", session.user.email, session.user.name);
    const handleBeforeUnload = () => {
      if (session?.user?.email) {
        navigator.sendBeacon(
          "/api/time-tracking",
          JSON.stringify({ action: "time_out", email: session.user.email })
        );
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [session]);

  const handleSignOut = async () => {
    if (session?.user?.email) await recordTime("time_out", session.user.email);
    signOut({ callbackUrl: "/login" });
  };

  // Sentiment analysis
  const computeSentiments = useCallback((postList) => {
    const positiveWords = ["good", "great", "love", "excellent", "positive", "win"];
    const negativeWords = ["bad", "hate", "terrible", "sad", "fail", "death"];
    let positive = 0, negative = 0, neutral = 0;

    postList.forEach((post) => {
      const text = (post.title || "").toLowerCase();
      const pos = positiveWords.filter((w) => text.includes(w)).length;
      const neg = negativeWords.filter((w) => text.includes(w)).length;
      if (pos > neg) positive++;
      else if (neg > pos) negative++;
      else neutral++;
    });
    setSentiments({ positive, negative, neutral });
  }, []);

  // Fetch Reddit data
  const fetchRedditData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reddit");
      const data = await res.json();
      const postList = Array.isArray(data.posts)
        ? data.posts
        : data?.data?.children?.map((c) => c.data) || [];
      setPosts(postList);
      setHashtags(data.hashtags || {});
      setLastFetched(new Date());
    } catch (err) {
      console.error(err);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchRedditData();
      const interval = setInterval(fetchRedditData, 10 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    if (posts.length) computeSentiments(posts);
  }, [posts, computeSentiments]);

  // 🔹 Chatbot Send - FIXED VERSION
  const handleSend = async () => {
    if (!userInput.trim() || isSending) return;

    const userMsg = { sender: "user", text: userInput };
    setChatMessages((prev) => [...prev, userMsg]);
    const currentQuestion = userInput;
    setUserInput("");
    setIsSending(true);

    try {
      // Prepare the top 20 posts with all necessary data
      const newsData = posts.slice(0, 20).map(post => ({
        title: post.title || "Untitled",
        score: post.score ?? post.ups ?? 0,
        author: post.author || "Unknown",
        url: post.url || "",
        created: post.created_utc || 0
      }));

      console.log("📤 Sending to chatbot API:", {
        question: currentQuestion,
        postsCount: newsData.length
      });

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuestion: currentQuestion,
          newsData: newsData,
        }),
      });

      console.log("📥 Response status:", res.status);

      const data = await res.json();
      console.log("📦 Response data:", data);

      if (!res.ok) {
        // Show the actual error from the server
        const errorMsg = data.reply || data.error || `HTTP error! status: ${res.status}`;
        setChatMessages((prev) => [
          ...prev,
          { sender: "bot", text: errorMsg },
        ]);
        return;
      }

      const botMsg = { sender: "bot", text: data.reply || "I couldn't generate a response. Please try again." };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("💥 Chatbot error:", err);
      const errorMessage = err.message || "Unknown error occurred";
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: `Error: ${errorMessage}. Check browser console for details.` },
      ]);
    } finally {
      setIsSending(false);
    }

    // Auto-scroll to bottom
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, 100);
  };

  const redditStats = [
    { label: "Total Posts", value: posts.length.toLocaleString(), icon: Eye, color: "#ff6b35" },
    {
      label: "Total Upvotes",
      value: posts.reduce((s, p) => s + (p.score ?? p.ups ?? 0), 0).toLocaleString(),
      icon: TrendingUp,
      color: "#4ecdc4",
    },
    {
      label: "Avg. Score",
      value: Math.round(
        posts.reduce((s, p) => s + (p.score ?? p.ups ?? 0), 0) / (posts.length || 1)
      ).toLocaleString(),
      icon: Award,
      color: "#45b7d1",
    },
    {
      label: "Active Authors",
      value: new Set(posts.map((p) => p.author).filter(Boolean)).size.toLocaleString(),
      icon: Users,
      color: "#96ceb4",
    },
  ];

  const chartData = [
    { name: "Sentiments", Positive: sentiments.positive, Negative: sentiments.negative, Neutral: sentiments.neutral },
  ];
  const formatTimestamp = (d) =>
    d ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(d) : "";

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-orange-500 border-gray-600 rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }
  if (!session) return null;

  return (
    <>
      <div className="min-h-screen bg-[#0f1419] text-white font-sans">
        {/* Header */}
        <header className="bg-[#1a1f29] border-b border-[#2d3748] shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
                <BarChart3 size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                Reddit Analytics Dashboard
              </h1>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </header>

        {/* Main Dashboard */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-orange-500" />
              <h2 className="text-xl font-semibold">Reddit Metrics</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {redditStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-[#1a1f29] border border-[#2d3748] rounded-lg p-4 text-center">
                    <div className="inline-flex p-3 rounded-full mb-3" style={{ backgroundColor: stat.color }}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Reddit Posts */}
          <section className="bg-[#1a1f29] border border-[#2d3748] rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} className="text-orange-500" />
                <h2 className="text-xl font-semibold">Latest Reddit Posts</h2>
              </div>
              {lastFetched && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock size={14} />
                  <span>{formatTimestamp(lastFetched)}</span>
                </div>
              )}
            </div>
            {isLoading ? (
              <p className="text-gray-400 text-center py-8">Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No posts found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2d3748] text-gray-400">
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-right">Score</th>
                    <th className="p-3 text-right">Author</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.slice(0, 20).map((post, i) => (
                    <tr key={i} className="border-b border-[#2d3748] hover:bg-white/5 transition">
                      <td className="p-3 text-orange-400">{i + 1}</td>
                      <td className="p-3 truncate">{post.title}</td>
                      <td className="p-3 text-right text-cyan-400">{post.score ?? post.ups ?? 0}</td>
                      <td className="p-3 text-right text-green-400">u/{post.author}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Sentiment Chart */}
          <section className="bg-[#1a1f29] border border-[#2d3748] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-orange-500">Sentiment Analysis</h3>
            {posts.length === 0 ? (
              <p className="text-gray-400 text-center py-12">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                  <XAxis dataKey="name" stroke="#a0aec0" />
                  <YAxis stroke="#a0aec0" />
                  <Tooltip contentStyle={{ background: "#2d3748", borderRadius: "8px" }} />
                  <Legend />
                  <Bar dataKey="Positive" fill="#4ecdc4" radius={4} />
                  <Bar dataKey="Negative" fill="#e74c3c" radius={4} />
                  <Bar dataKey="Neutral" fill="#95a5a6" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>
        </main>

        {/* Floating Chatbot Icon */}
        <div
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center cursor-pointer shadow-2xl hover:scale-110 transition z-50"
          onClick={() => setShowChatbot(true)}
        >
          <MessageCircle size={32} className="text-white" />
        </div>

        {/* Chatbot Popup */}
        {showChatbot && (
          <div className="fixed bottom-24 right-6 w-96 h-[520px] bg-[#1a1f29] border border-[#2d3748] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 flex justify-between items-center">
              <h3 className="font-bold text-white">Ask Gemini</h3>
              <button onClick={() => setShowChatbot(false)} className="text-white text-xl hover:bg-white/20 rounded-full w-8 h-8">×</button>
            </div>
            <div ref={chatRef} className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.length === 0 && (
                <p className="text-gray-400 text-center">Ask anything about the 20 latest Reddit posts!</p>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} className={`max-w-xs px-4 py-2 rounded-2xl ${m.sender === "user"
                    ? "bg-orange-500 text-white ml-auto"
                    : "bg-[#2d3748] text-gray-200"
                  }`}>
                  {m.text}
                </div>
              ))}
              {isSending && (
                <div className="bg-[#2d3748] text-gray-200 px-4 py-2 rounded-2xl max-w-xs">
                  <span className="inline-block animate-pulse">Thinking...</span>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[#2d3748] flex gap-2">
              <input
                type="text"
                placeholder="Type your question..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isSending && handleSend()}
                disabled={isSending}
                className="flex-1 bg-[#11141a] text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isSending || !userInput.trim()}
                className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2 rounded-lg font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? "..." : "Send"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
}