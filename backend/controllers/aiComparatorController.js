import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";

// ═══════════════════════════════════════════════════════════
//  AI UTILITY FUNCTIONS (no external deps needed)
// ═══════════════════════════════════════════════════════════

/** Tokenise text into lowercase words, removing stopwords */
const STOPWORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","are","was","were","it","its","this","that","be","as",
  "has","have","had","do","does","did","not","no","so","if","then","than",
  "can","will","would","could","should","may","might","must",
]);

function tokenise(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** Build TF-IDF vectors for a corpus of documents */
function buildTFIDF(docs) {
  const N = docs.length;
  const df = {}; // document frequency per term

  // 1) Count document frequency
  docs.forEach((tokens) => {
    const unique = new Set(tokens);
    unique.forEach((t) => { df[t] = (df[t] || 0) + 1; });
  });

  // 2) Build TF-IDF vector for each doc
  return docs.map((tokens) => {
    const tf = {};
    tokens.forEach((t) => { tf[t] = (tf[t] || 0) + 1; });
    const len = tokens.length || 1;
    const vec = {};
    Object.keys(tf).forEach((t) => {
      const tfScore  = tf[t] / len;
      const idfScore = Math.log((N + 1) / ((df[t] || 0) + 1)) + 1;
      vec[t] = tfScore * idfScore;
    });
    return vec;
  });
}

/** Cosine similarity between two sparse vectors (plain objects) */
function cosineSimilarity(vecA, vecB) {
  const keysA = Object.keys(vecA);
  if (keysA.length === 0) return 0;

  let dot = 0, magA = 0, magB = 0;
  const bKeys = new Set(Object.keys(vecB));

  keysA.forEach((k) => {
    magA += vecA[k] ** 2;
    if (bKeys.has(k)) dot += vecA[k] * vecB[k];
  });
  Object.keys(vecB).forEach((k) => { magB += vecB[k] ** 2; });

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

/** Normalise a value to [0,1] given min/max */
const norm = (val, min, max) => (max === min ? 0.5 : (val - min) / (max - min));

/**
 * Build a numeric feature vector for a product.
 * [normalised_price, rating/5, stock_binary]
 */
function numericVector(product, pMin, pMax) {
  return [
    norm(product.price || 0, pMin, pMax),
    (product.rating || 0) / 5,
    product.countInStock > 0 ? 1 : 0,
  ];
}

/** Euclidean distance between two numeric vectors */
function euclidean(a, b) {
  return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
}

/**
 * Simple k-means clustering on {id, vec} points.
 * Returns array of cluster-id per input point.
 */
function kMeans(points, k = 5, maxIter = 20) {
  if (points.length <= k) return points.map((_, i) => i);

  // Initialise centroids by picking k evenly-spaced points
  let centroids = Array.from({ length: k }, (_, i) =>
    [...points[Math.floor((i * points.length) / k)].vec]
  );

  let assignments = new Array(points.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // Assign
    const newAssignments = points.map(({ vec }) => {
      let minDist = Infinity, best = 0;
      centroids.forEach((c, ci) => {
        const d = euclidean(vec, c);
        if (d < minDist) { minDist = d; best = ci; }
      });
      return best;
    });

    if (newAssignments.join(",") === assignments.join(",")) break;
    assignments = newAssignments;

    // Recompute centroids
    centroids = centroids.map((_, ci) => {
      const members = points.filter((_, i) => assignments[i] === ci);
      if (members.length === 0) return centroids[ci];
      const dim = members[0].vec.length;
      return Array.from({ length: dim }, (__, d) =>
        members.reduce((s, m) => s + m.vec[d], 0) / members.length
      );
    });
  }

  return assignments;
}

/** CLUSTER LABELS for the frontend */
const CLUSTER_THEMES = [
  { label: "💰 Budget",        color: "bg-emerald-500" },
  { label: "⚡ Performance",   color: "bg-blue-500" },
  { label: "⭐ Top Rated",     color: "bg-yellow-500" },
  { label: "🔋 High Value",    color: "bg-purple-500" },
  { label: "🆙 Premium",       color: "bg-rose-500" },
];

// ═══════════════════════════════════════════════════════════
//  CONTROLLER 1: AI Similar Products
//  GET /api/products/:id/ai-similar?limit=8
// ═══════════════════════════════════════════════════════════
const getAISimilarProducts = asyncHandler(async (req, res) => {
  const { id }    = req.params;
  const limit     = parseInt(req.query.limit) || 8;

  // Load seed product
  const seed = await Product.findById(id).populate("category");
  if (!seed) return res.status(404).json({ message: "Product not found" });

  // Load candidate pool: same category first, then all
  let candidates = await Product.find({ _id: { $ne: id }, category: seed.category })
    .populate("category")
    .lean();

  // If fewer than 5 same-category, fall back to all products
  if (candidates.length < 5) {
    candidates = await Product.find({ _id: { $ne: id } }).populate("category").lean();
  }

  if (candidates.length === 0) return res.json({ similar: [], clusters: [] });

  // ── TF-IDF on name + description ──────────────────────────
  const seedTokens   = tokenise(`${seed.name} ${seed.description || ""} ${seed.brand || ""}`);
  const candTokens   = candidates.map((p) =>
    tokenise(`${p.name} ${p.description || ""} ${p.brand || ""}`)
  );
  const allDocs      = [seedTokens, ...candTokens];
  const tfidfVecs    = buildTFIDF(allDocs);
  const seedTF       = tfidfVecs[0];
  const candTFs      = tfidfVecs.slice(1);

  // ── Price range for normalisation ─────────────────────────
  const prices  = [seed.price, ...candidates.map((p) => p.price || 0)];
  const pMin    = Math.min(...prices);
  const pMax    = Math.max(...prices);
  const seedNum = numericVector(seed, pMin, pMax);

  // ── Score each candidate ───────────────────────────────────
  const scored = candidates.map((cand, i) => {
    const textSim    = cosineSimilarity(seedTF, candTFs[i]);
    const candNum    = numericVector(cand, pMin, pMax);

    // Numeric similarity: inverse of euclidean distance (max 1)
    const numDist    = euclidean(seedNum, candNum);
    const numSim     = 1 / (1 + numDist);

    // Bonuses
    const sameBrand  = (cand.brand || "").toLowerCase() === (seed.brand || "").toLowerCase() ? 0.1 : 0;
    const sameCat    = String(cand.category?._id) === String(seed.category?._id) ? 0.15 : 0;
    const priceDiff  = Math.abs((cand.price || 0) - (seed.price || 0));
    const priceBonus = priceDiff < seed.price * 0.3 ? 0.1 : 0; // within 30% price

    const finalScore = Math.min(
      0.5 * textSim + 0.3 * numSim + sameBrand + sameCat + priceBonus,
      1
    );

    return {
      ...cand,
      _similarity: parseFloat(finalScore.toFixed(3)),
      _textSim: parseFloat(textSim.toFixed(3)),
      _numSim: parseFloat(numSim.toFixed(3)),
    };
  });

  // Sort by score descending, take top `limit`
  const topSimilar = scored
    .sort((a, b) => b._similarity - a._similarity)
    .slice(0, limit);

  // ── K-Means clustering on ALL candidates (for cluster strip) ─
  const K = Math.min(5, candidates.length);
  const clusterPoints = candidates.map((p, i) => ({
    id: String(p._id),
    vec: [
      norm(p.price || 0, pMin, pMax),
      (p.rating || 0) / 5,
      p.countInStock > 0 ? 1 : 0,
    ],
  }));
  const assignments = kMeans(clusterPoints, K);

  // Attach cluster info to top similar
  const candIdToCluster = {};
  candidates.forEach((c, i) => { candIdToCluster[String(c._id)] = assignments[i]; });

  const similar = topSimilar.map((p) => ({
    ...p,
    _cluster: candIdToCluster[String(p._id)] ?? 0,
    _clusterTheme: CLUSTER_THEMES[candIdToCluster[String(p._id)] % CLUSTER_THEMES.length],
  }));

  // Cluster summary for the strip UI
  const clusterSummary = CLUSTER_THEMES.slice(0, K).map((theme, ci) => ({
    ...theme,
    id: ci,
    count: assignments.filter((a) => a === ci).length,
  }));

  res.json({ similar, seed, clusterSummary });
});

// ═══════════════════════════════════════════════════════════
//  CONTROLLER 2: AI Feature Analysis
//  POST /api/products/ai-feature-analysis  { ids: [...] }
// ═══════════════════════════════════════════════════════════
const getAIFeatureAnalysis = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!ids || ids.length < 2) {
    return res.status(400).json({ message: "Provide at least 2 product IDs" });
  }

  const products = await Product.find({ _id: { $in: ids } }).populate("category").lean();
  if (products.length < 2) return res.status(404).json({ message: "Products not found" });

  const prices  = products.map((p) => p.price || 0);
  const ratings = products.map((p) => p.rating || 0);
  const pMin = Math.min(...prices), pMax = Math.max(...prices);

  // ── TF-IDF to extract top keywords per product ──────────────
  const allTokens = products.map((p) =>
    tokenise(`${p.name} ${p.description || ""} ${p.brand || ""}`)
  );
  const tfidfVecs = buildTFIDF(allTokens);

  // Top features per product: top 5 TF-IDF terms
  const topFeatures = tfidfVecs.map((vec) =>
    Object.entries(vec)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([term]) => term)
  );

  // ── Dimension scores ────────────────────────────────────────
  const maxRating  = Math.max(...ratings);
  const minPrice   = pMin;

  const dimensions = products.map((product, i) => {
    const priceScore  = norm(pMax - (product.price || 0), 0, pMax - pMin); // lower price = higher score
    const ratingScore = (product.rating || 0) / 5;
    const stockScore  = Math.min((product.countInStock || 0) / 50, 1);
    const valueScore  = ratingScore - norm(product.price || 0, pMin, pMax); // rating vs price tradeoff

    return {
      _id: String(product._id),
      priceScore:  parseFloat((priceScore  * 100).toFixed(1)),
      ratingScore: parseFloat((ratingScore * 100).toFixed(1)),
      stockScore:  parseFloat((stockScore  * 100).toFixed(1)),
      valueScore:  parseFloat((Math.max(0, valueScore) * 100).toFixed(1)),
      topFeatures: topFeatures[i],
    };
  });

  // ── Determine winners per dimension ─────────────────────────
  const findWinner = (key) => {
    const max = Math.max(...dimensions.map((d) => d[key]));
    const idx = dimensions.findIndex((d) => d[key] === max);
    return String(products[idx]._id);
  };

  const winners = {
    price:  findWinner("priceScore"),
    rating: findWinner("ratingScore"),
    stock:  findWinner("stockScore"),
    value:  findWinner("valueScore"),
  };

  // ── Verdict: best overall ────────────────────────────────────
  const overallScores = dimensions.map((d) =>
    0.35 * d.valueScore + 0.3 * d.ratingScore + 0.2 * d.priceScore + 0.15 * d.stockScore
  );
  const bestIdx = overallScores.indexOf(Math.max(...overallScores));

  res.json({
    products,
    dimensions,
    winners,
    bestProduct: String(products[bestIdx]._id),
    overallScores: overallScores.map((s) => parseFloat(s.toFixed(1))),
  });
});

export { getAISimilarProducts, getAIFeatureAnalysis };
