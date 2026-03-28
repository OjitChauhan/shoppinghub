import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";

const norm = (v = "") => String(v).toLowerCase().trim();

export const getAIAssistantReply = asyncHandler(async (req, res) => {
  const { message = "", context = {} } = req.body || {};
  const query = norm(message);

  if (!query) {
    return res.status(400).json({ message: "Message is required" });
  }

  const products = await Product.find({})
    .select("name price brand rating countInStock")
    .populate("category", "name")
    .limit(150)
    .lean();

  const words = query.split(/\s+/).filter(Boolean);
  const ranked = products
    .map((p) => {
      const hay = norm(`${p.name} ${p.brand || ""} ${p.category?.name || ""}`);
      let score = 0;
      words.forEach((w) => {
        if (hay.includes(w)) score += 1;
      });
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.p);

  const cartCount = Number(context.cartCount || 0);
  const favCount = Number(context.favoritesCount || 0);
  const compareCount = Number(context.compareCount || 0);
  const activeCategories = Array.isArray(context.activeCategories) ? context.activeCategories : [];

  let reply =
    "I can help with product discovery, filtering, compare, and quick navigation. Try: 'find samsung', 'items under 30000', or 'open cart'.";

  const priceMatch =
    query.match(/(?:under|below|less than|max)\s*₹?\s*(\d+)/i) ||
    query.match(/(\d+)\s*₹?\s*(?:or less|max)/i);

  if (query.includes("status") || query.includes("summary")) {
    reply = `You currently have ${cartCount} item(s) in cart, ${favCount} favorite(s), and ${compareCount} item(s) in compare.`;
  } else if (priceMatch?.[1]) {
    const maxPrice = Number(priceMatch[1]);
    const under = products
      .filter((p) => Number(p.price || 0) <= maxPrice)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
    if (under.length) {
      reply = `Great choice. I found ${under.length} strong option(s) under ₹${maxPrice}: ${under
        .map((p) => `${p.name} (₹${p.price})`)
        .join(", ")}.`;
    } else {
      reply = `I couldn't find products under ₹${maxPrice} right now. Try a slightly higher range or different keyword.`;
    }
  } else if (activeCategories.length > 0) {
    reply = `You currently have ${activeCategories.length} category filter(s) active. I can help narrow further by brand, price, or rating.`;
  } else if (ranked.length > 0) {
    reply = `Top matches for "${message}": ${ranked
      .map((p) => `${p.name} (₹${p.price})`)
      .join(", ")}. You can ask me to add one to cart/favorites/compare.`;
  } else if (query.includes("recommend")) {
    const best = products
      .filter((p) => Number(p.countInStock || 0) > 0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
    reply = `Recommended picks right now: ${best.map((p) => `${p.name} (₹${p.price})`).join(", ")}.`;
  }

  return res.json({
    reply,
    suggestions: [
      "open cart",
      "find iphone",
      "items under 30000",
      "add to compare samsung",
    ],
  });
});

