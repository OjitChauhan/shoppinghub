import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { addToCompare, removeFromCompare } from "../../redux/features/compare/compareSlice";
import { toast } from "react-toastify";
import HeartIcon from "./HeartIcon";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { FaBalanceScale } from "react-icons/fa";

const ProductCard = ({ p }) => {
  const dispatch = useDispatch();
  const compareList = useSelector((state) => state.compare.compareList);
  const isInCompare = compareList.some((item) => item._id === p._id);

  const addToCartHandler = () => {
    dispatch(addToCart({ ...p, qty: 1 }));
    toast.success("Added to cart!", { position: toast.POSITION.TOP_RIGHT, autoClose: 1800 });
  };

  const toggleCompare = (e) => {
    e.preventDefault();
    if (isInCompare) {
      dispatch(removeFromCompare(p._id));
      toast.info("Removed from comparison", { autoClose: 1200, hideProgressBar: true });
    } else if (compareList.length >= 3) {
      toast.warn("You can only compare up to 3 products", { autoClose: 2000 });
    } else {
      dispatch(addToCompare(p));
      toast.success("Added to compare!", { autoClose: 1200, hideProgressBar: true });
    }
  };

  return (
    <div className="group relative w-full bg-white dark:bg-[#0c1222] rounded-[1.75rem] shadow-sm hover:shadow-2xl dark:shadow-none transition-all duration-500 hover:-translate-y-2 flex flex-col overflow-hidden border border-zinc-100 dark:border-zinc-800/50 hover:border-secondary/40">

      {/* Image area */}
      <div className="relative w-full aspect-[4/5] bg-zinc-50 dark:bg-[#080d1a] flex items-center justify-center p-6 overflow-hidden">
        <img
          src={p.image}
          alt={p.name}
          onError={(e) => { e.target.src = "https://placehold.co/400x500?text=Image"; }}
          className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-xl"
        />

        {/* Heart */}
        <div className="absolute top-3 right-3 z-20">
          <HeartIcon product={p} />
        </div>

        {/* Brand badge */}
        {p.brand && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-white/80 dark:bg-black/60 backdrop-blur-sm text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 shadow">
              {p.brand}
            </span>
          </div>
        )}

        {/* Out of stock ribbon */}
        {p.countInStock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Out of stock</span>
          </div>
        )}

        {/* Compare badge while active */}
        {isInCompare && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="bg-secondary text-primary text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
              <FaBalanceScale size={8} /> In Compare
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <Link
          to={`/product/${p._id}`}
          className="absolute inset-0 bg-black/5 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center z-10"
        >
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-5 py-2.5 rounded-2xl font-black text-[10px] tracking-widest shadow-2xl translate-y-6 group-hover:translate-y-0 transition-transform duration-500 uppercase border border-white/20">
            View Details
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-2.5 flex-grow">
        <Link to={`/product/${p._id}`}>
          <h3 className="font-black text-base text-zinc-900 dark:text-white leading-snug line-clamp-2 group-hover:text-secondary transition-colors tracking-tight">
            {p.name}
          </h3>
        </Link>

        <p className="text-zinc-400 dark:text-zinc-500 text-xs line-clamp-2 leading-relaxed">{p.description}</p>

        {/* Footer */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60">
          <div>
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Price</span>
            <span className="text-lg font-black text-zinc-900 dark:text-secondary tracking-tight">
              ₹{p?.price?.toLocaleString?.("en-IN") ?? p?.price}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Compare toggle */}
            <button
              onClick={toggleCompare}
              title={isInCompare ? "Remove from compare" : "Add to compare"}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all duration-300 border ${
                isInCompare
                  ? "bg-secondary border-secondary text-primary shadow-lg shadow-secondary/30"
                  : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:bg-secondary/10 hover:border-secondary/50 hover:text-secondary"
              }`}
            >
              <FaBalanceScale size={13} />
            </button>

            {/* Add to cart */}
            <button
              onClick={(e) => { e.preventDefault(); addToCartHandler(); }}
              disabled={p.countInStock === 0}
              className="w-11 h-11 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-secondary hover:border-secondary hover:text-black transition-all duration-300 active:scale-90 shadow disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <AiOutlineShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
