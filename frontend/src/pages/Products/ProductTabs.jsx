import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import Ratings from "./Ratings";
import { useGetRelatedProductsQuery } from "../../redux/api/productApiSlice";
import SmallProductCard from "../../components/SmallProductCard";
import Loader from "../../components/Loader";

const ProductTabs = ({
  loadingProductReview,
  userInfo,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  product,
}) => {
  const { id: productId } = useParams();
  const { data: relatedProducts, isLoading } = useGetRelatedProductsQuery(productId);
  const [activeTab, setActiveTab] = useState(1);
  const [hoverRating, setHoverRating] = useState(0);

  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const canScroll = scrollWidth > clientWidth;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(canScroll && scrollLeft < scrollWidth - clientWidth - 10);

      const progress = canScroll
        ? (scrollLeft / (scrollWidth - clientWidth)) * 100
        : 0;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    if (activeTab === 3) {
      setTimeout(handleScroll, 100); // Small delay to ensure DOM is ready
      const el = scrollRef.current;
      if (el) {
        el.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleScroll);
        return () => {
          el.removeEventListener("scroll", handleScroll);
          window.removeEventListener("resize", handleScroll);
        };
      }
    }
  }, [activeTab, relatedProducts]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  const handleTabClick = (tabNumber) => {
    setActiveTab(tabNumber);
  };

  const tabs = [
    { id: 1, label: "Write Review" },
    { id: 2, label: "All Reviews" },
    { id: 3, label: "Top Picks" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 mt-12 w-full max-w-full overflow-hidden">
      {/* --- Tab Navigation --- */}
      <section className="flex flex-row lg:flex-col w-full lg:w-1/4 gap-2 scrollbar-none overflow-x-auto pb-2 lg:pb-0 flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`whitespace-nowrap flex-1 lg:flex-none text-left px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300 border-2 ${activeTab === tab.id
              ? "bg-secondary border-secondary text-primary shadow-lg shadow-secondary/20"
              : "bg-surface dark:bg-primary border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:border-secondary/50 hover:text-secondary"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {/* --- Tab Content --- */}
      <section className="flex-1 bg-white dark:bg-[#0c1222] rounded-[2.5rem] shadow-xl p-8 sm:p-10 border border-zinc-100 dark:border-zinc-800 min-h-[400px] min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {/* --- Write Review Tab --- */}
            {activeTab === 1 && (
              <div className="w-full max-w-lg">
                <h3 className="text-2xl font-black mb-8 text-content-primary dark:text-surface tracking-tight">Express Your Experience</h3>
                {userInfo ? (
                  <form onSubmit={submitHandler} className="space-y-8">
                    {/* Interactive Star Rating */}
                    <div className="space-y-4">
                      <label className="block text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                        Select Rating
                      </label>
                      <div className="flex items-center gap-4 bg-zinc-50 dark:bg-primary-dark p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-inner">
                        <Ratings
                          value={hoverRating || rating}
                          onSelect={setRating}
                          onHover={setHoverRating}
                          onLeave={() => setHoverRating(0)}
                        />
                        <span className="text-xl font-black text-secondary w-8 text-center">{hoverRating || rating || 0}</span>
                      </div>
                    </div>

                    {/* Comment Area */}
                    <div className="space-y-4">
                      <label htmlFor="comment" className="block text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                        Detailed Thoughts
                      </label>
                      <textarea
                        id="comment"
                        rows="5"
                        required
                        placeholder="What did you think about this masterpiece?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-6 bg-zinc-50 dark:bg-primary-dark border-2 border-zinc-100 dark:border-zinc-800 rounded-3xl text-content-primary dark:text-surface font-bold placeholder:text-zinc-400 focus:outline-none focus:border-secondary transition-all shadow-inner resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={loadingProductReview || !rating}
                      className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-xl transition-all active:scale-95 ${loadingProductReview || !rating
                        ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed"
                        : "bg-secondary text-primary hover:bg-yellow-400 shadow-secondary/20 hover:-translate-y-1"
                        }`}
                    >
                      {loadingProductReview ? "Validating..." : "Publish Review"}
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-zinc-50 dark:bg-primary-dark flex items-center justify-center text-3xl shadow-inner border border-zinc-100 dark:border-zinc-800">
                      🔒
                    </div>
                    <p className="text-zinc-500 font-bold max-w-xs">
                      Join the community to share your thoughts on this product.
                    </p>
                    <Link
                      to="/login"
                      className="px-8 py-3 bg-secondary text-primary rounded-full font-black text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all"
                    >
                      Sign In to Review
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* --- All Reviews Tab --- */}
            {activeTab === 2 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-black mb-8 text-content-primary dark:text-surface tracking-tight">Community Feedback</h3>
                {product.reviews.length === 0 ? (
                  <div className="text-center py-20 bg-zinc-50 dark:bg-primary-dark rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <p className="text-zinc-400 font-bold italic">Be the first to leave a legacy for this product.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {product.reviews.map((review, index) => (
                      <div
                        key={review._id || `review-${index}`}
                        className="bg-zinc-50 dark:bg-primary-dark p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-1">
                            <h4 className="font-black text-content-primary dark:text-surface">{review.name}</h4>
                            <p className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]">Verified Collector</p>
                          </div>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            {review.createdAt.substring(0, 10)}
                          </span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-6 font-medium leading-relaxed italic">
                          "{review.comment}"
                        </p>
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                          <Ratings value={review.rating} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- Related Products Tab --- */}
            {activeTab === 3 && (
              <div className="space-y-8 h-full relative group/scrollbar max-w-full overflow-hidden">
                <div className="flex justify-between items-end mb-8">
                  <h3 className="text-2xl font-black text-content-primary dark:text-surface tracking-tight">Top Picks For You</h3>

                  {/* Progress Indicator */}
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="w-40 h-1.5 bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-secondary shadow-[0_0_15px_rgba(212,175,55,0.6)]"
                        initial={{ width: "10%" }}
                        animate={{ width: `${Math.max(10, scrollProgress)}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  {/* Gradient Overlays */}
                  <AnimatePresence>
                    {showLeftArrow && (
                      <motion.div
                        key="left-gradient"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-0 top-0 bottom-8 w-24 bg-gradient-to-r from-white dark:from-[#0c1222] to-transparent z-10 pointer-events-none"
                      />
                    )}
                    {showRightArrow && (
                      <motion.div
                        key="right-gradient"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute right-0 top-0 bottom-8 w-24 bg-gradient-to-l from-white dark:from-[#0c1222] to-transparent z-10 pointer-events-none"
                      />
                    )}
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="absolute inset-y-0 -left-4 sm:-left-6 flex items-center z-20 pointer-events-none">
                    <AnimatePresence>
                      {showLeftArrow && (
                        <motion.button
                          key="left-arrow"
                          initial={{ opacity: 0, scale: 0.8, x: -10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.8, x: -10 }}
                          onClick={() => scroll("left")}
                          className="pointer-events-auto w-12 h-12 rounded-full bg-white dark:bg-zinc-800 shadow-2xl border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-secondary hover:bg-secondary hover:text-primary transition-all active:scale-95 group/btn"
                        >
                          <HiChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="absolute inset-y-0 -right-4 sm:-right-6 flex items-center z-20 pointer-events-none">
                    <AnimatePresence>
                      {showRightArrow && (
                        <motion.button
                          key="right-arrow"
                          initial={{ opacity: 0, scale: 0.8, x: 10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.8, x: 10 }}
                          onClick={() => scroll("right")}
                          className="pointer-events-auto w-12 h-12 rounded-full bg-white dark:bg-zinc-800 shadow-2xl border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-secondary hover:bg-secondary hover:text-primary transition-all active:scale-95 group/btn"
                        >
                          <HiChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>

                  <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex gap-6 overflow-x-auto pb-8 scrollbar-none snap-x snap-mandatory scroll-smooth"
                  >
                    {relatedProducts?.length === 0 ? (
                      <p className="text-zinc-400 font-bold italic py-10">Searching for similar masterpieces...</p>
                    ) : (
                      relatedProducts?.map((prod, index) => (
                        <div key={prod._id || `related-${index}`} className="min-w-[280px] snap-start">
                          <SmallProductCard product={prod} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
};

export default ProductTabs;

