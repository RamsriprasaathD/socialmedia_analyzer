import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { buildTree, maxDepth, findViralChains } from '../../lib/commentAnalyzer.js';


const prisma = new PrismaClient();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const postId = parseInt(searchParams.get('postId') || '1', 10);

  const comments = await prisma.comment.findMany({ where: { postId } });
  const roots = buildTree(comments);
  const depths = roots.map(r => ({ rootId: r.id, depth: maxDepth(r) }));
  const chains = findViralChains(roots, 3);

  return NextResponse.json({ depths, chains });
}
