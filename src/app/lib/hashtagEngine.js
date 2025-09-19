function computeTrending(posts, topN = 10) {
  const counts = new Map();
  const co = new Map();

  for (const post of posts) {
    const tags = post.hashtags || [];
    tags.forEach(t => counts.set(t, (counts.get(t) || 0) + 1));
    for (let i = 0; i < tags.length; i++) {
      for (let j = i + 1; j < tags.length; j++) {
        const a = tags[i], b = tags[j];
        if (!co.has(a)) co.set(a, new Map());
        if (!co.has(b)) co.set(b, new Map());
        co.get(a).set(b, (co.get(a).get(b) || 0) + 1);
        co.get(b).set(a, (co.get(b).get(a) || 0) + 1);
      }
    }
  }

  const sorted = [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0, topN);
  const top = sorted.map(([tag,count]) => ({ tag, count }));

  return { top, counts, co };
}

function recommendHashtags(targetTag, coMap, counts, threshold = 0.3, topK = 3) {
  const targetTotal = counts.get(targetTag) || 0;
  if (targetTotal === 0) return [];
  const related = [];
  const row = coMap.get(targetTag) || new Map();
  for (const [other, c] of row.entries()) {
    const rate = c / targetTotal;
    if (rate >= threshold) related.push({ tag: other, cooccurrence: c, rate });
  }
  related.sort((a,b)=>b.rate - a.rate);
  return related.slice(0, topK);
}

export { computeTrending, recommendHashtags };
