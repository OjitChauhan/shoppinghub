import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
  useGetRelatedProductsQuery,
} from "../../redux/api/productApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import SmallProductCard from "../../components/SmallProductCard";
import {
  FaBox,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaStore,
} from "react-icons/fa";
import moment from "moment";
import HeartIcon from "./HeartIcon";
import Ratings from "./Ratings";
import ProductTabs from "./ProductTabs";
import FinancialAdvisor from "./FinancialAdvisor";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { addViewedProduct } from "../../redux/features/activity/activitySlice";
import { addToCompare, removeFromCompare } from "../../redux/features/compare/compareSlice";
import { FaBalanceScale } from "react-icons/fa";

import Sentiment from "sentiment";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const COLORS = {
  primary: "#0F172A",
  secondary: "#D4AF37",
  surface: "#F8FAFC",
  contentPrimary: "#111827",
  charcoalGray: "#36454F",
};

const sentimentAnalyzer = new Sentiment();

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const compareList = useSelector((state) => state.compare.compareList);

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: product, isLoading, refetch, error } = useGetProductDetailsQuery(productId);

  const { data: relatedProducts, isLoading: loadingRelated, error: errorRelated } = useGetRelatedProductsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] = useCreateReviewMutation();

  const [productReviews, setProductReviews] = useState([]);
  const [sentimentChartData, setSentimentChartData] = useState(null);
  const [sentimentSegments, setSentimentSegments] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);

  useEffect(() => {
    if (product && product.reviews && product.reviews.length > 0) {
      setProductReviews(product.reviews);

      // Analyze sentiments on comment text
      const sentimentScores = product.reviews.map(r => {
        const text = r.comment || "";
        return sentimentAnalyzer.analyze(text).score;
      });

      // Define bins for score distribution (5 bins)
      const bins = [0, 0, 0, 0, 0]; // Negative, Slightly Negative, Neutral, Slightly Positive, Positive
      sentimentScores.forEach(score => {
        if (score < -1) bins[0]++;
        else if (score >= -1 && score < 0) bins[1]++;
        else if (score === 0) bins[2]++;
        else if (score > 0 && score <= 1) bins[3]++;
        else bins[4]++;
      });

      const labels = [
        "Negative (< -1)",
        "Slightly Negative (-1 to 0)",
        "Neutral (0)",
        "Slightly Positive (0 to 1)",
        "Positive (> 1)",
      ];

      setSentimentChartData({
        labels,
        datasets: [
          {
            label: "Sentiment Score Distribution",
            backgroundColor: COLORS.vibrantAqua,
            borderColor: COLORS.deepTeal,
            borderWidth: 1,
            data: bins,
          }
        ]
      });

      setSentimentSegments({
        Negative: bins[0],
        "Slightly Negative": bins[1],
        Neutral: bins[2],
        "Slightly Positive": bins[3],
        Positive: bins[4],
      });
    }

    if (product && product._id) {
      dispatch(addViewedProduct(product._id));
    }
  }, [product, dispatch]);

  const submitHandler = async e => {
    e.preventDefault();
    try {
      await createReview({ productId, rating, comment }).unwrap();
      refetch();
      toast.success("Review created successfully");
      setRating(0);
      setComment("");
    } catch (error) {
      toast.error(error?.data || error.message);
    }
  };

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate("/cart");
  };

  const isInCompare = product && compareList.some((p) => p._id === product._id);

  const toggleCompare = () => {
    if (!product) return;
    if (isInCompare) {
      dispatch(removeFromCompare(product._id));
      toast.info("Removed from comparison", { autoClose: 1500 });
    } else if (compareList.length >= 3) {
      toast.warn("You can only compare up to 3 products", { autoClose: 2000 });
    } else {
      dispatch(addToCompare(product));
      toast.success("Added to compare!", { autoClose: 1500 });
    }
  };

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 text-zinc-100 overflow-hidden">
        <Link to="/" className="text-zinc-500 hover:text-secondary dark:text-zinc-400 dark:hover:text-secondary font-medium transition-colors inline-block mb-8 flex items-center gap-2">
          ← Go Back
        </Link>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error?.data?.message || error.message}</Message>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12 lg:gap-16 bg-surface dark:bg-primary p-6 sm:p-10 transition-colors"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-xl p-2 sm:p-6 w-full max-w-sm sm:max-w-md bg-white dark:bg-[#0c1222] border border-zinc-100 dark:border-zinc-800 flex-shrink-0"
              >
                <img src={product.image} alt={product.name} className="w-full rounded-lg object-contain mix-blend-multiply dark:mix-blend-normal" />
                <div className="absolute top-4 right-4">
                  <HeartIcon product={product} />
                </div>
              </motion.div>

              <div className="flex flex-col justify-between w-full lg:max-w-xl text-content-primary dark:text-surface">
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 dark:bg-secondary/20 text-secondary text-xs font-black tracking-widest uppercase mb-4">
                    {product.brand}
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-black mb-4 text-center lg:text-left tracking-tight leading-tight">
                    {product.name}
                  </h2>
                  <div className="flex items-center justify-center lg:justify-start gap-4">
                    <Ratings value={product.rating} text={`${product.numReviews} reviews`} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                    <span className="text-sm font-bold text-zinc-500">{product.countInStock > 0 ? "IN STOCK" : "OUT OF STOCK"}</span>
                  </div>
                </div>







                {/* Virtual Try-On — Glasses */}
                {(product.category?._id?.toString?.() === "6994c47ff9d51654f4094c59" ||
                  product.category === "6994c47ff9d51654f4094c59" ||
                  (product.category?.name ?? "").toLowerCase().includes("glass")) && (
                  <button
                    onClick={() =>
                      navigate(`/virtual-tryon/${product._id}`, {
                        state: { image: product.image, name: product.name },
                      })
                    }
                    className="w-full mt-4 p-4 rounded-2xl text-white font-bold text-lg hover:scale-105 transition-all duration-300 bg-secondary shadow-secondary/20"
                  >
                    🕶 Virtual Try-On
                  </button>
                )}


                {/* ── Try-On buttons — category-gated ──────────────────── */}
                {(() => {
                  // category is now populated: { _id, name } OR legacy string ID
                  const catId   = product.category?._id?.toString?.() ?? String(product.category ?? "");
                  const catName = (product.category?.name ?? "").toLowerCase();

                  // Helper to navigate to try-on with full product state
                  const tryOn = (m) => navigate(`/virtual-tryon-body/${product._id}?mode=${m}`, {
                    state: { _id:product._id, image:product.image, name:product.name, brand:product.brand, price:product.price, description:product.description },
                  });

                  const isShirt     = catId === "6900bc9676e7515e04cae0b1" || catName.includes("shirt") || catName.includes("tshirt");
                  const isJewellery = catId === "69bef420f3e398363d98ffdd" || catId === "69bef600f3e398363d99038f" || catName.includes("jewel") || catName.includes("pendant") || catName.includes("necklac");
                  const isEarring   = catName.includes("earring") || catName.includes("ear stud") || catName === "ear";
                  const isWatch     = catName.includes("watch");
                  const isFurniture = catName.includes("furniture") || catName.includes("sofa") || catName.includes("chair") || catName.includes("table");

                  return (
                    <>
                      {isShirt && (
                        <button onClick={() => tryOn("shirt")}
                          className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-blue-600/20 border-2 border-blue-400/40 text-blue-300 hover:bg-blue-600/30 hover:border-blue-400 transition-all hover:scale-105 active:scale-95">
                          👕 Virtual Try-On — Shirt
                        </button>
                      )}
                      {isJewellery && (
                        <button onClick={() => tryOn("jewellery")}
                          className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-purple-600/20 border-2 border-purple-400/40 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400 transition-all hover:scale-105 active:scale-95">
                          💍 Virtual Try-On — Jewellery
                        </button>
                      )}
                      {isEarring && (
                        <button onClick={() => tryOn("earring")}
                          className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-rose-600/20 border-2 border-rose-400/40 text-rose-300 hover:bg-rose-600/30 hover:border-rose-400 transition-all hover:scale-105 active:scale-95">
                          💎 Virtual Try-On — Earring
                        </button>
                      )}
                      {isWatch && (
                        <button onClick={() => tryOn("watch")}
                          className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-amber-600/20 border-2 border-amber-400/40 text-amber-300 hover:bg-amber-600/30 hover:border-amber-400 transition-all hover:scale-105 active:scale-95">
                          ⌚ Virtual Try-On — Watch
                        </button>
                      )}
                      {isFurniture && (
                        <button onClick={() => tryOn("furniture")}
                          className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-emerald-600/20 border-2 border-emerald-400/40 text-emerald-300 hover:bg-emerald-600/30 hover:border-emerald-400 transition-all hover:scale-105 active:scale-95">
                          🪑 Virtual Try-On — Furniture
                        </button>
                      )}
                    </>
                  );
                })()}


















                <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 mb-8 text-center lg:text-left leading-relaxed max-w-prose italic">
                  "{product.description}"
                </p>

                <div className="flex items-center justify-center lg:justify-start gap-3 mb-10">
                  <span className="text-4xl sm:text-5xl font-black text-secondary tracking-tighter">
                    ₹{product?.price?.toLocaleString("en-IN")}
                  </span>
                  {product.price > 1000 && (
                    <span className="text-lg text-zinc-400 line-through font-bold">₹{(product.price * 1.2).toLocaleString("en-IN")}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm font-bold text-content-primary dark:text-zinc-300 mb-10 p-8 bg-zinc-50 dark:bg-[#0c1222] rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-inner">
                  <div className="flex flex-col gap-4">
                    <span className="flex items-center gap-3 text-zinc-500">
                      <FaStore className="text-secondary" /> <span className="text-content-primary dark:text-surface">{product.brand}</span>
                    </span>
                    <span className="flex items-center gap-3 text-zinc-500">
                      <FaClock className="text-secondary" /> <span className="text-content-primary dark:text-surface">{moment(product.createAt).fromNow()}</span>
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <span className="flex items-center gap-3 text-zinc-500">
                      <FaShoppingCart className="text-secondary" /> <span className="text-content-primary dark:text-surface">{product.quantity} In Stock</span>
                    </span>
                    <span className="flex items-center gap-3 text-zinc-500">
                      <FaBox className="text-secondary" /> <span className="text-content-primary dark:text-surface">Delivery: 3-5 Days</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-8">
                  {product.countInStock > 0 && (
                    <div className="relative group">
                      <select
                        value={qty}
                        onChange={e => setQty(Number(e.target.value))}
                        className="appearance-none p-4 w-full sm:w-[5rem] rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-black dark:text-white font-black focus:outline-none focus:border-secondary transition-all cursor-pointer text-center"
                      >
                        {[...Array(product.countInStock).keys()].map(x => (
                          <option key={x + 1} value={x + 1}>{x + 1}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={addToCartHandler}
                    disabled={product.countInStock === 0}
                    className={`flex-1 py-4 px-10 rounded-2xl font-black text-lg tracking-tight shadow-xl transition-all active:scale-95 ${product.countInStock === 0
                      ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                      : "bg-black text-white hover:bg-zinc-800 dark:bg-secondary dark:hover:bg-yellow-400 dark:text-primary shadow-secondary/20"
                      }`}
                  >
                    {product.countInStock === 0 ? "OUT OF STOCK" : "ADD TO CART"}
                  </button>
                  {/* Compare Button */}
                  <button
                    onClick={toggleCompare}
                    title={isInCompare ? "Remove from compare" : "Add to Compare"}
                    className={`flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black text-sm tracking-tight shadow-xl transition-all active:scale-95 border-2 ${isInCompare
                        ? "bg-secondary border-secondary text-primary shadow-secondary/30"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-secondary hover:text-secondary bg-transparent"
                      }`}
                  >
                    <FaBalanceScale size={16} />
                    {isInCompare ? "Comparing" : "Compare"}
                  </button>
                </div>

                <div className="text-center lg:text-left px-2">
                  {sentimentChartData && (
                    <button
                      onClick={() => setShowChartModal(true)}
                      className="text-xs font-black tracking-widest text-zinc-400 hover:text-secondary uppercase transition-colors flex items-center gap-2 justify-center lg:justify-start group"
                    >
                      <span className="w-8 h-[1px] bg-zinc-200 dark:bg-zinc-800 group-hover:bg-secondary transition-colors"></span>
                      View Review Insights
                      <span className="w-8 h-[1px] bg-zinc-200 dark:bg-zinc-800 group-hover:bg-secondary transition-colors"></span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {showChartModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4" onClick={() => setShowChartModal(false)}>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="rounded-2xl p-8 shadow-2xl relative max-w-xl w-full bg-surface dark:bg-primary border border-zinc-200 dark:border-zinc-800"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                    onClick={() => setShowChartModal(false)}
                    aria-label="Close chart modal"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <h3 className="text-xl font-bold mb-6 text-content-primary dark:text-surface">
                    Sentiment Score Distribution
                  </h3>
                  <Bar
                    data={sentimentChartData}
                    options={{
                      responsive: true,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { stepSize: 1 }
                        }
                      },
                      plugins: { legend: { display: false } }
                    }}
                  />
                </motion.div>
              </div>
            )}

            <div className="mt-10">
              <FinancialAdvisor product={product} />
            </div>

            <div className="mt-10">
              <ProductTabs
                loadingProductReview={loadingProductReview}
                userInfo={userInfo}
                submitHandler={submitHandler}
                rating={rating}
                setRating={setRating}
                comment={comment}
                setComment={setComment}
                product={product}
              />

              {sentimentSegments && (
                <div className="mt-8 p-6 rounded-xl bg-white dark:bg-[#0c1222] border border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-lg font-bold mb-3 text-content-primary dark:text-surface">Review Sentiment</h4>
                  <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400">
                    {Object.entries(sentimentSegments).map(([segment, count]) => (
                      <li key={segment}>
                        {segment}: {count} review{count !== 1 ? "s" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-20 pt-12 border-t border-zinc-100 dark:border-zinc-800 border-dashed">
                <div className="flex items-end justify-between mb-10 px-2 uppercase tracking-[0.2em]">
                  <h3 className="text-2xl font-black text-content-primary dark:text-surface tracking-tight">
                    Beyond This Piece
                  </h3>
                  <span className="text-[10px] font-black text-zinc-400">Scroll to Explore →</span>
                </div>
                {loadingRelated ? (
                  <Loader />
                ) : errorRelated ? (
                  <Message variant="danger">{errorRelated?.data?.message || errorRelated.message}</Message>
                ) : (
                  <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-none snap-x snap-mandatory scroll-smooth">
                    {relatedProducts?.map((p, index) => (
                      <div key={p._id || `beyond-${index}`} className="min-w-[280px] sm:min-w-[320px] snap-start">
                        <SmallProductCard product={p} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default ProductDetails;
