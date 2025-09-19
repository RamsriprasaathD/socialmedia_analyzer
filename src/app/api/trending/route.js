import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { computeTrending, recommendHashtags } from '../../lib/hashtagEngine.js';

const prisma = new PrismaClient();

export async function GET() {
  const posts = await prisma.post.findMany({
    include: { hashtags: { include: { hashtag: true } } }
  });

  const postData = posts.map(p => ({
    id: p.id,
    content: p.content,
    hashtags: p.hashtags.map(ph => ph.hashtag.tag)
  }));

  const { top, counts, co } = computeTrending(postData, 20);
  const recs = top.length ? recommendHashtags(top[0].tag, co, counts, 0.3, 3) : [];

  return NextResponse.json({ top, recs });
}
