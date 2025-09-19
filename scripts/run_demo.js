import { PrismaClient } from '@prisma/client';
import { computeTrending, recommendHashtags } from '../src/lib/hashtagEngine.js';
import { buildTree, findViralChains } from '../src/lib/commentAnalyzer.js';

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    include: { hashtags: { include: { hashtag: true } } }
  });
  const postData = posts.map(p => ({ id: p.id, hashtags: p.hashtags.map(ph => ph.hashtag.tag) }));
  const { top, counts, co } = computeTrending(postData);
  console.log('Top hashtags:', top);
  if (top[0]) {
    console.log('Recommendations for', top[0].tag, recommendHashtags(top[0].tag, co, counts, 0.3));
  }

  const comments = await prisma.comment.findMany();
  const roots = buildTree(comments);
  console.log('Viral chains:', findViralChains(roots, 3));

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
