import React from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetProductsQuery, useGetRecommendationsQuery } from "../redux/api/productApiSlice";
import { useGetMyOrdersQuery } from "../redux/api/orderApiSlice";
import { motion } from "framer-motion";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Header from "../components/Header";
import SmallProductCard from "../components/SmallProductCard";
import HeroBackground3D from "../components/HeroBackground3D";
import { FaArrowRight, FaFire, FaStar, FaCompass } from "react-icons/fa";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
};

const Home = () => {
  const { keyword = "" } = useParams();
  const { data, isLoading, isError } = useGetProductsQuery({ keyword });

  const productsList = React.useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return data.products || [];
  }, [data]);

  const { userInfo } = useSelector((state) => state.auth);
  const favorites    = useSelector((state) => state.favorites) || [];
  const favoriteIds  = favorites.map((f) => f._id);
  const activity     = useSelector((state) => state.activity?.viewedProducts) || [];

  const { data: myOrders } = useGetMyOrdersQuery(undefined, { skip: !userInfo });

  const historyProductIds = React.useMemo(() => {
    if (!myOrders) return [];
    const ids = new Set();
    myOrders.forEach((order) => {
      order.orderItems?.forEach((item) => { if (item.product) ids.add(item.product); });
    });
    return Array.from(ids);
  }, [myOrders]);

  const { data: recommendations, isLoading: loadingRec } = useGetRecommendationsQuery({
    favorites: favoriteIds, activity, history: historyProductIds,
  });

  const recommendedProducts = React.useMemo(() => {
    if (keyword) {
      return productsList
        .filter((p) =>
          p.name.toLowerCase().includes(keyword.toLowerCase()) ||
          p.description?.toLowerCase().includes(keyword.toLowerCase())
        )
        .slice(0, 10);
    }
    return recommendations || [];
  }, [productsList, keyword, recommendations]);

  return (
    <>
      {!keyword && <Header />}

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">{isError?.data?.message || isError.error}</Message>
      ) : (
        <main className="min-h-screen bg-surface dark:bg-primary text-content-primary dark:text-surface transition-colors duration-300">
          <div className="px-4 sm:px-8 md:px-14 xl:px-24 py-14 sm:py-20">

            {/* ── Section Header ───────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6">
              <motion.div {...fadeUp}>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-secondary mb-3 flex items-center gap-2">
                  <span className="w-6 h-[2px] bg-secondary inline-block" />
                  {keyword ? `Results for "${keyword}"` : "Handpicked for You"}
                  <span className="w-6 h-[2px] bg-secondary inline-block" />
                </p>
                <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">
                  {keyword ? "Search Results" : <>Special <span className="text-secondary">Products</span></>}
                </h1>
                <p className="text-sm text-zinc-400 mt-3 font-medium">
                  {productsList.length} item{productsList.length !== 1 ? "s" : ""} available
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold bg-zinc-900 dark:bg-secondary text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-yellow-300 transition-all shadow-lg dark:shadow-secondary/30 hover:scale-105 active:scale-95"
                >
                  Full Collection
                  <FaArrowRight size={12} />
                </Link>
              </motion.div>
            </div>

            {/* ── Product Grid ─────────────────────────────── */}
            {productsList.length === 0 ? (
              <div className="py-24 text-center text-zinc-400">
                <p className="text-5xl mb-4">🛍️</p>
                <p className="font-bold text-lg">No products found.</p>
                <p className="text-sm mt-2">Try a different search or browse all products.</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5 pb-14"
              >
                {productsList.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4) }}
                  >
                    <SmallProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ── Purpose Shopping Promo Banner ────────────────── */}
            {!keyword && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="my-10"
              >
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-[#0F172A] to-zinc-950 p-8 md:p-12">
                  {/* Background blobs */}
                  <div className="absolute -top-12 -right-12 w-64 h-64 bg-secondary/15 blur-[80px] rounded-full pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    {/* Left copy */}
                    <div className="flex-1 text-center md:text-left">
                      <span className="inline-block text-[9px] font-black tracking-[0.4em] uppercase text-secondary mb-4 border border-secondary/30 px-4 py-1.5 rounded-full bg-secondary/10">
                        ✦ Smart Shopping
                      </span>
                      <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3 leading-tight">
                        Shop by <span className="text-shimmer">Purpose</span>
                      </h2>
                      <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto md:mx-0 mb-6">
                        Tell us what you need — we'll instantly find the best products matched to your goal.
                      </p>
                      <Link
                        to="/purpose-shopping"
                        className="inline-flex items-center gap-2.5 bg-secondary text-primary font-black text-sm uppercase tracking-widest px-7 py-3.5 rounded-2xl hover:bg-yellow-300 active:scale-95 transition-all shadow-xl shadow-secondary/20"
                      >
                        <FaCompass size={14} /> Explore Purposes
                      </Link>
                    </div>

                    {/* Right purpose chips */}
                    <div className="grid grid-cols-3 gap-2.5 flex-shrink-0">
                      {[
                        { emoji: "🎂", label: "Birthday" },
                        { emoji: "💻", label: "Work" },
                        { emoji: "🎮", label: "Gaming" },
                        { emoji: "📱", label: "Tech" },
                        { emoji: "📚", label: "School" },
                        { emoji: "✈️", label: "Travel" },
                        { emoji: "🏠", label: "Home" },
                        { emoji: "👔", label: "Office" },
                        { emoji: "💰", label: "Budget" },
                      ].map((p, i) => (
                        <motion.div
                          key={p.label}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.06 }}
                        >
                          <Link
                            to="/purpose-shopping"
                            className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-white/8 border border-white/10 hover:bg-white/15 hover:border-secondary/40 transition-all group"
                          >
                            <span className="text-xl group-hover:scale-110 transition-transform">{p.emoji}</span>
                            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 group-hover:text-secondary transition-colors">{p.label}</span>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* ── Virtual Try-On Promo ──────────────────────── */}
            {!keyword && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="my-10"
              >
                <div className="relative overflow-hidden rounded-3xl p-8 md:p-12"
                     style={{ background: "linear-gradient(135deg,#080c18 0%,#0f1f3d 50%,#080c18 100%)" }}>
                  {/* Ambient blobs */}
                  <div className="absolute -top-16 left-1/4 w-72 h-72 bg-yellow-400/10 blur-[100px] rounded-full pointer-events-none" />
                  <div className="absolute -bottom-16 right-1/4 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

                  <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
                    {/* Left copy */}
                    <div className="flex-1 text-center lg:text-left">
                      <span className="inline-block text-[9px] font-black tracking-[0.4em] uppercase text-yellow-300 mb-4 border border-yellow-400/30 px-4 py-1.5 rounded-full bg-yellow-400/10">
                        ✦ AI-Powered AR
                      </span>
                      <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3 leading-tight">
                        Try Before <span className="text-yellow-400">You Buy</span>
                      </h2>
                      <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto lg:mx-0 mb-4">
                        See clothes, jewellery, watches and even furniture on you — live — using your camera only. No downloads needed.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
                        {["👕 Shirt","💍 Jewellery","💎 Earrings","⌚ Watch","🪑 Furniture","🕶 Glasses"].map(t => (
                          <span key={t} className="text-xs font-bold text-white/70 bg-white/5 border border-white/10 px-3 py-1 rounded-full">{t}</span>
                        ))}
                      </div>
                      <Link to="/virtual-tryon-hub"
                        className="inline-flex items-center gap-2.5 bg-yellow-400 text-black font-black text-sm uppercase tracking-widest px-7 py-3.5 rounded-2xl hover:bg-yellow-300 active:scale-95 transition-all shadow-xl shadow-yellow-400/20">
                        📸 Open Try-On Studio
                      </Link>
                    </div>

                    {/* Right mode grid */}
                    <div className="grid grid-cols-3 gap-2.5 flex-shrink-0">
                      {[
                        { e:"👕", l:"Shirt" },   { e:"💍", l:"Jewellery" }, { e:"💎", l:"Earring" },
                        { e:"⌚", l:"Watch" },   { e:"🪑", l:"Furniture" }, { e:"🕶", l:"Glasses" },
                      ].map((m, i) => (
                        <Link key={m.l} to="/virtual-tryon-hub"
                          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-yellow-400/10 hover:border-yellow-400/30 transition-all group">
                          <span className="text-2xl group-hover:scale-110 transition-transform">{m.e}</span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 group-hover:text-yellow-400 transition-colors">{m.l}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>
            )}


            {!keyword && (
              <section className="border-t border-zinc-100 dark:border-zinc-800 pt-16 mt-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4"
                >
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-secondary mb-3 flex items-center gap-2">
                      <FaFire className="text-orange-400" size={12} />
                      Curated for You
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                      <FaStar className="text-secondary" size={22} />
                      Recommended
                    </h2>
                  </div>
                  <Link
                    to="/shop"
                    className="text-xs font-black text-zinc-400 hover:text-secondary uppercase tracking-widest transition-colors flex items-center gap-1.5"
                  >
                    See all <FaArrowRight size={10} />
                  </Link>
                </motion.div>

                {loadingRec ? (
                  <Loader />
                ) : recommendedProducts.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-4xl mb-4">🎯</p>
                    <p className="text-sm text-zinc-400 italic font-medium">Browse and favourite items to get personalised picks.</p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5 pb-12"
                  >
                    {recommendedProducts.map((product, i) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4) }}
                      >
                        <SmallProductCard product={product} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </section>
            )}
          </div>
        </main>
      )}
    </>
  );
};

export default Home;
