import { useGetTopProductsQuery } from "../redux/api/productApiSlice";
import Loader from "./Loader";
import SmallProductCard from "./SmallProductCard";
import ProductCarousel from "../pages/Products/ProductCarousel";
import HeroBackground3D from "./HeroBackground3D";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBalanceScale, FaShoppingBag, FaStar } from "react-icons/fa";

const Header = () => {
  const { data, isLoading, error } = useGetTopProductsQuery();

  if (isLoading) return <Loader />;
  if (error) return <div className="h-[400px] flex items-center justify-center text-red-500 font-bold">Failed to load trending products.</div>;

  return (
    <header className="w-full bg-surface dark:bg-primary overflow-hidden transition-colors duration-300">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden min-h-[520px] md:min-h-[580px] py-16 md:py-28 px-4 md:px-14 xl:px-24"
        style={{ background: "#05091A" }}>
        {/* React Three Fiber 3D animated scene */}
        <HeroBackground3D />
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 z-0 pointer-events-none"
          style={{ background:"linear-gradient(to right, rgba(5,9,26,0.88) 0%, rgba(5,9,26,0.55) 60%, rgba(5,9,26,0.25) 100%)" }} />

        <div className="relative z-10 max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
          {/* Left – Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex-1 text-white text-center lg:text-left max-w-2xl"
          >
            <span className="inline-block text-[10px] font-black tracking-[0.35em] uppercase text-secondary mb-5 border border-secondary/30 px-4 py-1.5 rounded-full bg-secondary/10">
              ✦ New Season, New Style
            </span>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
              Discover
              <br />
              <span className="text-shimmer">Premium</span>
              <br />
              Products
            </h1>
            <p className="text-zinc-400 text-sm md:text-base font-medium max-w-md mx-auto lg:mx-0 leading-relaxed mb-10">
              Explore our curated collection. Compare products side-by-side, find the best value, and shop with confidence.
            </p>

            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2.5 bg-secondary text-primary font-black text-sm uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-yellow-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] active:scale-95 transition-all shadow-xl shadow-secondary/20"
              >
                <FaShoppingBag size={14} />
                Shop Now
              </Link>
              <Link
                to="/compare"
                className="inline-flex items-center gap-2.5 border border-white/20 text-white font-black text-sm uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-white/10 active:scale-95 transition-all backdrop-blur-sm"
              >
                <FaBalanceScale size={14} />
                Compare
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8 mt-12 justify-center lg:justify-start">
              {[
                { label: "Products", value: "500+" },
                { label: "Brands", value: "80+" },
                { label: "Reviews", value: "12k+" },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <p className="text-2xl font-black text-secondary">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right – Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block w-full lg:w-[55%] flex-shrink-0"
          >
            <ProductCarousel />
          </motion.div>
        </div>
      </div>

      {/* ── Trending Now Strip ── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-12 py-14">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-2">Top Picks</p>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <FaStar className="text-secondary" size={20} />
              Trending <span className="text-secondary">Now</span>
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-secondary transition-colors flex items-center gap-1.5"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {data.slice(0, 4).map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <SmallProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
