import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { clearCompare, removeFromCompare } from "../redux/features/compare/compareSlice";
import { FaTimes, FaBalanceScale } from "react-icons/fa";

const CompareBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const compareList = useSelector((state) => state.compare.compareList);

  return (
    <AnimatePresence>
      {compareList.length > 0 && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998] w-[95vw] max-w-2xl"
        >
          <div className="flex items-center gap-3 bg-white/80 dark:bg-[#0c1222]/90 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-700/60 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-3 pr-4">
            {/* Product Thumbnails */}
            <div className="flex gap-2 flex-1 items-center min-w-0">
              {[0, 1, 2].map((i) => {
                const product = compareList[i];
                return (
                  <div
                    key={i}
                    className={`relative flex-1 h-14 rounded-2xl border-2 ${
                      product
                        ? "border-secondary/50 bg-zinc-50 dark:bg-zinc-800/50"
                        : "border-dashed border-zinc-200 dark:border-zinc-700/50 bg-zinc-50/50 dark:bg-zinc-900/30"
                    } flex items-center justify-center overflow-hidden transition-all duration-300`}
                  >
                    {product ? (
                      <>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 object-contain"
                          onError={(e) => { e.target.src = "https://placehold.co/80?text=?"; }}
                        />
                        <button
                          onClick={() => dispatch(removeFromCompare(product._id))}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                          aria-label="Remove from compare"
                        >
                          <FaTimes size={8} />
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-bold text-center px-1 select-none">
                        + Add
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => dispatch(clearCompare())}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors px-3 py-2"
              >
                Clear
              </button>
              <button
                onClick={() => navigate("/compare")}
                disabled={compareList.length < 2}
                className="flex items-center gap-2 bg-secondary text-primary font-black text-xs uppercase tracking-widest px-5 py-3 rounded-2xl hover:bg-yellow-300 active:scale-95 transition-all shadow-lg shadow-secondary/30 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaBalanceScale size={13} />
                Compare {compareList.length < 2 ? `(need ${2 - compareList.length} more)` : "Now"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompareBar;
