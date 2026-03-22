import { useGetTopProductsQuery } from "../../redux/api/productApiSlice";
import Message from "../../components/Message";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaHeart, FaStar, FaStore } from "react-icons/fa";
import "./ProductCarousel3DEffect.css";

const ProductCarousel = () => {
  const { data: products = [], isLoading, error } = useGetTopProductsQuery();

  const settings = {
    dots: true,
    infinite: true,
    speed: 300, // Fast animation speed
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 2500,
    centerMode: true,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          centerMode: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          arrows: false,
          centerPadding: "0px",
        },
      },
    ],
  };

  return (
    <div className="w-full bg-zinc-50 dark:bg-zinc-900/40 rounded-[2rem] py-12 px-4 shadow-inner">
      {isLoading ? null : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Slider
          {...settings}
          className="product-carousel-3d w-full max-w-[1200px] mx-auto"
        >
          {products.map((product) => (
            <div key={product._id} className="px-4 py-8">
              <Link to={`/product/${product._id}`} className="block group">
                <div className="carousel-card-3d bg-white dark:bg-[#0c1222] rounded-[2.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800/80 p-8 flex flex-col items-center relative w-full min-h-[460px] transition-all duration-500 hover:-translate-y-4 hover:shadow-secondary/20">
                  {/* Product Image */}
                  <div className="w-full flex justify-center mb-8 overflow-hidden rounded-[2rem] bg-zinc-50 dark:bg-zinc-950 p-6 aspect-square relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-secondary/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <div className="bg-white/90 text-primary px-6 py-2 rounded-full font-black text-[10px] tracking-widest uppercase shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        View Masterpiece
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="w-full flex flex-col items-center gap-3">
                    <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 tracking-[0.2em] uppercase">
                      {product.brand}
                    </span>

                    <h2 className="text-xl font-black text-content-primary dark:text-white text-center tracking-tight line-clamp-1 uppercase group-hover:text-secondary transition-colors">
                      {product.name}
                    </h2>

                    <div className="text-3xl font-black text-content-primary dark:text-secondary tracking-tighter">
                      ₹{product.price?.toLocaleString("en-IN")}
                    </div>

                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 w-full justify-center">
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        <FaStar className="text-secondary" /> {product.rating.toFixed(1)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800"></span>
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        <FaHeart className="text-rose-500" /> {product.numReviews}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default ProductCarousel;
