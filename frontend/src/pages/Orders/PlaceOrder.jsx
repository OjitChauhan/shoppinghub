import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Message from "../../components/Message";
import ProgressSteps from "../../components/ProgressSteps";
import Loader from "../../components/Loader";
import { useCreateOrderMutation } from "../../redux/api/orderApiSlice";
import { clearCartItems } from "../../redux/features/cart/cartSlice";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate("/shipping");
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <>
      <ProgressSteps step1 step2 step3 />

      <div className="container mx-auto mt-10 px-6">
        {cart.cartItems.length === 0 ? (
          <Message>Your cart is empty</Message>
        ) : (
          <>
            {/* 🛒 CART ITEMS TABLE */}
            <div className="overflow-x-auto bg-[#E3DED7] rounded-lg shadow-md p-6 mb-10">
              <h2 className="text-2xl font-bold text-[#285570] mb-4">
                Review Your Order
              </h2>
              <table className="w-full border-collapse">
                <thead className="bg-[#285570] text-white">
                  <tr>
                    <th className="p-3 text-left">Image</th>
                    <th className="p-3 text-left">Product</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-center">Price</th>
                    <th className="p-3 text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.cartItems.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-[#f9f7f3]"
                    >
                      <td className="p-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-md object-cover"
                        />
                      </td>
                      <td className="p-3">
                        <Link
                          to={`/product/${item.product}`}
                          className="text-[#333333] hover:text-[#3CBEAC] font-medium transition"
                        >
                          {item.name}
                        </Link>
                      </td>
                      <td className="p-3 text-center">{item.qty}</td>
                      <td className="p-3 text-center">$ {item.price.toFixed(2)}</td>
                      <td className="p-3 text-center text-[#285570] font-semibold">
                        $ {(item.qty * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 📦 ORDER SUMMARY + SHIPPING INFO */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* LEFT: ORDER SUMMARY */}
              <div className="lg:w-1/2 bg-white border border-[#E3DED7] rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-[#285570] mb-4">
                  Order Summary
                </h2>

                <ul className="space-y-3 text-[#333333] text-lg">
                  <li className="flex justify-between">
                    <span>Items:</span>
                    <span className="font-semibold">$ {cart.itemsPrice}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Shipping:</span>
                    <span className="font-semibold">$ {cart.shippingPrice}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Tax:</span>
                    <span className="font-semibold">$ {cart.taxPrice}</span>
                  </li>
                  <li className="flex justify-between text-xl font-bold text-[#285570] border-t border-[#E3DED7] pt-3">
                    <span>Total:</span>
                    <span>$ {cart.totalPrice}</span>
                  </li>
                </ul>

                {error && (
                  <Message variant="danger" className="mt-4">
                    {error.data.message}
                  </Message>
                )}
              </div>

              {/* RIGHT: SHIPPING + PAYMENT */}
              <div className="lg:w-1/2 bg-[#E3DED7] rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-[#285570] mb-4">
                  Shipping & Payment
                </h2>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[#3CBEAC] mb-2">
                    Shipping Address
                  </h3>
                  <p className="text-[#333333]">
                    {cart.shippingAddress.address},{" "}
                    {cart.shippingAddress.city},{" "}
                    {cart.shippingAddress.postalCode},{" "}
                    {cart.shippingAddress.country}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#3CBEAC] mb-2">
                    Payment Method
                  </h3>
                  <p className="text-[#333333]">{cart.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* 🚀 PLACE ORDER BUTTON */}
            <div className="mt-10">
              <button
                type="button"
                className="w-full py-3 rounded-lg text-lg font-semibold bg-[#EFAF76] text-[#333333] hover:bg-[#3CBEAC] hover:text-white transition duration-200 shadow-md"
                disabled={cart.cartItems.length === 0}
                onClick={placeOrderHandler}
              >
                Place Order
              </button>

              {isLoading && <Loader />}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PlaceOrder;
