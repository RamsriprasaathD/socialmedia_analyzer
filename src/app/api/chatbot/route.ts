import { NextResponse } from "next/server";

/**
 * POST /api/chatbot
 * Uses Groq API (FREE & SUPER FAST!)
 */
export async function POST(req: Request) {
  console.log("=== CHATBOT API CALLED ===");
  
  try {
    const body = await req.json();
    const { userQuestion, newsData } = body;

    console.log("📩 Request received:", {
      question: userQuestion?.substring(0, 50),
      postsCount: newsData?.length
    });

    // Validate input
    if (!userQuestion || !newsData || !Array.isArray(newsData) || newsData.length === 0) {
      return NextResponse.json(
        { reply: "Please provide both a question and news data." },
        { status: 400 }
      );
    }

    // Load Groq API key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("❌ GROQ_API_KEY not found");
      return NextResponse.json(
        { reply: "Chatbot is not configured yet. Please add GROQ_API_KEY environment variable in Vercel settings." },
        { status: 503 }
      );
    }

    console.log("✅ Groq API Key loaded");

    // Construct the prompt with Reddit posts
    const postsSummary = newsData
      .slice(0, 20)
      .map((post: { title?: string; author?: string; score?: number }, i: number) => 
        `${i + 1}. "${post.title || "Untitled"}" by u/${post.author || "Unknown"} (Score: ${post.score || 0})`
      )
      .join("\n");

    const systemPrompt = `You are a helpful AI assistant analyzing Reddit posts. 
Answer questions based on the provided posts concisely (2-4 sentences).
Reference specific post numbers when relevant.
If the question is unrelated to the posts, politely explain you can only discuss the current Reddit posts.`;

    const userPrompt = `Here are the latest 20 Reddit posts:
${postsSummary}

User question: "${userQuestion}"`;

    console.log("📝 Prompt created");

    // Call Groq API
    const url = "https://api.groq.com/openai/v1/chat/completions";
    
    const requestBody = {
      model: "llama-3.1-8b-instant", // Free & fast model
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1
    };

    console.log("🌐 Calling Groq API...");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📡 Groq response status:", response.status);

    const responseText = await response.text();
    console.log("📦 Raw response (first 300 chars):", responseText.substring(0, 300));

    if (!response.ok) {
      console.error("❌ Groq API Error:", responseText);
      return NextResponse.json(
        { reply: `Groq API error (${response.status}). Please check your API key at https://console.groq.com` },
        { status: 500 }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Failed to parse JSON");
      return NextResponse.json(
        { reply: "Received invalid response from Groq." },
        { status: 500 }
      );
    }

    console.log("📦 Parsed response structure:", {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length
    });

    // Extract AI response
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      console.error("❌ No reply found in response:", JSON.stringify(data));
      return NextResponse.json(
        { reply: "Groq returned an empty response. Please try again." },
        { status: 500 }
      );
    }

    console.log("✅ Success! Reply length:", reply.length);
    console.log("=== END CHATBOT API ===");

    return NextResponse.json({ reply: reply.trim() });

  } catch (error: any) {
    console.error("💥 FATAL ERROR:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return NextResponse.json(
      { reply: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * GET route for testing
 */
export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;
  return NextResponse.json({ 
    message: "✅ Chatbot route is working",
    usingProvider: "Groq (FREE & FAST)",
    model: "llama-3.1-8b-instant",
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    timestamp: new Date().toISOString()
  });
}