"use client";
import { useEffect, useState } from "react";

export default function PreprocessingEngine() {
  const [trending, setTrending] = useState(null);
  const [comments, setComments] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const trendRes = await fetch("/api/trending");
      const trendData = await trendRes.json();
      setTrending(trendData);

      const commentRes = await fetch("/api/analyze-comments?postId=1");
      const commentData = await commentRes.json();
      setComments(commentData);
    }
    fetchData();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">⚙️ Preprocessing Engine</h1>

      {/* Hashtag Engine */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold">Trending Hashtags</h2>
        {trending ? (
          <>
            <ul className="list-disc ml-6">
              {trending.top.map((t, idx) => (
                <li key={idx}>{t.tag} → {t.count}</li>
              ))}
            </ul>
            <h3 className="mt-2 font-medium">Recommendations:</h3>
            <ul className="list-disc ml-6">
              {trending.recs.map((r, idx) => (
                <li key={idx}>{r.tag} (co-occurrence: {r.cooccurrence}, rate: {r.rate})</li>
              ))}
            </ul>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </section>

      {/* Comment Analyzer */}
      <section>
        <h2 className="text-xl font-semibold">Comment Thread Analysis</h2>
        {comments ? (
          <>
            <h3 className="mt-2 font-medium">Depths:</h3>
            <ul className="list-disc ml-6">
              {comments.depths.map((d, idx) => (
                <li key={idx}>Root Comment {d.rootId} → Depth {d.depth}</li>
              ))}
            </ul>
            <h3 className="mt-2 font-medium">Viral Chains:</h3>
            <ul className="list-disc ml-6">
              {comments.chains.map((c, idx) => (
                <li key={idx}>{c.join(" → ")}</li>
              ))}
            </ul>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </section>
    </main>
  );
}
