"use client";
import { useEffect, useState } from "react";
import { TrendingUp, MessageSquare, Settings, BarChart3, Users, Eye, Heart, Share2 } from "lucide-react";

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
    <div style={{backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif'}}>
      {/* Simple Header */}
      <div style={{backgroundColor: 'white', borderBottom: '1px solid #ddd', padding: '15px 20px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <BarChart3 size={24} color="#333" />
          <h1 style={{margin: 0, fontSize: '20px', color: '#333'}}>Social Analytics Dashboard</h1>
        </div>
      </div>

      <div style={{padding: '20px', maxWidth: '1200px', margin: '0 auto'}}>
        
        {/* Stats Section */}
        <div style={{marginBottom: '25px'}}>
          <h2 style={{color: '#333', fontSize: '18px', marginBottom: '10px'}}>Stats Overview</h2>
          <div style={{backgroundColor: 'white', border: '1px solid #ccc', padding: '15px'}}>
            <div style={{display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px'}}>
              {mockStats.map((stat, index) => (
                <div key={index} style={{textAlign: 'center', minWidth: '120px'}}>
                  <div style={{color: '#666', fontSize: '13px', marginBottom: '5px'}}>{stat.label}</div>
                  <div style={{fontSize: '22px', fontWeight: 'bold', color: '#333', marginBottom: '3px'}}>{stat.value}</div>
                  <div style={{color: '#28a745', fontSize: '12px'}}>{stat.change}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{display: 'flex', gap: '25px'}}>
          
          {/* Left Column */}
          <div style={{flex: '1'}}>
            {/* Trending Hashtags */}
            <div style={{marginBottom: '25px'}}>
              <h2 style={{color: '#333', fontSize: '18px', marginBottom: '10px'}}>
                Trending Hashtags
              </h2>
              <div style={{backgroundColor: 'white', border: '1px solid #ddd', padding: '15px'}}>
                {isLoading ? (
                  <div>Loading trending data...</div>
                ) : (
                  <>
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                      <thead>
                        <tr style={{borderBottom: '1px solid #eee'}}>
                          <th style={{textAlign: 'left', padding: '8px', color: '#666', fontSize: '14px'}}>#</th>
                          <th style={{textAlign: 'left', padding: '8px', color: '#666', fontSize: '14px'}}>Hashtag</th>
                          <th style={{textAlign: 'right', padding: '8px', color: '#666', fontSize: '14px'}}>Count</th>
                          <th style={{textAlign: 'right', padding: '8px', color: '#666', fontSize: '14px'}}>Growth</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockTrendingData.map((item, index) => (
                          <tr key={index} style={{borderBottom: '1px solid #f5f5f5'}}>
                            <td style={{padding: '10px 8px', fontSize: '14px'}}>{index + 1}</td>
                            <td style={{padding: '10px 8px', fontSize: '14px', fontWeight: '500'}}>{item.hashtag}</td>
                            <td style={{padding: '10px 8px', fontSize: '14px', textAlign: 'right'}}>{item.count.toLocaleString()}</td>
                            <td style={{padding: '10px 8px', fontSize: '14px', textAlign: 'right', color: '#28a745'}}>{item.growth}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {trending && (
                      <details style={{marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef'}}>
                        <summary style={{cursor: 'pointer', fontSize: '14px', color: '#666'}}>API Response Data</summary>
                        <pre style={{fontSize: '12px', color: '#333', marginTop: '10px', overflow: 'auto'}}>
                          {JSON.stringify(trending, null, 2)}
                        </pre>
                      </details>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Text Processing */}
            <div>
              <h3 style={{color: '#333', fontSize: '16px', marginBottom: '10px'}}>
                Text Processing Engine
              </h3>
              <div style={{backgroundColor: 'white', border: '1px solid #ddd', padding: '15px'}}>
                {isLoading ? (
                  <div>Loading processing data...</div>
                ) : (
                  <>
                    <p style={{margin: '0 0 10px 0', fontSize: '14px'}}>
                      <strong>Status:</strong> <span style={{backgroundColor: '#d4edda', color: '#155724', padding: '2px 6px', fontSize: '12px'}}>Active</span>
                    </p>
                    <p style={{margin: '0 0 10px 0', fontSize: '14px'}}>
                      <strong>Items Processed:</strong> 1,247
                    </p>
                    <p style={{margin: '0 0 10px 0', fontSize: '14px'}}>
                      <strong>Current Accuracy:</strong> <span style={{color: '#007bff', fontWeight: 'bold'}}>94.2%</span>
                    </p>
                    
                    {preprocess && (
                      <details style={{marginTop: '10px', fontSize: '12px'}}>
                        <summary style={{cursor: 'pointer', color: '#666'}}>View API Data</summary>
                        <pre style={{fontSize: '11px', marginTop: '5px', overflow: 'auto', maxHeight: '100px', backgroundColor: '#f8f9fa', padding: '8px'}}>
                          {JSON.stringify(preprocess, null, 2)}
                        </pre>
                      </details>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{width: '300px'}}>
            {/* Comment Analysis */}
            <div>
              <h3 style={{color: '#333', fontSize: '16px', marginBottom: '10px'}}>
                Comment Sentiment Analysis
              </h3>
              <div style={{backgroundColor: 'white', border: '1px solid #ddd', padding: '15px'}}>
                {isLoading ? (
                  <div>Loading comments...</div>
                ) : (
                  <>
                    <div style={{marginBottom: '15px'}}>
                      <p style={{margin: '0 0 8px 0', fontSize: '14px'}}>
                        <span style={{color: '#28a745', fontWeight: 'bold'}}>Positive:</span> 72% (1,854 comments)
                      </p>
                      <p style={{margin: '0 0 8px 0', fontSize: '14px'}}>
                        <span style={{color: '#007bff', fontWeight: 'bold'}}>Neutral:</span> 21% (539 comments)
                      </p>
                      <p style={{margin: '0 0 8px 0', fontSize: '14px'}}>
                        <span style={{color: '#dc3545', fontWeight: 'bold'}}>Negative:</span> 7% (179 comments)
                      </p>
                    </div>
                    
                    <div style={{fontSize: '13px', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px'}}>
                      <p style={{margin: '0 0 5px 0'}}>Total Comments: 2,572</p>
                      <p style={{margin: '0 0 5px 0'}}>Analysis Updated: 2 min ago</p>
                    </div>
                    
                    {comments && (
                      <details style={{marginTop: '10px', fontSize: '12px'}}>
                        <summary style={{cursor: 'pointer', color: '#666'}}>Raw API Response</summary>
                        <pre style={{fontSize: '11px', marginTop: '5px', overflow: 'auto', maxHeight: '100px', backgroundColor: '#f8f9fa', padding: '8px'}}>
                          {JSON.stringify(comments, null, 2)}
                        </pre>
                      </details>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}