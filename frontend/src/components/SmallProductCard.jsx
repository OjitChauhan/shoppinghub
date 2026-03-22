import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCompare, removeFromCompare } from "../redux/features/compare/compareSlice";
import { toast } from "react-toastify";
import { FaBalanceScale } from "react-icons/fa";

const SmallProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const compareList = useSelector((state) => state.compare.compareList);
  const isInCompare = compareList.some((item) => item._id === product._id);

  const toggleCompare = (e) => {
    e.preventDefault();
    if (isInCompare) {
      dispatch(removeFromCompare(product._id));
      toast.info("Removed from comparison", { autoClose: 1200, hideProgressBar: true });
    } else if (compareList.length >= 3) {
      toast.warn("You can only compare up to 3 products", { autoClose: 2000 });
    } else {
      dispatch(addToCompare(product));
      toast.success("Added to compare!", { autoClose: 1200, hideProgressBar: true });
    }
  };

  return (
    <div className="group relative w-full bg-white dark:bg-[#0c1222] rounded-[1.75rem] shadow-sm hover:shadow-2xl dark:shadow-none transition-all duration-500 hover:-translate-y-2 flex flex-col overflow-hidden border border-zinc-100 dark:border-zinc-800/50 hover:border-secondary/40">

      {/* Image */}
      <div className="relative w-full aspect-[3/4] bg-zinc-50 dark:bg-[#080d1a] flex items-center justify-center p-7 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x500?text=Image"; }}
          className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
        />

        {/* Premium tag */}
        {product.price > 5000 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-secondary text-primary text-[10px] font-black px-3 py-1 rounded-full shadow uppercase tracking-widest">
              Premium
            </span>
          </div>
        )}

        {/* Compare badge while active */}
        {isInCompare && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-secondary text-primary text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <FaBalanceScale size={8} /> Comparing
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <Link
          to={`/product/${product._id}`}
          className="absolute inset-0 bg-black/5 dark:bg-black/25 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center"
        >
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-5 py-2.5 rounded-2xl font-black text-[10px] tracking-widest shadow-2xl translate-y-6 group-hover:translate-y-0 transition-transform duration-500 uppercase">
            Explore Details
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-2 flex-grow">
        <div className="flex justify-between items-center">
          <span className="text-[9px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-[0.15em]">
            {product.brand}
          </span>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${product.countInStock > 0
            ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
            : "bg-zinc-300 dark:bg-zinc-700"}`}
          />
        </div>

        <Link to={`/product/${product._id}`}>
          <h3 className="font-black text-base text-zinc-900 dark:text-white leading-tight line-clamp-1 transition-colors group-hover:text-secondary tracking-tight">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/50">
          <span className="text-lg font-black text-zinc-900 dark:text-secondary tracking-tight">
            ₹{product?.price?.toLocaleString?.("en-IN") ?? product?.price}
          </span>

          <div className="flex items-center gap-2">
            {/* Compare toggle */}
            <button
              onClick={toggleCompare}
              title={isInCompare ? "Remove from compare" : "Add to compare"}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all duration-300 border ${
                isInCompare
                  ? "bg-secondary border-secondary text-primary shadow-lg shadow-secondary/30"
                  : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:bg-secondary/10 hover:border-secondary/50 hover:text-secondary"
              }`}
            >
              <FaBalanceScale size={12} />
            </button>

            <Link
              to={`/product/${product._id}`}
              className="w-9 h-9 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:bg-secondary group-hover:text-black group-hover:border-secondary transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmallProductCard;
