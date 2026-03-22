import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { removeFromCompare, clearCompare } from "../../redux/features/compare/compareSlice";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import {
  FaBalanceScale,
  FaStar,
  FaShoppingCart,
  FaArrowLeft,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaTag,
  FaBoxOpen,
  FaTrophy,
  FaFire,
} from "react-icons/fa";
import Loader from "../../components/Loader";
import { useCompareProductsQuery } from "../../redux/api/productApiSlice";

const CompareProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const compareList = useSelector((state) => state.compare.compareList);
  const ids = compareList.map((p) => p._id);

  const { data: products, isLoading, error } = useCompareProductsQuery(ids, {
    skip: ids.length === 0,
  });

  const displayProducts = products || compareList;

  // Compute min/max for highlights
  const prices = displayProducts.map((p) => p.price || 0);
  const ratings = displayProducts.map((p) => p.rating || 0);
  const minPrice = Math.min(...prices);
  const maxRating = Math.max(...ratings);

  const addToCartHandler = (product) => {
    if (product.countInStock === 0) {
      toast.error("Out of stock");
      return;
    }
    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success(`${product.name} added to cart!`, { autoClose: 1500 });
    navigate("/cart");
  };

  const tableRows = [
    {
      label: "Price",
      icon: <FaTag className="text-secondary" />,
      render: (p) => {
        const isLowest = p.price === minPrice;
        const originalPrice = p.price > 1000 ? (p.price * 1.2).toFixed(0) : null;
        return (
          <div className={`flex flex-col items-center gap-1 ${isLowest ? "text-emerald-500" : "text-zinc-900 dark:text-white"}`}>
            <span className={`text-2xl font-black tracking-tight ${isLowest ? "text-emerald-500" : ""}`}>
              ₹{p.price?.toLocaleString("en-IN")}
            </span>
            {originalPrice && (
              <span className="text-xs text-zinc-400 line-through">
                ₹{Number(originalPrice).toLocaleString("en-IN")}
              </span>
            )}
            {isLowest && displayProducts.length > 1 && (
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                <FaTrophy size={8} /> Best Price
              </span>
            )}
          </div>
        );
      },
    },
    {
      label: "Rating",
      icon: <FaStar className="text-secondary" />,
      render: (p) => {
        const isTopRated = p.rating === maxRating && maxRating > 0;
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  size={14}
                  className={i < Math.round(p.rating || 0) ? "text-secondary" : "text-zinc-200 dark:text-zinc-700"}
                />
              ))}
            </div>
            <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">
              {p.rating?.toFixed(1) || "0.0"} / 5
            </span>
            <span className="text-xs text-zinc-400">({p.numReviews || 0} reviews)</span>
            {isTopRated && displayProducts.length > 1 && (
              <span className="text-[10px] font-black uppercase tracking-widest bg-secondary/10 text-secondary px-2 py-0.5 rounded-full flex items-center gap-1">
                <FaFire size={8} /> Top Rated
              </span>
            )}
          </div>
        );
      },
    },
    {
      label: "Brand",
      icon: null,
      render: (p) => (
        <span className="font-black text-sm text-zinc-700 dark:text-zinc-200 uppercase tracking-widest">
          {p.brand || "—"}
        </span>
      ),
    },
    {
      label: "Category",
      icon: null,
      render: (p) => (
        <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
          {p.category?.name || "—"}
        </span>
      ),
    },
    {
      label: "Stock",
      icon: <FaBoxOpen className="text-secondary" />,
      render: (p) => (
        <div className="flex flex-col items-center gap-1">
          {p.countInStock > 0 ? (
            <>
              <FaCheckCircle className="text-emerald-500" size={20} />
              <span className="text-xs font-bold text-emerald-500">{p.countInStock} units</span>
            </>
          ) : (
            <>
              <FaTimesCircle className="text-red-400" size={20} />
              <span className="text-xs font-bold text-red-400">Out of Stock</span>
            </>
          )}
        </div>
      ),
    },
    {
      label: "Description",
      icon: null,
      render: (p) => (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-4 text-center">
          {p.description || "—"}
        </p>
      ),
    },
  ];

  if (ids.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface dark:bg-primary text-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-28 h-28 rounded-full bg-secondary/10 flex items-center justify-center">
            <FaBalanceScale className="text-secondary" size={48} />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">No Products Selected</h1>
          <p className="text-zinc-500 text-sm max-w-sm">
            Click the <strong>⚖ Compare</strong> button on any product to add it here. You can compare up to 3 products side by side.
          </p>
          <Link
            to="/shop"
            className="mt-2 inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-secondary text-primary font-black text-sm uppercase tracking-widest hover:bg-yellow-300 active:scale-95 transition-all shadow-xl shadow-secondary/30"
          >
            Browse Products
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-primary px-4 md:px-8 py-10 text-content-primary dark:text-surface">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <FaArrowLeft size={14} />
            </button>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-secondary mb-1">Side by Side</p>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                Compare <span className="text-secondary">Products</span>
              </h1>
            </div>
          </div>
          <button
            onClick={() => dispatch(clearCompare())}
            className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 border border-zinc-200 dark:border-zinc-700 px-5 py-2.5 rounded-xl transition-colors"
          >
            Clear All
          </button>
        </div>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <p className="text-red-400 text-center py-10">Failed to load products. Please try again.</p>
        ) : (
          <div className="overflow-x-auto pb-10">
            {/* Column headers — product cards */}
            <div
              className="grid gap-4 mb-4 min-w-[600px]"
              style={{ gridTemplateColumns: `200px repeat(${displayProducts.length}, 1fr)` }}
            >
              {/* Empty label column */}
              <div />
              {displayProducts.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative bg-white dark:bg-[#0c1222] rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-5 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-all"
                >
                  {/* Remove button */}
                  <button
                    onClick={() => dispatch(removeFromCompare(product._id))}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-all"
                  >
                    <FaTimes size={10} />
                  </button>

                  {/* Image */}
                  <div className="w-full aspect-[4/5] bg-zinc-50 dark:bg-[#080d1a] rounded-xl flex items-center justify-center p-4 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(e) => { e.target.src = "https://placehold.co/200x250?text=?"; }}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Name */}
                  <Link to={`/product/${product._id}`} className="text-center font-black text-sm text-zinc-900 dark:text-white hover:text-secondary transition-colors line-clamp-2">
                    {product.name}
                  </Link>

                  {/* Add to Cart */}
                  <button
                    onClick={() => addToCartHandler(product)}
                    disabled={product.countInStock === 0}
                    className="w-full flex items-center justify-center gap-2 bg-secondary text-primary font-black text-xs uppercase tracking-widest py-3 rounded-2xl hover:bg-yellow-300 active:scale-95 transition-all shadow-lg shadow-secondary/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FaShoppingCart size={12} />
                    {product.countInStock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Comparison Table Rows */}
            <div className="min-w-[600px] rounded-3xl border border-zinc-100 dark:border-zinc-800/60 overflow-hidden bg-white dark:bg-[#0a0f1e]">
              {tableRows.map((row, rowIdx) => (
                <div
                  key={row.label}
                  className={`grid gap-4 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors`}
                  style={{ gridTemplateColumns: `200px repeat(${displayProducts.length}, 1fr)` }}
                >
                  {/* Label column */}
                  <div className={`p-5 flex items-center gap-2 font-black text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-widest border-r border-zinc-100 dark:border-zinc-800/50 ${rowIdx % 2 === 0 ? "" : "bg-zinc-50/50 dark:bg-zinc-900/20"}`}>
                    {row.icon && <span className="text-secondary">{row.icon}</span>}
                    <span>{row.label}</span>
                  </div>

                  {/* Value columns */}
                  {displayProducts.map((product) => (
                    <div
                      key={product._id}
                      className={`p-5 flex items-center justify-center ${rowIdx % 2 === 0 ? "" : "bg-zinc-50/50 dark:bg-zinc-900/20"}`}
                    >
                      {row.render(product)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareProducts;
