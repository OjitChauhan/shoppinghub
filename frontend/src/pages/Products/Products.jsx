import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from "../../redux/api/productApiSlice";
import Rating from "./Rating";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { addToCart } from "../../redux/features/cart/cartSlice";
import {
  FaBox,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaStore,
} from "react-icons/fa";
import moment from "moment";
import ProductTabs from "./Tabs";
import HeartIcon from "./HeartIcon";

const Products = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate("/cart");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await createReview({ productId, rating, comment }).unwrap();
      refetch();
      toast.success("Review created successfully");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <div>
        <Link
          className="text-[#3CBEAC] font-semibold hover:underline ml-[10rem]"
          to="/"
        >
          Go Back
        </Link>
      </div>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <div className="flex flex-wrap relative items-between mt-[2rem] ml-[10rem] gap-10">
            {/* Product Image & Heart */}
            <div className="bg-[#FAF7F6] rounded-xl p-5 shadow-lg relative max-w-xl">
              <img
                src={product.image}
                alt={product.name}
                className="w-full xl:w-[35rem] rounded-xl"
              />
              <HeartIcon product={product} />
            </div>
            {/* Product Info */}
            <div className="flex flex-col justify-between max-w-xl bg-white rounded-xl p-7 shadow-md">
              <h2 className="text-3xl font-bold text-[#285570] mb-4">{product.name}</h2>
              <p className="mb-4 text-base text-[#333333] opacity-90">
                {product.description}
              </p>
              <span className="text-4xl font-black text-[#3CBEAC] mb-2 block">
                Rs. {product.price}
              </span>
              {/* Meta Info */}
              <div className="flex items-center justify-between w-full mb-4">
                <div className="flex flex-col gap-2 text-[#285570]">
                  <span className="flex items-center gap-2">
                    <FaStore className="text-[#3CBEAC]" /> Brand: {product.brand}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaClock className="text-[#EFAF76]" />
                    Added: {moment(product.createdAt).fromNow()}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaStar className="text-[#EFAF76]" />
                    Reviews: {product.numReviews}
                  </span>
                </div>
                <div className="flex flex-col gap-2 text-[#285570]">
                  <span className="flex items-center gap-2">
                    <FaStar className="text-[#EFAF76]" />
                    Rating: {product.rating}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaShoppingCart className="text-[#3CBEAC]" />
                    Quantity: {product.quantity}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaBox className="text-[#3CBEAC]" />
                    In Stock: {product.countInStock}
                  </span>
                </div>
              </div>
              <div className="flex justify-between flex-wrap items-center gap-4 mb-4">
                <Rating
                  value={product.rating}
                  text={`${product.numReviews} reviews`}
                />
                {product.countInStock > 0 && (
                  <div>
                    <select
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="p-2 w-[6rem] rounded-lg border border-[#3CBEAC] text-[#285570]"
                    >
                      {[...Array(product.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <button
                onClick={addToCartHandler}
                disabled={product.countInStock === 0}
                className={`py-3 px-8 rounded-xl mt-1 font-semibold transition text-lg shadow-md
                  ${
                    product.countInStock === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#EFAF76] text-[#285570] hover:bg-[#3CBEAC] hover:text-white"
                  }
                `}
              >
                Add To Cart
              </button>
            </div>
          </div>
          {/* Tabs / Reviews */}
          <div className="mt-[5rem] container flex flex-wrap items-start justify-between ml-[10rem]">
            <ProductTabs
              loadingProductReview={loadingProductReview}
              userInfo={userInfo}
              submitHandler={submitHandler}
              rating={rating}
              setRating={setRating}
              comment={comment}
              setComment={setComment}
              product={product}
            />
          </div>
        </>
      )}
    </>
  );
};

export default Products;

