import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetFilteredProductsQuery } from "../../redux/api/productApiSlice";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { addToCompare, removeFromCompare } from "../../redux/features/compare/compareSlice";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import HeartIcon from "./HeartIcon";
import {
  FaLaptop, FaGamepad, FaHome, FaBook, FaBriefcase,
  FaBirthdayCake, FaPlane, FaGraduationCap, FaHeart,
  FaMobileAlt, FaTags, FaShoppingCart, FaBalanceScale,
  FaStar, FaArrowLeft, FaSearch,
} from "react-icons/fa";
import { MdKitchen, MdOutlineSelfImprovement } from "react-icons/md";
import { GiClothes } from "react-icons/gi";

// ─────────────────────────────────────────────
// Purpose definitions with keyword matching
// ─────────────────────────────────────────────
const PURPOSES = [
  {
    id: "birthday",
    label: "Birthday Gift",
    emoji: "🎂",
    icon: FaBirthdayCake,
    description: "Perfect gifts for someone special",
    color: "from-pink-500 to-rose-600",
    bg: "bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30",
    border: "border-pink-200 dark:border-pink-800/40",
    badge: "bg-pink-500",
    keywords: ["phone", "shirt", "pen", "book", "accessory", "camera", "charger", "watch", "perfume", "gift"],
  },
  {
    id: "work",
    label: "Work From Home",
    emoji: "💻",
    icon: FaLaptop,
    description: "Boost your home office productivity",
    color: "from-blue-500 to-indigo-600",
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
    border: "border-blue-200 dark:border-blue-800/40",
    badge: "bg-blue-500",
    keywords: ["laptop", "charger", "pen", "book", "camera", "mouse", "keyboard", "monitor", "headphone", "desk"],
  },
  {
    id: "gaming",
    label: "Gaming Setup",
    emoji: "🎮",
    icon: FaGamepad,
    description: "Level up your gaming experience",
    color: "from-purple-500 to-violet-600",
    bg: "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30",
    border: "border-purple-200 dark:border-purple-800/40",
    badge: "bg-purple-500",
    keywords: ["tv", "laptop", "phone", "charger", "headphone", "monitor", "keyboard", "mouse", "gaming"],
  },
  {
    id: "home",
    label: "Home Makeover",
    emoji: "🏠",
    icon: FaHome,
    description: "Refresh your living space",
    color: "from-orange-500 to-amber-600",
    bg: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
    border: "border-orange-200 dark:border-orange-800/40",
    badge: "bg-orange-500",
    keywords: ["refrigerator", "tv", "daily use", "home", "kitchen", "appliance", "decor", "light", "fan"],
  },
  {
    id: "school",
    label: "Back to School",
    emoji: "📚",
    icon: FaBook,
    description: "Everything for students",
    color: "from-green-500 to-emerald-600",
    bg: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
    border: "border-green-200 dark:border-green-800/40",
    badge: "bg-green-500",
    keywords: ["book", "pen", "pencil", "books", "stationery", "bag", "laptop", "charger", "study"],
  },
  {
    id: "office",
    label: "Office Ready",
    emoji: "👔",
    icon: FaBriefcase,
    description: "Look sharp, work smart",
    color: "from-slate-500 to-zinc-600",
    bg: "bg-gradient-to-br from-slate-50 to-zinc-50 dark:from-slate-950/30 dark:to-zinc-950/30",
    border: "border-slate-200 dark:border-slate-700/40",
    badge: "bg-slate-500",
    keywords: ["shirt", "pen", "charger", "laptop", "bag", "watch", "book", "notebook", "office"],
  },
  {
    id: "tech",
    label: "Latest Tech",
    emoji: "📱",
    icon: FaMobileAlt,
    description: "Cutting-edge gadgets & electronics",
    color: "from-cyan-500 to-sky-600",
    bg: "bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30",
    border: "border-cyan-200 dark:border-cyan-800/40",
    badge: "bg-cyan-500",
    keywords: ["phone", "laptop", "tv", "charger", "camera", "headphone", "tablet", "smartwatch", "tech"],
  },
  {
    id: "travel",
    label: "Travel Essentials",
    emoji: "✈️",
    icon: FaPlane,
    description: "Pack smart, travel light",
    color: "from-teal-500 to-green-600",
    bg: "bg-gradient-to-br from-teal-50 to-green-50 dark:from-teal-950/30 dark:to-green-950/30",
    border: "border-teal-200 dark:border-teal-800/40",
    badge: "bg-teal-500",
    keywords: ["charger", "phone", "bag", "camera", "travel", "headphone", "bottle", "earphone"],
  },
  {
    id: "fashion",
    label: "Fashion & Style",
    emoji: "👗",
    icon: GiClothes,
    description: "Express yourself with style",
    color: "from-fuchsia-500 to-pink-600",
    bg: "bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/30 dark:to-pink-950/30",
    border: "border-fuchsia-200 dark:border-fuchsia-800/40",
    badge: "bg-fuchsia-500",
    keywords: ["shirt", "clothing", "fashion", "dress", "jeans", "shoes", "watch", "accessory", "bag", "glass"],
  },
  {
    id: "budget",
    label: "Budget Buys",
    emoji: "💰",
    icon: FaTags,
    description: "Best value under ₹2,000",
    color: "from-yellow-500 to-amber-500",
    bg: "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30",
    border: "border-yellow-200 dark:border-yellow-700/40",
    badge: "bg-yellow-500",
    keywords: [], // Special: filter by price ≤ 2000
    priceMax: 2000,
  },
  {
    id: "kitchen",
    label: "Kitchen & Cooking",
    emoji: "🍳",
    icon: MdKitchen,
    description: "Upgrade your culinary experience",
    color: "from-red-500 to-orange-600",
    bg: "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30",
    border: "border-red-200 dark:border-red-800/40",
    badge: "bg-red-500",
    keywords: ["refrigerator", "daily use", "kitchen", "cooking", "mixer", "microwave", "oven", "pan", "plate"],
  },
  {
    id: "wellness",
    label: "Health & Wellness",
    emoji: "🧘",
    icon: MdOutlineSelfImprovement,
    description: "Invest in your well-being",
    color: "from-lime-500 to-green-600",
    bg: "bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-950/30 dark:to-green-950/30",
    border: "border-lime-200 dark:border-lime-700/40",
    badge: "bg-lime-600",
    keywords: ["daily use", "health", "fitness", "wellness", "yoga", "supplement", "bottle", "tracker", "watch"],
  },
];

