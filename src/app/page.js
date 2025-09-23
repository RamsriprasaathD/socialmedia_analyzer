"use client";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  Eye,
  Heart,
  Share2,
  TrendingUp,
  MessageCircle,
  Award,
  Clock,
} from "lucide-react";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [hashtags, setHashtags] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);

  // Function to fetch posts from your API
  const fetchRedditData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reddit");
      const data = await res.json();

      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setHashtags(data.hashtags && typeof data.hashtags === "object" ? data.hashtags : {});
      setLastFetched(new Date()); // ✅ Update timestamp
    } catch (error) {
      console.error("Error fetching Reddit data:", error);
      setPosts([]);
      setHashtags({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRedditData();

    const interval = setInterval(fetchRedditData, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, []);

  // Format timestamp nicely
  const formatTimestamp = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  // Calculate Reddit-specific stats from posts data
  const calculateStats = () => {
    if (!posts || posts.length === 0) {
      return [
        { label: "Total Posts", value: "0", icon: Eye, color: "#ff6b35" },
        { label: "Total Upvotes", value: "0", icon: TrendingUp, color: "#4ecdc4" },
        { label: "Avg. Score", value: "0", icon: Award, color: "#45b7d1" },
        { label: "Active Authors", value: "0", icon: Users, color: "#96ceb4" },
      ];
    }

    const totalPosts = posts.length;
    const totalUpvotes = posts.reduce((sum, post) => sum + (post.score ?? post.upvotes ?? 0), 0);
    const avgScore = totalPosts > 0 ? Math.round(totalUpvotes / totalPosts) : 0;
    const uniqueAuthors = new Set(posts.map(post => post.author).filter(Boolean)).size;

    return [
      { label: "Total Posts", value: totalPosts.toLocaleString(), icon: Eye, color: "#ff6b35" },
      { label: "Total Upvotes", value: totalUpvotes.toLocaleString(), icon: TrendingUp, color: "#4ecdc4" },
      { label: "Avg. Score", value: avgScore.toLocaleString(), icon: Award, color: "#45b7d1" },
      { label: "Active Authors", value: uniqueAuthors.toLocaleString(), icon: Users, color: "#96ceb4" },
    ];
  };

  const redditStats = calculateStats();

  return (
    <div style={{ 
      backgroundColor: "#0f1419", 
      minHeight: "100vh", 
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: "#ffffff"
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: "#1a1f29", 
        borderBottom: "1px solid #2d3748", 
        padding: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            background: "linear-gradient(135deg, #ff6b35, #f7931e)",
            padding: "8px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <BarChart3 size={24} color="white" />
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: "24px", 
            color: "#ffffff",
            background: "linear-gradient(135deg, #ff6b35, #f7931e)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Reddit Analytics Dashboard
          </h1>
        </div>
      </div>

      <div style={{ padding: "25px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Enhanced Stats */}
        <div style={{ marginBottom: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
            <TrendingUp size={20} color="#ff6b35" />
            <h2 style={{ color: "#ffffff", fontSize: "20px", margin: 0 }}>Reddit Metrics</h2>
          </div>
          <div style={{ 
            background: "linear-gradient(135deg, #1a1f29 0%, #2d3748 100%)", 
            border: "1px solid #4a5568", 
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
          }}>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
              gap: "20px" 
            }}>
              {redditStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div 
                    key={index} 
                    style={{ 
                      background: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "10px",
                      padding: "20px",
                      textAlign: "center",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "all 0.3s ease",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = `0 8px 25px rgba(${stat.color.slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.3)`;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "center", 
                      marginBottom: "10px" 
                    }}>
                      <div style={{
                        background: stat.color,
                        padding: "10px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <IconComponent size={20} color="white" />
                      </div>
                    </div>
                    <div style={{ color: "#a0aec0", fontSize: "14px", marginBottom: "5px" }}>{stat.label}</div>
                    <div style={{ fontSize: "28px", fontWeight: "bold", color: "#ffffff", marginBottom: "5px" }}>{stat.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "30px" }}>
          {/* Left Column */}
          <div style={{ flex: "1" }}>
            {/* Reddit Posts */}
            <div style={{ marginBottom: "30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MessageCircle size={20} color="#ff6b35" />
                  <h2 style={{ color: "#ffffff", fontSize: "20px", margin: 0 }}>Latest Reddit Posts</h2>
                </div>
                {/* ✅ Enhanced timestamp display */}
                {lastFetched && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Clock size={14} color="#a0aec0" />
                    <p style={{ color: "#a0aec0", fontSize: "13px", margin: 0 }}>
                      {formatTimestamp(lastFetched)}
                    </p>
                  </div>
                )}
              </div>
              <div style={{ 
                background: "linear-gradient(135deg, #1a1f29 0%, #2d3748 100%)", 
                border: "1px solid #4a5568", 
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
              }}>
                {isLoading ? (
                  <div style={{ 
                    textAlign: "center", 
                    padding: "40px",
                    color: "#a0aec0"
                  }}>
                    <div style={{ 
                      display: "inline-block",
                      width: "30px",
                      height: "30px",
                      border: "3px solid #4a5568",
                      borderTop: "3px solid #ff6b35",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }}></div>
                    <div style={{ marginTop: "15px" }}>Loading posts...</div>
                    <style>{`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>
                  </div>
                ) : posts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#a0aec0" }}>No posts available.</div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid #4a5568" }}>
                          <th style={{ textAlign: "left", padding: "12px", color: "#a0aec0", fontSize: "14px", fontWeight: "600" }}>#</th>
                          <th style={{ textAlign: "left", padding: "12px", color: "#a0aec0", fontSize: "14px", fontWeight: "600" }}>Title</th>
                          <th style={{ textAlign: "right", padding: "12px", color: "#a0aec0", fontSize: "14px", fontWeight: "600" }}>Score</th>
                          <th style={{ textAlign: "right", padding: "12px", color: "#a0aec0", fontSize: "14px", fontWeight: "600" }}>Author</th>
                        </tr>
                      </thead>
                      <tbody>
                        {posts.slice(0, 20).map((post, index) => (
                          <tr 
                            key={index} 
                            style={{ 
                              borderBottom: "1px solid #2d3748",
                              transition: "background-color 0.2s ease"
                            }}
                            onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = "rgba(255, 255, 255, 0.03)"}
                            onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = "transparent"}
                          >
                            <td style={{ padding: "15px 12px", fontSize: "14px", color: "#ff6b35", fontWeight: "600" }}>
                              {index + 1}
                            </td>
                            <td style={{ padding: "15px 12px", fontSize: "14px", fontWeight: "500", color: "#ffffff", maxWidth: "400px" }}>
                              <div style={{ 
                                overflow: "hidden", 
                                textOverflow: "ellipsis", 
                                whiteSpace: "nowrap" 
                              }}>
                                {post.title ?? "Untitled"}
                              </div>
                            </td>
                            <td style={{ 
                              padding: "15px 12px", 
                              fontSize: "14px", 
                              textAlign: "right",
                              color: "#4ecdc4",
                              fontWeight: "600"
                            }}>
                              {(post.score ?? post.upvotes ?? 0).toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: "15px 12px", 
                              fontSize: "14px", 
                              textAlign: "right", 
                              color: "#96ceb4"
                            }}>
                              u/{post.author ?? "unknown"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Trending Hashtags */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
                <div style={{ 
                  width: "20px", 
                  height: "20px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: "#ff6b35",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}>
                  #
                </div>
                <h3 style={{ color: "#ffffff", fontSize: "18px", margin: 0 }}>Trending Hashtags</h3>
              </div>
              <div style={{ 
                background: "linear-gradient(135deg, #1a1f29 0%, #2d3748 100%)", 
                border: "1px solid #4a5568", 
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
              }}>
                {isLoading ? (
                  <div style={{ color: "#a0aec0" }}>Loading hashtags...</div>
                ) : Object.keys(hashtags).length === 0 ? (
                  <div style={{ color: "#a0aec0" }}>No hashtags available.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {Object.entries(hashtags)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 8)
                      .map(([tag, count], index) => (
                        <div 
                          key={index} 
                          style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            padding: "10px 15px",
                            background: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "8px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "rgba(255, 107, 53, 0.1)";
                            e.target.style.borderColor = "#ff6b35";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "rgba(255, 255, 255, 0.05)";
                            e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                          }}
                        >
                          <span style={{ fontSize: "14px", color: "#ffffff" }}>#{tag}</span>
                          <span style={{ 
                            fontSize: "14px", 
                            color: "#4ecdc4", 
                            fontWeight: "600",
                            background: "rgba(78, 205, 196, 0.2)",
                            padding: "4px 8px",
                            borderRadius: "12px"
                          }}>
                            {count ?? 0}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ width: "320px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
              <Heart size={20} color="#ff6b35" />
              <h3 style={{ color: "#ffffff", fontSize: "18px", margin: 0 }}>Analytics Insights</h3>
            </div>
            <div style={{ 
              background: "linear-gradient(135deg, #1a1f29 0%, #2d3748 100%)", 
              border: "1px solid #4a5568", 
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
            }}>
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ color: "#4ecdc4", fontSize: "16px", margin: "0 0 10px 0" }}>Coming Soon</h4>
                <p style={{ color: "#a0aec0", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                  • Sentiment analysis<br/>
                  • Real-time notifications<br/>
                  • Advanced filtering<br/>
                  • Export capabilities<br/>
                  • Custom date ranges
                </p>
              </div>
              
              {posts.length > 0 && (
                <div>
                  <h4 style={{ color: "#96ceb4", fontSize: "16px", margin: "0 0 10px 0" }}>Quick Stats</h4>
                  <div style={{ color: "#a0aec0", fontSize: "13px", lineHeight: "1.8" }}>
                    <div>Highest scoring post: <span style={{ color: "#4ecdc4", fontWeight: "600" }}>
                      {Math.max(...posts.map(p => p.score ?? p.upvotes ?? 0)).toLocaleString()}
                    </span></div>
                    <div>Most active author: <span style={{ color: "#96ceb4", fontWeight: "600" }}>
                      {(() => {
                        const authorCounts = posts.reduce((acc, post) => {
                          if (post.author) {
                            acc[post.author] = (acc[post.author] || 0) + 1;
                          }
                          return acc;
                        }, {});
                        const topAuthor = Object.keys(authorCounts).reduce((a, b) => 
                          authorCounts[a] > authorCounts[b] ? a : b, 'unknown'
                        );
                        return `u/${topAuthor}`;
                      })()}
                    </span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hash icon component (since it's not in lucide-react)
function Hash({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>
    </svg>
  );
}