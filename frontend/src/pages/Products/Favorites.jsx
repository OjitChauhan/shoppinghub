import { useSelector } from "react-redux";
import { selectFavoriteProduct } from "../../redux/features/favorites/favoriteSlice";
import { Link } from "react-router-dom";

const Favorites = () => {
  const favorites = useSelector(selectFavoriteProduct);

  return (
    <div className="min-h-screen py-6 px-4 bg-gradient-to-br from-[#fff7fb] via-[#fff0f7] to-[#ffe4f1] dark:from-[#0a0a0b] dark:via-[#131316] dark:to-[#1a1a20] transition-colors duration-300 rounded-[2rem]">
      {/* Header */}
      <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-8 text-center drop-shadow-lg">
        ❤️ Favorite Products
      </h1>

      {/* Empty state */}
      {favorites.length === 0 ? (
        <div className="text-center bg-white/75 dark:bg-white/5 text-zinc-700 dark:text-zinc-200 py-12 rounded-2xl shadow-lg max-w-xl mx-auto border border-pink-100 dark:border-pink-500/20 backdrop-blur-md">
          <p className="text-lg mb-4">You haven’t added any favorites yet.</p>
          <p className="text-zinc-800 dark:text-zinc-200 font-semibold">
            Browse products and click the{" "}
            <span className="text-pink-500">♥</span> icon to save them here!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {favorites.map((product) => (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="perspective"
            >
              <div
                className="
                  relative
                  bg-white dark:bg-[#141418]
                  border border-pink-100 dark:border-pink-500/20
                  rounded-2xl
                  shadow-lg
                  dark:shadow-black/30
                  transition-transform
                  duration-500
                  transform
                  hover:-translate-y-2
                  hover:scale-105
                  hover:rotate-x-3
                  hover:rotate-y-3
                  hover:shadow-2xl
                  flex flex-col
                  h-[290px]
                  p-4
                  cursor-pointer
                "
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Image */}
                <div className="flex justify-center items-center h-40 w-full mb-3 overflow-hidden rounded-xl">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-contain h-full w-full transition-transform duration-500 hover:scale-110"
                  />
                </div>

                {/* Product Info */}
                <div className="flex flex-col justify-between flex-1 text-sm sm:text-base">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {product.name}
                  </h3>
                  <p className="text-pink-500 font-bold">
                    Rs.{product.price?.toFixed(2)}
                  </p>
                </div>

                {/* Hover overlay */}
                <div
                  className="
                    absolute inset-0 bg-black/25 dark:bg-black/35 rounded-2xl 
                    opacity-0 hover:opacity-100 transition-opacity duration-300
                    flex items-center justify-center text-white text-sm font-bold
                  "
                >
                  View Details
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