// ─────────────────────────────────────────────
// Scoring: how well does a product match a purpose
// ─────────────────────────────────────────────
const scoreProduct = (product, purpose) => {
  if (purpose.priceMax && product.price > purpose.priceMax) return 0;
  if (purpose.keywords.length === 0 && purpose.priceMax) return 1; // budget: all products under cap

  const searchFields = [
    (product.name || "").toLowerCase(),
    (product.brand || "").toLowerCase(),
    (product.description || "").toLowerCase(),
    (product.category?.name || "").toLowerCase(),
  ].join(" ");

  let score = 0;
  purpose.keywords.forEach((kw) => {
    if (searchFields.includes(kw.toLowerCase())) score += 1;
  });
  return score;
};

// ─────────────────────────────────────────────
// Product Card inside PurposeShopping
// ─────────────────────────────────────────────
const PurposeProductCard = ({ product, purposeColor }) => {
  const dispatch = useDispatch();
  const compareList = useSelector((state) => state.compare.compareList);
  const isInCompare = compareList.some((p) => p._id === product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success("Added to cart!", { autoClose: 1500, hideProgressBar: true });
  };

  const handleToggleCompare = (e) => {
    e.preventDefault();
    if (isInCompare) {
      dispatch(removeFromCompare(product._id));
    } else if (compareList.length >= 3) {
      toast.warn("Max 3 products to compare", { autoClose: 2000 });
    } else {
      dispatch(addToCompare(product));
      toast.success("Added to compare!", { autoClose: 1200, hideProgressBar: true });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white dark:bg-[#0c1222] rounded-2xl border border-zinc-100 dark:border-zinc-800/60 shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-1 flex flex-col overflow-hidden"
    >
      {/* Image */}
      <Link to={`/product/${product._id}`} className="block relative w-full aspect-[4/5] bg-zinc-50 dark:bg-[#080d1a] flex items-center justify-center p-5 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => { e.target.src = "https://placehold.co/300x375?text=?"; }}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        {/* Heart */}
        <div className="absolute top-3 right-3 z-10">
          <HeartIcon product={product} />
        </div>
        {/* Brand */}
        {product.brand && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-white/80 dark:bg-black/60 backdrop-blur-sm text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
              {product.brand}
            </span>
          </div>
        )}
        {/* Out of stock */}
        {product.countInStock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Out of stock</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/5 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-4">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-4 py-2 rounded-xl w-full text-center shadow-lg">
            View Details
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-black text-sm text-zinc-900 dark:text-white line-clamp-2 leading-snug tracking-tight group-hover:text-secondary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} size={10} className={i < Math.round(product.rating) ? "text-secondary" : "text-zinc-200 dark:text-zinc-700"} />
            ))}
            <span className="text-[9px] text-zinc-400 ml-1">({product.numReviews})</span>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between gap-2">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Price</p>
            <p className="text-base font-black text-zinc-900 dark:text-secondary tracking-tight">
              ₹{product.price?.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Compare */}
            <button
              onClick={handleToggleCompare}
              title="Compare"
              className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                isInCompare
                  ? "bg-secondary border-secondary text-primary"
                  : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:border-secondary hover:text-secondary"
              }`}
            >
              <FaBalanceScale size={11} />
            </button>
            {/* Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
              className="w-10 h-8 rounded-xl flex items-center justify-center bg-zinc-900 dark:bg-secondary text-white dark:text-primary hover:bg-zinc-700 dark:hover:bg-yellow-300 border border-transparent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FaShoppingCart size={12} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const PurposeShopping = () => {
  const [selectedPurpose, setSelectedPurpose] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allProducts = [], isLoading } = useGetFilteredProductsQuery({ checked: [], radio: [] });

  // Filter purposes by search
  const filteredPurposes = useMemo(() => {
    if (!searchQuery.trim()) return PURPOSES;
    return PURPOSES.filter(
      (p) =>
        p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Score + filter products for selected purpose
  const purposeProducts = useMemo(() => {
    if (!selectedPurpose || !allProducts.length) return [];

    const scored = allProducts
      .map((p) => ({ ...p, _score: scoreProduct(p, selectedPurpose) }))
      .filter((p) => p._score > 0)
      .sort((a, b) => b._score - a._score || b.rating - a.rating);

    return scored;
  }, [selectedPurpose, allProducts]);

  const purpose = selectedPurpose;

  return (
    <div className="min-h-screen bg-surface dark:bg-primary transition-colors">

      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-[#0F172A] to-zinc-950 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[200%] bg-secondary/8 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-40%] left-[-5%] w-[40%] h-[200%] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-[10px] font-black tracking-[0.4em] uppercase text-secondary mb-5 border border-secondary/30 px-5 py-2 rounded-full bg-secondary/10">
              ✦ Shop With Intention
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.05] mb-5">
              What Are You <br />
              <span className="text-shimmer">Shopping For?</span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-base font-medium max-w-lg mx-auto leading-relaxed mb-8">
              Choose your purpose and we'll instantly curate the perfect products just for you.
            </p>

            {/* Search Purposes */}
            <div className="relative max-w-md mx-auto">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input
                type="text"
                placeholder="Search a purpose..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-zinc-500 focus:outline-none focus:border-secondary/50 focus:bg-white/15 text-sm font-bold transition-all"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">

        {/* ── Purpose Cards Grid ── */}
        <AnimatePresence>
          {!selectedPurpose && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8 text-center">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-secondary mb-2">Select Your Goal</p>
                <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white">
                  {filteredPurposes.length} Shopping Purposes
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredPurposes.map((p, i) => (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedPurpose(p)}
                    className={`group flex flex-col items-center gap-3 p-5 rounded-3xl border-2 ${p.bg} ${p.border} hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-left`}
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <span className="text-2xl leading-none">{p.emoji}</span>
                    </div>
                    <div>
                      <p className="font-black text-sm text-zinc-900 dark:text-white leading-tight text-center group-hover:text-secondary transition-colors">
                        {p.label}
                      </p>
                      <p className="text-[10px] text-zinc-400 leading-snug text-center mt-1 line-clamp-2">
                        {p.description}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {filteredPurposes.length === 0 && (
                <div className="text-center py-16 text-zinc-400">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="font-bold">No purposes match your search.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Selected Purpose Product Grid ── */}
        <AnimatePresence>
          {selectedPurpose && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <button
                  onClick={() => setSelectedPurpose(null)}
                  className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex-shrink-0"
                >
                  <FaArrowLeft size={14} />
                </button>

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${purpose.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                  <span className="text-2xl">{purpose.emoji}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-0.5">Purpose: {purpose.label}</p>
                  <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {isLoading ? "Loading..." : `${purposeProducts.length} Products Found`}
                  </h2>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">{purpose.description}</p>
                </div>

                <Link
                  to="/shop"
                  className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-secondary transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  Browse All →
                </Link>
              </div>

              {/* Purpose chips bar */}
              <div className="flex gap-2 flex-wrap mb-8">
                {PURPOSES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPurpose(p)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${
                      selectedPurpose.id === p.id
                        ? `bg-gradient-to-r ${p.color} text-white border-transparent shadow-lg`
                        : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-secondary hover:text-secondary"
                    }`}
                  >
                    <span>{p.emoji}</span> {p.label}
                  </button>
                ))}
              </div>

              {/* Products */}
              {isLoading ? (
                <Loader />
              ) : purposeProducts.length === 0 ? (
                <div className="py-24 text-center">
                  <p className="text-5xl mb-4">🛍️</p>
                  <h3 className="text-xl font-black text-zinc-700 dark:text-zinc-300 mb-2">No products found</h3>
                  <p className="text-zinc-400 text-sm mb-6">
                    No products currently match the "{purpose.label}" purpose.
                  </p>
                  <button
                    onClick={() => setSelectedPurpose(null)}
                    className="px-8 py-3 rounded-2xl bg-secondary text-primary font-black text-sm uppercase tracking-widest hover:bg-yellow-300 transition-all shadow-lg shadow-secondary/20"
                  >
                    Browse Other Purposes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {purposeProducts.map((product, i) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.5) }}
                    >
                      <PurposeProductCard product={product} purposeColor={purpose.color} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PurposeShopping;
