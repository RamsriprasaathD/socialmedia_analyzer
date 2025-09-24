📊 Reddit Analytics Dashboard

A modern Next.js-powered dashboard that fetches Reddit posts, analyzes them, and presents insights with clean UI components.

🚀 Features

🔄 Fetch Reddit Posts via API route (/api/reddit)

📈 Metrics Calculation:

Total posts count

Total upvotes

Average score

Unique active authors

📝 Post Table: Displays latest Reddit posts (title, score, author)

🔥 Trending Hashtags: Extracts and counts hashtags from post titles

⚡ Auto Refresh: Fetches new posts every 10 minutes

🎨 Modern UI: Dark theme with responsive design

🛠️ Tech Stack

Frontend: Next.js, React, Tailwind CSS (inline styling here)

Backend API: Next.js API Routes (/api/reddit)

Icons: lucide-react

Data Processing: JavaScript (HashMaps, Array methods, recursion for extraction)

📂 Project Structure
/src
  /app
    page.js        # Main dashboard UI
  /pages/api
    reddit.js      # API to fetch Reddit posts

⚙️ How It Works
1️⃣ Data Fetching

The client (page.js) calls /api/reddit.

API fetches posts from Reddit (r/news/hot.json).

Data is normalized into { title, score, author }.

2️⃣ Dashboard Metrics Calculation

Located in calculateStats():

Total Posts → posts.length

Total Upvotes → reduce() over all post scores

Avg. Score → totalUpvotes / totalPosts

Active Authors → Unique authors via Set()

📌 All metrics use the full posts array, not just displayed posts.

3️⃣ Displaying Posts

UI shows only first 20 posts:

posts.slice(0, 20).map(...)


Even if 100 posts are fetched, the table limits display to 20.

4️⃣ Trending Hashtags

Extracted from post titles using a HashMap (object).

Example:

hashtags[word] = (hashtags[word] || 0) + 1;


Sorted by frequency and top 8 displayed.

5️⃣ Recursion

Used to safely extract nested JSON from Reddit API without breaking when fields are missing.

🧠 Caching & Fault Tolerance

Caching: Posts and hashtags are stored in React state (useState). Refresh happens every 10 minutes.

Fault Tolerance:

If fetch fails → shows "No posts available".

Invalid API response → falls back to empty array.

try/catch prevents app crashes.

📸 Screenshots

Dashboard Metrics (Total Posts, Upvotes, Avg. Score, Authors)

Latest Posts Table (20 rows)

Trending Hashtags Section

(Add screenshots here for clarity)

🚀 Getting Started
1. Clone Repo
git clone https://github.com/your-username/reddit-analytics-dashboard.git
cd reddit-analytics-dashboard

2. Install Dependencies
npm install

3. Run Locally
npm run dev


App will be live at http://localhost:3000
.

📌 Future Improvements

✅ Sentiment Analysis of posts

✅ Real-time notifications

✅ Export data (CSV/Excel)

✅ Advanced filtering & search

✅ Custom date ranges


Limitations:
1. API USAGE
2. API FETCH - 20 posts per fetch
3. Maintainance of .env file safely
👨‍💻 Author

Developed by Ramsriprasaath D


Output Screen:
<img width="1874" height="868" alt="image" src="https://github.com/user-attachments/assets/a8150aab-ce40-49d4-b691-635fd0f912a5" />


