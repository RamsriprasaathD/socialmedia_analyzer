// src/app/api/reddit/route.js
import { fetchRedditPosts, extractHashtags } from "../../lib/redditFetcher";


export async function GET() {
  try {
    const posts = await fetchRedditPosts("news"); // change subreddit if needed
    const hashtags = extractHashtags(posts);

    return Response.json({ posts, hashtags });
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ posts: [], hashtags: [] }, { status: 500 });
  }
}
