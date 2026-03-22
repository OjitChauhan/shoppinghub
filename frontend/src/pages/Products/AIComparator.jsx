import React, { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  useGetAISimilarQuery,
  useGetAIFeatureAnalysisQuery,
  useGetFilteredProductsQuery,
} from "../../redux/api/productApiSlice";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { addToCompare, removeFromCompare } from "../../redux/features/compare/compareSlice";
import Loader from "../../components/Loader";
import {
  FaRobot, FaSearch, FaBalanceScale, FaShoppingCart,
  FaTrophy, FaStar, FaFire, FaCheckCircle, FaTimesCircle,
  FaTag, FaBoxOpen, FaChartBar, FaArrowLeft, FaLightbulb,
} from "react-icons/fa";
import { MdAutoAwesome, MdBubbleChart } from "react-icons/md";

// ─── Score Bar ──────────────────────────────────────────────
const ScoreBar = ({ score, color = "bg-secondary", label, winnerIcon }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
      <span>{label}</span>
      <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200">
        {winnerIcon && <span className="text-yellow-400">{winnerIcon}</span>}
        {score}%
      </span>
    </div>
    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(score, 2)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  </div>
);

// ─── Similarity Badge ────────────────────────────────────────
const SimBadge = ({ score }) => {
  const pct = Math.round(score * 100);
  const color =
    pct >= 70 ? "bg-emerald-500" :
    pct >= 40 ? "bg-blue-500" :
                "bg-zinc-400";
  return (
    <span className={`absolute top-2 left-2 ${color} text-white text-[9px] font-black px-2 py-0.5 rounded-full z-10 flex items-center gap-1 shadow-lg uppercase tracking-widest`}>
      <MdAutoAwesome size={9} /> {pct}% match
    </span>
  );
};

// ─── Cluster Badge ───────────────────────────────────────────
const ClusterBadge = ({ theme }) => (
  <span className={`absolute top-2 right-2 ${theme.color} text-white text-[9px] font-black px-2 py-0.5 rounded-full z-10 shadow uppercase tracking-wider`}>
    {theme.label}
  </span>
);

