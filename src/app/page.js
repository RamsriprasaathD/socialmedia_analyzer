"use client";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  Eye,
  Heart,
  Share2,
} from "lucide-react";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [hashtags, setHashtags] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch posts from your API
  const fetchRedditData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reddit");
      const data = await res.json();

      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setHashtags(data.hashtags && typeof data.hashtags === "object" ? data.hashtags : {});
    } catch (error) {
      console.error("Error fetching Reddit data:", error);
      setPosts([]);
      setHashtags({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initially
    fetchRedditData();

    // Fetch every second
    const interval = setInterval(fetchRedditData, 6000000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  const mockStats = [
    { label: "Total Reach", value: "2.4M", icon: Eye, change: "+14%" },
    { label: "Engagement", value: "186K", icon: Heart, change: "+8%" },
    { label: "Followers", value: "45.2K", icon: Users, change: "+12%" },
    { label: "Shares", value: "12.8K", icon: Share2, change: "+18%" },
  ];

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ backgroundColor: "white", borderBottom: "1px solid #ddd", padding: "15px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <BarChart3 size={24} color="#333" />
          <h1 style={{ margin: 0, fontSize: "20px", color: "#333" }}>Social Analytics Dashboard</h1>
        </div>
      </div>

      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ marginBottom: "25px" }}>
          <h2 style={{ color: "#333", fontSize: "18px", marginBottom: "10px" }}>Stats Overview</h2>
          <div style={{ backgroundColor: "white", border: "1px solid #ccc", padding: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "20px" }}>
              {mockStats.map((stat, index) => (
                <div key={index} style={{ textAlign: "center", minWidth: "120px" }}>
                  <div style={{ color: "#666", fontSize: "13px", marginBottom: "5px" }}>{stat.label}</div>
                  <div style={{ fontSize: "22px", fontWeight: "bold", color: "#333", marginBottom: "3px" }}>{stat.value}</div>
                  <div style={{ color: "#28a745", fontSize: "12px" }}>{stat.change}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "25px" }}>
          {/* Left Column */}
          <div style={{ flex: "1" }}>
            {/* Reddit Posts */}
            <div style={{ marginBottom: "25px" }}>
              <h2 style={{ color: "#333", fontSize: "18px", marginBottom: "10px" }}>Latest Reddit Posts</h2>
              <div style={{ backgroundColor: "white", border: "1px solid #ddd", padding: "15px" }}>
                {isLoading ? (
                  <div>Loading posts...</div>
                ) : posts.length === 0 ? (
                  <div>No posts available.</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <th style={{ textAlign: "left", padding: "8px", color: "#666", fontSize: "14px" }}>#</th>
                        <th style={{ textAlign: "left", padding: "8px", color: "#666", fontSize: "14px" }}>Title</th>
                        <th style={{ textAlign: "right", padding: "8px", color: "#666", fontSize: "14px" }}>Upvotes</th>
                        <th style={{ textAlign: "right", padding: "8px", color: "#666", fontSize: "14px" }}>Author</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.slice(0, 5).map((post, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #f5f5f5" }}>
                          <td style={{ padding: "10px 8px", fontSize: "14px" }}>{index + 1}</td>
                          <td style={{ padding: "10px 8px", fontSize: "14px", fontWeight: "500" }}>
                            {post.title ?? "Untitled"}
                          </td>
                          <td style={{ padding: "10px 8px", fontSize: "14px", textAlign: "right" }}>
                            {(post.score ?? 0).toLocaleString()}
                          </td>
                          <td style={{ padding: "10px 8px", fontSize: "14px", textAlign: "right", color: "#28a745" }}>
                            u/{post.author ?? "unknown"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Trending Hashtags */}
            <div>
              <h3 style={{ color: "#333", fontSize: "16px", marginBottom: "10px" }}>Trending Hashtags</h3>
              <div style={{ backgroundColor: "white", border: "1px solid #ddd", padding: "15px" }}>
                {isLoading ? (
                  <div>Loading hashtags...</div>
                ) : Object.keys(hashtags).length === 0 ? (
                  <div>No hashtags available.</div>
                ) : (
                  <ul style={{ paddingLeft: "20px" }}>
                    {Object.entries(hashtags)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([tag, count], index) => (
                        <li key={index} style={{ fontSize: "14px", marginBottom: "5px" }}>
                          {tag} — <strong>{count ?? 0}</strong>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ width: "300px" }}>
            <h3 style={{ color: "#333", fontSize: "16px", marginBottom: "10px" }}>Coming Soon</h3>
            <div style={{ backgroundColor: "white", border: "1px solid #ddd", padding: "15px" }}>
              Sentiment analysis & more!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
