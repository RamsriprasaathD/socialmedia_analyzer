// src/lib/redditFetcher.js
export async function getRedditAccessToken() {
  const basicAuth = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!data.access_token) {
    console.error("Reddit Auth Error:", data);
    throw new Error("Failed to get Reddit access token");
  }
  return data.access_token;
}

export async function fetchRedditPosts(subreddit = "news") {
  try {
    const token = await getRedditAccessToken();

    const res = await fetch(
      `https://oauth.reddit.com/r/${subreddit}/hot?limit=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": process.env.REDDIT_USER_AGENT,
        },
      }
    );

    const data = await res.json();
    if (!data.data || !data.data.children) {
      console.error("Invalid Reddit Response:", data);
      return [];
    }

    const posts = data.data.children.map((child) => ({
      title: child.data.title,
      url: `https://reddit.com${child.data.permalink}`,
      score: child.data.score,
      author: child.data.author,
    }));

    return posts;
  } catch (error) {
    console.error("Reddit Fetch Error:", error);
    return [];
  }
}

// Extract pseudo-hashtags (keywords)
export function extractHashtags(posts) {
  const words = posts
    .flatMap((p) => p.title.split(/\s+/))
    .map((w) => w.replace(/[^a-zA-Z0-9#]/g, "").toLowerCase())
    .filter((w) => w.length > 4);

  const freq = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => `#${word}`);
}
