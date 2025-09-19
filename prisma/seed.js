const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.comment.deleteMany();
  await prisma.postHashtag.deleteMany();
  await prisma.hashtag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const u1 = await prisma.user.create({ data: { name: 'Alice' } });
  const u2 = await prisma.user.create({ data: { name: 'Bob' } });

  const tags = ['sports','music','news','football','concert'];
  const createdTags = {};
  for (const t of tags) {
    const h = await prisma.hashtag.create({ data: { tag: t } });
    createdTags[t] = h;
  }

  const p1 = await prisma.post.create({
    data: {
      content: 'Great match today! #sports #football',
      authorId: u1.id,
      hashtags: {
        create: [
          { hashtagId: createdTags['sports'].id },
          { hashtagId: createdTags['football'].id }
        ]
      }
    }
  });

  const p2 = await prisma.post.create({
    data: {
      content: 'Loved the concert last night. #music #concert',
      authorId: u2.id,
      hashtags: {
        create: [
          { hashtagId: createdTags['music'].id },
          { hashtagId: createdTags['concert'].id }
        ]
      }
    }
  });

  const p3 = await prisma.post.create({
    data: {
      content: 'Breaking: big news today. #news #sports',
      authorId: u1.id,
      hashtags: {
        create: [
          { hashtagId: createdTags['news'].id },
          { hashtagId: createdTags['sports'].id }
        ]
      }
    }
  });

  // Nested comments
  const c1 = await prisma.comment.create({
    data: { content: 'Wow!', authorId: u2.id, postId: p1.id }
  });
  const c2 = await prisma.comment.create({
    data: { content: 'Indeed!', authorId: u1.id, postId: p1.id, parentId: c1.id }
  });
  await prisma.comment.create({
    data: { content: 'Agree', authorId: u2.id, postId: p1.id, parentId: c2.id }
  });

  console.log('Seeding finished.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
