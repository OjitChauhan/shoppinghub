import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";

const Product = ({ product }) => {
  return (
    <div className="group w-full max-w-sm mx-auto p-4 relative bg-white dark:bg-[#152340] rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-transparent dark:border-zinc-800">
      <div className="relative overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-900/50 aspect-square flex items-center justify-center">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
        <div className="absolute top-3 right-3 z-10">
          <HeartIcon product={product} />
        </div>
      </div>

      <div className="pt-4 pb-2">
        <Link to={`/product/${product._id}`}>
          <h2 className="flex justify-between items-start gap-4 text-[#285570] dark:text-background font-semibold group-hover:text-secondary dark:group-hover:text-secondary transition-colors">
            <div className="text-lg leading-tight line-clamp-2">{product.name}</div>
            <span className="bg-[#EFAF76] text-[#285570] text-sm font-bold min-w-fit px-3 py-1 rounded-full shadow-sm">
              ₹{product?.price?.toLocaleString("en-IN")}
            </span>
          </h2>
        </Link>
      </div>
    </div>
  );
};

export default Product;
