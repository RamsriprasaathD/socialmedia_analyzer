function buildTree(comments) {
  const byId = new Map();
  comments.forEach(c => byId.set(c.id, { ...c, replies: [] }));
  const roots = [];
  for (const node of byId.values()) {
    if (node.parentId) {
      const p = byId.get(node.parentId);
      if (p) p.replies.push(node);
      else roots.push(node);
    } else roots.push(node);
  }
  return roots;
}

function maxDepth(node) {
  if (!node.replies || node.replies.length === 0) return 1;
  let best = 0;
  for (const r of node.replies) best = Math.max(best, maxDepth(r));
  return 1 + best;
}

function findViralChains(roots, minDepth = 3) {
  const chains = [];
  function dfs(node, path) {
    path.push(node);
    if (!node.replies || node.replies.length === 0) {
      if (path.length >= minDepth) {
        chains.push(path.map(p => ({ id: p.id, content: p.content })));
      }
    } else {
      for (const r of node.replies) dfs(r, [...path]);
    }
  }
  for (const r of roots) dfs(r, []);
  return chains;
}

export { buildTree, maxDepth, findViralChains };
