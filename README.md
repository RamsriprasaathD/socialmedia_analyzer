Social Analytics Dashboard
Overview

The Social Analytics Dashboard is a web app built with Next.js and React that shows live Reddit posts and trending hashtags. It updates automatically to keep the dashboard fresh and informative.

Application Flow

User opens the dashboard

The frontend loads the layout and styling.

Dashboard requests Reddit data

The client calls the /api/reddit API route.

API fetches Reddit posts

The backend uses Reddit OAuth to get an access token.

It then fetches the top posts from a chosen subreddit (e.g., news).

Hashtags are extracted

The backend scans post titles and finds the most common words (pseudo-hashtags).

Data is returned to the frontend

Posts and trending hashtags are sent as JSON to the client.

Frontend displays data

Posts are shown in a table with title, author, and upvotes.

Trending hashtags are listed.

Stats like reach, engagement, and followers are displayed (mock data).

Real-time updates

The dashboard automatically calls the API every second to fetch fresh posts and hashtags.

The table and hashtag list update automatically without page reload.

Key Components

Frontend (React + Next.js)

Handles UI, periodic updates, and displaying posts/hashtags.

API Route (/api/reddit)

Talks to Reddit using OAuth.

Formats posts and extracts hashtags.

Reddit Fetcher (redditFetcher.js)

Handles authentication, fetching posts, and hashtag extraction logic.

Environment Variables

Store Reddit credentials (CLIENT_ID, CLIENT_SECRET, USER_AGENT).











This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
