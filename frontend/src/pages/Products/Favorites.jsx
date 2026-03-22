import { useSelector } from "react-redux";
import { selectFavoriteProduct } from "../../redux/features/favorites/favoriteSlice";
import { Link } from "react-router-dom";

const Favorites = () => {
  const favorites = useSelector(selectFavoriteProduct);

  return (
    <div
      className="min-h-screen py-6 px-4"
      style={{
        background: "linear-gradient(135deg, #FAF7F6 0%, #E3DED7 100%)",
      }}
    >
      {/* Header */}
      <h1 className="text-3xl sm:text-4xl font-bold text-[#285570] mb-8 text-center drop-shadow-lg">
        ❤️ Favorite Products
      </h1>

      {/* Empty state */}
      {favorites.length === 0 ? (
        <div className="text-center bg-[#E3DED7] text-[#333333] py-12 rounded-2xl shadow-lg max-w-xl mx-auto">
          <p className="text-lg mb-4">You haven’t added any favorites yet.</p>
          <p className="text-[#285570] font-semibold">
            Browse products and click the{" "}
            <span className="text-[#3CBEAC]">♥</span> icon to save them here!
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
                  bg-white
                  border border-[#E3DED7]
                  rounded-2xl
                  shadow-lg
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
                  <h3 className="font-semibold text-[#285570] truncate">
                    {product.name}
                  </h3>
                  <p className="text-[#3CBEAC] font-bold">
                    Rs.{product.price?.toFixed(2)}
                  </p>
                </div>

                {/* Hover overlay */}
                <div
                  className="
                    absolute inset-0 bg-black bg-opacity-20 rounded-2xl 
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
