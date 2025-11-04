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
  X,
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

  // Chatbot Send
  const handleSend = async () => {
    if (!userInput.trim() || isSending) return;

    const userMsg = { sender: "user", text: userInput };
    setChatMessages((prev) => [...prev, userMsg]);
    const currentQuestion = userInput;
    setUserInput("");
    setIsSending(true);

    try {
      const newsData = posts.slice(0, 20).map(post => ({
        title: post.title || "Untitled",
        score: post.score ?? post.ups ?? 0,
        author: post.author || "Unknown",
        url: post.url || "",
        created: post.created_utc || 0
      }));

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuestion: currentQuestion,
          newsData: newsData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
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
      <div className="min-h-screen bg-[#0f1419] text-white font-sans pb-20">
        {/* Header - Mobile Optimized */}
        <header className="bg-[#1a1f29] border-b border-[#2d3748] shadow-lg sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                  <BarChart3 size={18} className="sm:w-5 sm:h-5 text-white" />
                </div>
                <h1 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent truncate">
                  Reddit Analytics
                </h1>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-gradient-to-r from-orange-500 to-orange-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold flex items-center gap-1 sm:gap-2 hover:scale-105 transition text-sm sm:text-base flex-shrink-0"
              >
                <LogOut size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Dashboard */}
        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* Stats - Mobile Grid */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <TrendingUp size={18} className="sm:w-5 sm:h-5 text-orange-500" />
              <h2 className="text-lg sm:text-xl font-semibold">Reddit Metrics</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {redditStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-[#1a1f29] border border-[#2d3748] rounded-lg p-3 sm:p-4 text-center">
                    <div className="inline-flex p-2 sm:p-3 rounded-full mb-2 sm:mb-3" style={{ backgroundColor: stat.color }}>
                      <Icon size={16} className="sm:w-5 sm:h-5 text-white" />
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm">{stat.label}</p>
                    <p className="text-xl sm:text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Reddit Posts - Mobile Optimized */}
          <section className="bg-[#1a1f29] border border-[#2d3748] rounded-xl p-3 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} className="sm:w-5 sm:h-5 text-orange-500" />
                <h2 className="text-lg sm:text-xl font-semibold">Latest Posts</h2>
              </div>
              {lastFetched && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                  <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span>{formatTimestamp(lastFetched)}</span>
                </div>
              )}
            </div>
            {isLoading ? (
              <p className="text-gray-400 text-center py-8">Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No posts found.</p>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
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
                          <td className="p-3 truncate max-w-md">{post.title}</td>
                          <td className="p-3 text-right text-cyan-400">{post.score ?? post.ups ?? 0}</td>
                          <td className="p-3 text-right text-green-400">u/{post.author}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-3">
                  {posts.slice(0, 20).map((post, i) => (
                    <div key={i} className="bg-[#11141a] border border-[#2d3748] rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <span className="text-orange-400 font-bold text-sm flex-shrink-0">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm mb-2 line-clamp-2">{post.title}</p>
                          <div className="flex items-center justify-between text-xs gap-2">
                            <span className="text-green-400 truncate">u/{post.author}</span>
                            <span className="text-cyan-400 flex-shrink-0">↑ {post.score ?? post.ups ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Sentiment Chart - Mobile Optimized */}
          <section className="bg-[#1a1f29] border border-[#2d3748] rounded-xl p-3 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-orange-500">Sentiment Analysis</h3>
            {posts.length === 0 ? (
              <p className="text-gray-400 text-center py-12">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={220} className="sm:h-[280px]">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                  <XAxis dataKey="name" stroke="#a0aec0" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#a0aec0" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#2d3748", borderRadius: "8px", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="Positive" fill="#4ecdc4" radius={4} />
                  <Bar dataKey="Negative" fill="#e74c3c" radius={4} />
                  <Bar dataKey="Neutral" fill="#95a5a6" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>
        </main>

        {/* Floating Chatbot Icon - Mobile Optimized */}
        <div
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center cursor-pointer shadow-2xl hover:scale-110 transition z-50"
          onClick={() => setShowChatbot(true)}
        >
          <MessageCircle size={28} className="sm:w-8 sm:h-8 text-white" />
        </div>

        {/* Chatbot Popup - Mobile Optimized */}
        {showChatbot && (
          <>
            {/* Mobile: Full Screen Overlay */}
            <div className="sm:hidden fixed inset-0 bg-[#1a1f29] z-50 flex flex-col">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 flex justify-between items-center">
                <h3 className="font-bold text-white text-lg">Ask Gemini</h3>
                <button 
                  onClick={() => setShowChatbot(false)} 
                  className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  <X size={24} />
                </button>
              </div>
              <div ref={chatRef} className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatMessages.length === 0 && (
                  <p className="text-gray-400 text-center text-sm">Ask anything about the 20 latest Reddit posts!</p>
                )}
                {chatMessages.map((m, i) => (
                  <div key={i} className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                    m.sender === "user"
                      ? "bg-orange-500 text-white ml-auto"
                      : "bg-[#2d3748] text-gray-200"
                  }`}>
                    {m.text}
                  </div>
                ))}
                {isSending && (
                  <div className="bg-[#2d3748] text-gray-200 px-4 py-2 rounded-2xl max-w-[85%] text-sm">
                    <span className="inline-block animate-pulse">Thinking...</span>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-[#2d3748] flex gap-2 bg-[#1a1f29]">
                <input
                  type="text"
                  placeholder="Type your question..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isSending && handleSend()}
                  disabled={isSending}
                  className="flex-1 bg-[#11141a] text-white px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || !userInput.trim()}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 rounded-lg font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isSending ? "..." : "Send"}
                </button>
              </div>
            </div>

            {/* Desktop: Bottom Right Popup */}
            <div className="hidden sm:block fixed bottom-24 right-6 w-96 h-[520px] bg-[#1a1f29] border border-[#2d3748] rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 flex justify-between items-center">
                <h3 className="font-bold text-white">Ask Gemini</h3>
                <button 
                  onClick={() => setShowChatbot(false)} 
                  className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>
              <div ref={chatRef} className="h-[380px] p-4 overflow-y-auto space-y-3">
                {chatMessages.length === 0 && (
                  <p className="text-gray-400 text-center text-sm">Ask anything about the 20 latest Reddit posts!</p>
                )}
                {chatMessages.map((m, i) => (
                  <div key={i} className={`max-w-xs px-4 py-2 rounded-2xl ${
                    m.sender === "user"
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
          </>
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