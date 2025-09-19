"use client";
import { useEffect, useState } from "react";
import { TrendingUp, MessageSquare, Settings, BarChart3, Users, Eye, Heart, Share2, Hash, Calendar, Filter, Download, RefreshCw } from "lucide-react";

export default function Home() {
  const [trending, setTrending] = useState(null);
  const [comments, setComments] = useState(null);
  const [preprocess, setPreprocess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch trending hashtags
        const trendingRes = await fetch("/api/trending");
        const trendingData = await trendingRes.json();
        setTrending(trendingData);

        // Fetch comment analysis
        const commentsRes = await fetch("/api/analyze-comments?postId=1");
        const commentsData = await commentsRes.json();
        setComments(commentsData);

        // Example preprocessing call
        const preprocessRes = await fetch("/api/preprocess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: "Hello World!! #AI #Trends" }),
        });
        const preprocessData = await preprocessRes.json();
        setPreprocess(preprocessData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const mockTrendingData = [
    { hashtag: "#AI", count: 15420, growth: "+12%" },
    { hashtag: "#Marketing", count: 8930, growth: "+8%" },
    { hashtag: "#Innovation", count: 7650, growth: "+15%" },
    { hashtag: "#Technology", count: 6840, growth: "+5%" },
    { hashtag: "#Business", count: 5920, growth: "+22%" }
  ];

  const mockStats = [
    { label: "Total Reach", value: "2.4M", icon: Eye, change: "+14%" },
    { label: "Engagement", value: "186K", icon: Heart, change: "+8%" },
    { label: "Followers", value: "45.2K", icon: Users, change: "+12%" },
    { label: "Shares", value: "12.8K", icon: Share2, change: "+18%" }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b border-gray-300 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-blue-600 rounded flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-800">
                Social Analytics Pro
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors">
                <Filter className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {mockStats.map((stat, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-emerald-600 text-sm mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </p>
                </div>
                <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Trending Hashtags */}
          <div className="xl:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Trending Hashtags</h2>
                      <p className="text-gray-500 text-sm">Real-time hashtag performance</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Last 24h</span>
                  </div>
                </div>
              </div>
              <div className="p-5">
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center justify-between p-3 bg-gray-100 rounded">
                          <div className="flex items-center space-x-3">
                            <div className="w-7 h-7 bg-gray-300 rounded-full"></div>
                            <div className="h-4 bg-gray-300 rounded w-20"></div>
                          </div>
                          <div className="h-4 bg-gray-300 rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mockTrendingData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded border border-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {index + 1}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Hash className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-900 font-medium">{item.hashtag}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900 font-medium">{item.count.toLocaleString()}</p>
                          <p className="text-emerald-600 text-sm">{item.growth}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {trending && !isLoading && (
                  <div className="mt-4 p-3 bg-gray-100 rounded border">
                    <h4 className="text-gray-900 font-medium mb-2">API Response:</h4>
                    <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                      {JSON.stringify(trending, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Comment Analysis */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Comment Analysis</h3>
                    <p className="text-gray-500 text-sm">Sentiment & engagement metrics</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                {isLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Positive</span>
                        <span className="text-emerald-600 font-medium">72%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{width: '72%'}}></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Neutral</span>
                        <span className="text-blue-600 font-medium">21%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '21%'}}></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Negative</span>
                        <span className="text-red-500 font-medium">7%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: '7%'}}></div>
                      </div>
                    </div>
                    {comments && (
                      <div className="mt-4 p-3 bg-gray-100 rounded border">
                        <pre className="text-xs text-gray-600 overflow-auto max-h-28">
                          {JSON.stringify(comments, null, 2)}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Preprocessing Engine */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Preprocessing Engine</h3>
                    <p className="text-gray-500 text-sm">Text analysis & cleaning</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                {isLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processed</span>
                        <span className="text-gray-900">1,247 items</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Accuracy</span>
                        <span className="text-blue-600">94.2%</span>
                      </div>
                    </div>
                    {preprocess && (
                      <div className="p-3 bg-gray-100 rounded border">
                        <pre className="text-xs text-gray-600 overflow-auto max-h-28">
                          {JSON.stringify(preprocess, null, 2)}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}