// ─── Product Search Box ──────────────────────────────────────
const ProductSearchBox = ({ products, onSelect, placeholder }) => {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() =>
    products.filter(
      (p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.brand || "").toLowerCase().includes(q.toLowerCase())
    ).slice(0, 8),
    [products, q]
  );

  return (
    <div className="relative">
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={13} />
        <input
          type="text"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder || "Search a product to compare…"}
          className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 focus:border-secondary dark:focus:border-secondary text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none transition-all"
        />
      </div>
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full mt-2 left-0 right-0 rounded-2xl bg-white dark:bg-[#0c1222] border border-zinc-200 dark:border-zinc-700 shadow-2xl z-50 overflow-hidden"
          >
            {filtered.map((p) => (
              <li key={p._id}>
                <button
                  onMouseDown={() => { onSelect(p); setQ(p.name); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-10 h-10 object-contain rounded-lg bg-zinc-100 dark:bg-zinc-900 flex-shrink-0"
                    onError={(e) => { e.target.src = "https://placehold.co/40?text=?"; }}
                  />
                  <div className="min-w-0">
                    <p className="font-black text-sm text-zinc-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-zinc-400 font-bold">{p.brand} · ₹{p.price?.toLocaleString("en-IN")}</p>
                  </div>
                  <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-zinc-300 dark:text-zinc-600 flex-shrink-0">
                    {p.category?.name}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
//  Main Page
// ═══════════════════════════════════════════════════════════
const AIComparator = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const compareList = useSelector((state) => state.compare.compareList);

  const [seedProduct, setSeedProduct] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTab, setActiveTab] = useState("similar"); // "similar" | "analysis"

  // Fetch all products for search
  const { data: allProducts = [] } = useGetFilteredProductsQuery({ checked: [], radio: [] });

  // AI Similar Products
  const {
    data: aiData,
    isLoading: loadingSimilar,
    isFetching,
  } = useGetAISimilarQuery(
    { productId: seedProduct?._id, limit: 9 },
    { skip: !seedProduct }
  );

  // AI Feature Analysis — only when 2+ products selected
  const analysisIds = [
    ...(seedProduct ? [seedProduct._id] : []),
    ...selectedIds,
  ].slice(0, 4);

  const {
    data: analysisData,
    isLoading: loadingAnalysis,
  } = useGetAIFeatureAnalysisQuery(analysisIds, {
    skip: analysisIds.length < 2,
  });

  const { similar = [], clusterSummary = [] } = aiData || {};

  const toggleSelect = (product) => {
    setSelectedIds((prev) =>
      prev.includes(product._id)
        ? prev.filter((id) => id !== product._id)
        : prev.length >= 3 ? prev : [...prev, product._id]
    );
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success(`${product.name} added to cart!`, { autoClose: 1500, hideProgressBar: true });
  };

  const handleSendToCompare = () => {
    if (!seedProduct) return;
    const toSend = similar.filter((p) => selectedIds.includes(p._id)).slice(0, 2);
    [seedProduct, ...toSend].forEach((p) => dispatch(addToCompare(p)));
    toast.success("Sent to Compare page!", { autoClose: 1500 });
    navigate("/compare");
  };

  // ── Analysis lookup helpers ──────────────────────────────
  const getDim = (id) => analysisData?.dimensions?.find((d) => d._id === id);
  const isWinner = (id, field) => analysisData?.winners?.[field] === id;
  const isBest = (id) => analysisData?.bestProduct === id;

  const SCORE_COLOR = (s) =>
    s >= 70 ? "bg-emerald-500" : s >= 45 ? "bg-blue-500" : s >= 25 ? "bg-secondary" : "bg-zinc-400";

  return (
    <div className="min-h-screen bg-surface dark:bg-primary transition-colors">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#050d1a] via-[#0a1628] to-[#0d1f3c] py-14 md:py-20 px-4 md:px-8">
        <div className="absolute -top-20 right-[-10%] w-[50%] h-[200%] bg-secondary/8 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[-5%] w-[40%] h-[150%] bg-violet-500/8 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.35em] uppercase text-secondary mb-5 border border-secondary/30 px-5 py-2 rounded-full bg-secondary/10">
              <FaRobot size={12} /> AI-Powered Feature Extraction + Clustering
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-[1.05]">
              AI Product <span className="text-shimmer">Comparator</span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Search any product — our AI uses <strong className="text-secondary">TF-IDF</strong>, <strong className="text-secondary">cosine similarity</strong> &amp; <strong className="text-secondary">k-means clustering</strong> to instantly surface the most similar alternatives.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">

        {/* ── Seed Product Search ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mb-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-secondary mb-3 text-center">Step 1 — Pick Your Product</p>
          <ProductSearchBox products={allProducts} onSelect={setSeedProduct} placeholder="Search a product (e.g. iPhone, Kettle, Shirt)…" />

          {/* Seed preview */}
          <AnimatePresence>
            {seedProduct && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-4 bg-white dark:bg-[#0c1222] rounded-2xl border border-secondary/30 p-4 shadow-xl shadow-secondary/10"
              >
                <img
                  src={seedProduct.image}
                  alt={seedProduct.name}
                  className="w-16 h-16 object-contain rounded-xl bg-zinc-50 dark:bg-zinc-900 flex-shrink-0"
                  onError={(e) => { e.target.src = "https://placehold.co/64?text=?"; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-0.5">Seed Product</p>
                  <p className="font-black text-base text-zinc-900 dark:text-white truncate">{seedProduct.name}</p>
                  <p className="text-xs text-zinc-400 font-bold">{seedProduct.brand} · ₹{seedProduct.price?.toLocaleString("en-IN")}</p>
                </div>
                <button
                  onClick={() => { setSeedProduct(null); setSelectedIds([]); }}
                  className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Tabs ── */}
        {seedProduct && (
          <div className="flex justify-center gap-2 mb-8">
            {[
              { id: "similar", label: "AI Similar Products", icon: <MdBubbleChart size={14} /> },
              { id: "analysis", label: "Feature Analysis", icon: <FaChartBar size={12} />, disabled: selectedIds.length === 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? "bg-secondary text-primary shadow-lg shadow-secondary/30"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed"
                }`}
              >
                {tab.icon} {tab.label}
                {tab.id === "analysis" && selectedIds.length > 0 && (
                  <span className="ml-1 bg-primary/20 dark:bg-secondary/20 text-secondary dark:text-primary px-1.5 py-0.5 rounded-full">
                    {selectedIds.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ─────────── TAB: AI Similar ─────────── */}
        {activeTab === "similar" && seedProduct && (
          <>
            {/* Cluster Summary Strip */}
            {clusterSummary.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap gap-2 justify-center mb-8"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 mr-2">
                  <MdBubbleChart size={13} /> K-Means Clusters:
                </span>
                {clusterSummary.map((c) => (
                  <span key={c.id} className={`${c.color} text-white text-[9px] font-black px-3 py-1 rounded-full shadow flex items-center gap-1`}>
                    {c.label} <span className="opacity-70">({c.count})</span>
                  </span>
                ))}
              </motion.div>
            )}

            {loadingSimilar || isFetching ? (
              <Loader />
            ) : similar.length === 0 ? (
              <div className="text-center py-20 text-zinc-400">
                <p className="text-4xl mb-3">🤖</p>
                <p className="font-bold">No similar products found in the database.</p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-1">Step 2 — Select to Analyse</p>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                      {similar.length} AI-Matched Similar Products
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Select 1–3 to run <span className="text-secondary font-bold">Feature Analysis</span>
                    </p>
                  </div>
                  {selectedIds.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setActiveTab("analysis")}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-secondary text-primary font-black text-xs uppercase tracking-widest hover:bg-yellow-300 active:scale-95 transition-all shadow-lg shadow-secondary/20"
                      >
                        <FaChartBar size={11} /> Analyse ({selectedIds.length + 1})
                      </button>
                      <button
                        onClick={handleSendToCompare}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 dark:bg-zinc-700 text-white font-black text-xs uppercase tracking-widest hover:bg-zinc-700 active:scale-95 transition-all"
                      >
                        <FaBalanceScale size={11} /> Compare Side-by-Side
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {similar.map((product, i) => {
                    const selected = selectedIds.includes(product._id);
                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => toggleSelect(product)}
                        className={`group relative cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden flex flex-col ${
                          selected
                            ? "border-secondary shadow-xl shadow-secondary/20 scale-[1.02]"
                            : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-600"
                        } bg-white dark:bg-[#0c1222]`}
                      >
                        {/* Selection ring + checkmark */}
                        {selected && (
                          <div className="absolute inset-0 border-2 border-secondary rounded-2xl pointer-events-none z-20">
                            <div className="absolute top-2 right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                              <FaCheckCircle className="text-primary" size={12} />
                            </div>
                          </div>
                        )}

                        {/* Badges */}
                        <SimBadge score={product._similarity} />
                        {product._clusterTheme && <ClusterBadge theme={product._clusterTheme} />}

                        {/* Image */}
                        <div className="w-full aspect-[4/5] bg-zinc-50 dark:bg-[#080d1a] flex items-center justify-center p-5 relative overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            onError={(e) => { e.target.src = "https://placehold.co/200x250?text=?"; }}
                            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                          />
                          {product.countInStock === 0 && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full">Out of stock</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-3.5 flex flex-col gap-2 flex-grow">
                          <Link
                            to={`/product/${product._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-black text-sm text-zinc-900 dark:text-white line-clamp-2 leading-snug hover:text-secondary transition-colors"
                          >
                            {product.name}
                          </Link>

                          {product.rating > 0 && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, si) => (
                                <FaStar key={si} size={9} className={si < Math.round(product.rating) ? "text-secondary" : "text-zinc-200 dark:text-zinc-700"} />
                              ))}
                              <span className="text-[9px] text-zinc-400">({product.numReviews})</span>
                            </div>
                          )}

                          <div className="mt-auto flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                            <p className="text-sm font-black text-zinc-900 dark:text-secondary">₹{product.price?.toLocaleString("en-IN")}</p>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                              disabled={product.countInStock === 0}
                              className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-secondary text-white dark:text-primary flex items-center justify-center hover:bg-zinc-700 dark:hover:bg-yellow-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <FaShoppingCart size={11} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ─────────── TAB: Feature Analysis ─────────── */}
        {activeTab === "analysis" && (
          <AnimatePresence mode="wait">
            {analysisIds.length < 2 ? (
              <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                <FaLightbulb className="mx-auto mb-4 text-secondary" size={48} />
                <h3 className="text-xl font-black text-zinc-700 dark:text-zinc-300 mb-2">Select Products First</h3>
                <p className="text-zinc-400 text-sm">Go to "AI Similar Products", select at least 1 product to compare with the seed.</p>
              </motion.div>
            ) : loadingAnalysis ? (
              <Loader />
            ) : analysisData ? (
              <motion.div key="analysis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Best product banner */}
                {analysisData.bestProduct && (
                  <div className="mb-8 rounded-3xl bg-gradient-to-r from-secondary/20 via-secondary/10 to-transparent border border-secondary/30 p-6 flex items-center gap-4">
                    <FaTrophy className="text-secondary flex-shrink-0" size={32} />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-1">🤖 AI Verdict — Best Overall</p>
                      <h3 className="font-black text-lg text-zinc-900 dark:text-white">
                        {analysisData.products.find((p) => String(p._id) === analysisData.bestProduct)?.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">Based on weighted value, rating, price, and stock score.</p>
                    </div>
                  </div>
                )}

                {/* Per-product analysis cards */}
                <div className={`grid gap-6 mb-8 ${analysisData.products.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3 lg:grid-cols-4"}`}>
                  {analysisData.products.map((product) => {
                    const dim = getDim(String(product._id));
                    const overall = analysisData.overallScores[analysisData.products.findIndex((p) => String(p._id) === String(product._id))];
                    const best = isBest(String(product._id));

                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`relative rounded-3xl p-5 border-2 flex flex-col gap-4 ${
                          best
                            ? "border-secondary bg-secondary/5 dark:bg-secondary/5 shadow-xl shadow-secondary/15"
                            : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#0c1222]"
                        }`}
                      >
                        {best && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-primary text-[9px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest flex items-center gap-1">
                            <FaTrophy size={8} /> Best Pick
                          </div>
                        )}

                        {/* Product header */}
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-contain rounded-xl bg-zinc-50 dark:bg-zinc-900 flex-shrink-0"
                            onError={(e) => { e.target.src = "https://placehold.co/48?text=?"; }}
                          />
                          <div className="min-w-0">
                            <p className="font-black text-sm text-zinc-900 dark:text-white truncate">{product.name}</p>
                            <p className="text-[10px] text-zinc-400 font-bold">{product.brand} · ₹{product.price?.toLocaleString("en-IN")}</p>
                          </div>
                        </div>

                        {/* Overall score */}
                        <div className="text-center py-2 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">AI Score</p>
                          <p className={`text-3xl font-black ${best ? "text-secondary" : "text-zinc-900 dark:text-white"}`}>{overall.toFixed(1)}</p>
                          <p className="text-[9px] text-zinc-400">out of 100</p>
                        </div>

                        {/* Score bars */}
                        {dim && (
                          <div className="space-y-3">
                            <ScoreBar
                              label="💰 Best Price"
                              score={dim.priceScore}
                              color={SCORE_COLOR(dim.priceScore)}
                              winnerIcon={isWinner(String(product._id), "price") ? "🏆" : null}
                            />
                            <ScoreBar
                              label="⭐ Rating"
                              score={dim.ratingScore}
                              color={SCORE_COLOR(dim.ratingScore)}
                              winnerIcon={isWinner(String(product._id), "rating") ? "🏆" : null}
                            />
                            <ScoreBar
                              label="📦 Stock"
                              score={dim.stockScore}
                              color={SCORE_COLOR(dim.stockScore)}
                              winnerIcon={isWinner(String(product._id), "stock") ? "🏆" : null}
                            />
                            <ScoreBar
                              label="🔥 Value"
                              score={dim.valueScore}
                              color={SCORE_COLOR(dim.valueScore)}
                              winnerIcon={isWinner(String(product._id), "value") ? "🏆" : null}
                            />
                          </div>
                        )}

                        {/* AI-extracted keywords */}
                        {dim?.topFeatures?.length > 0 && (
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-1">
                              <FaRobot size={9} /> AI Key Features
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {dim.topFeatures.map((f) => (
                                <span key={f} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[9px] font-black px-2 py-0.5 rounded-full">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CTAs */}
                        <div className="flex gap-2 mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.countInStock === 0}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-zinc-900 dark:bg-secondary text-white dark:text-primary text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 dark:hover:bg-yellow-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <FaShoppingCart size={10} />
                            {product.countInStock === 0 ? "Out of Stock" : "Add to Cart"}
                          </button>
                          <Link
                            to={`/product/${product._id}`}
                            className="w-10 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:border-secondary hover:text-secondary transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Winner summary */}
                <div className="rounded-3xl bg-white dark:bg-[#0c1222] border border-zinc-100 dark:border-zinc-800 p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: "price", label: "Best Price 💰" },
                    { key: "rating", label: "Top Rated ⭐" },
                    { key: "stock",  label: "Most Stock 📦" },
                    { key: "value",  label: "Best Value 🔥" },
                  ].map(({ key, label }) => {
                    const winnerId = analysisData.winners?.[key];
                    const winner   = analysisData.products.find((p) => String(p._id) === winnerId);
                    return (
                      <div key={key} className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">{label}</p>
                        {winner ? (
                          <>
                            <img
                              src={winner.image}
                              alt={winner.name}
                              className="w-10 h-10 object-contain rounded-lg mx-auto mb-1.5 bg-zinc-50 dark:bg-zinc-900"
                              onError={(e) => { e.target.src = "https://placehold.co/40?text=?"; }}
                            />
                            <p className="text-xs font-black text-zinc-800 dark:text-white truncate">{winner.name}</p>
                          </>
                        ) : <p className="text-zinc-300 text-xs">—</p>}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        )}

        {/* Empty state when no seed */}
        {!seedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
              <FaRobot className="text-secondary" size={40} />
            </div>
            <h2 className="text-2xl font-black text-zinc-800 dark:text-white mb-2">Start With Any Product</h2>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto">
              Search for a phone, shoe, kettle or anything — our AI engine will find the closest alternatives using similarity matching.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AIComparator;
