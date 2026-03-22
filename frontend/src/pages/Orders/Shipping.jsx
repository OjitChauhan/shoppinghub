import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  saveShippingAddress,
  savePaymentMethod,
} from "../../redux/features/cart/cartSlice";
import ProgressSteps from "../../components/ProgressSteps";

const Shipping = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [paymentMethod, setPaymentMethod] = useState("PayPal");
  const [address, setAddress] = useState(shippingAddress.address || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ""
  );
  const [country, setCountry] = useState(shippingAddress.country || "");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    dispatch(savePaymentMethod(paymentMethod));
    navigate("/placeorder");
  };

  // Payment check
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate("/shipping");
    }
  }, [navigate, shippingAddress]);

  return (
    <div className="container mx-auto mt-10 px-4">
      <ProgressSteps step1 step2 />

      <div className="mt-12 flex justify-center items-center">
        <form
          onSubmit={submitHandler}
          className="w-full max-w-lg bg-[#E3DED7] rounded-xl shadow-md p-8"
        >
          <h1 className="text-3xl font-bold text-[#285570] mb-6 text-center">
            Shipping Information
          </h1>

          {/* Address */}
          <div className="mb-5">
            <label className="block text-[#333333] font-semibold mb-2">
              Address
            </label>
            <input
              type="text"
              className="w-full p-3 border border-[#ccc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3CBEAC]"
              placeholder="Enter your address"
              value={address}
              required
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* City */}
          <div className="mb-5">
            <label className="block text-[#333333] font-semibold mb-2">
              City
            </label>
            <input
              type="text"
              className="w-full p-3 border border-[#ccc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3CBEAC]"
              placeholder="Enter your city"
              value={city}
              required
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* Postal Code */}
          <div className="mb-5">
            <label className="block text-[#333333] font-semibold mb-2">
              Postal Code
            </label>
            <input
              type="text"
              className="w-full p-3 border border-[#ccc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3CBEAC]"
              placeholder="Enter postal code"
              value={postalCode}
              required
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>

          {/* Country */}
          <div className="mb-5">
            <label className="block text-[#333333] font-semibold mb-2">
              Country
            </label>
            <input
              type="text"
              className="w-full p-3 border border-[#ccc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3CBEAC]"
              placeholder="Enter country"
              value={country}
              required
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-[#333333] font-semibold mb-3">
              Payment Method
            </label>
            <div className="flex items-center bg-white border border-[#ccc] rounded-md p-3">
              <input
                type="radio"
                id="paypal"
                className="text-[#3CBEAC] focus:ring-[#285570]"
                name="paymentMethod"
                value="PayPal"
                checked={paymentMethod === "PayPal"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <label
                htmlFor="paypal"
                className="ml-2 text-[#333333] cursor-pointer"
              >
                PayPal or Credit Card
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#EFAF76] hover:bg-[#3CBEAC] hover:text-white text-[#333333] font-semibold text-lg rounded-md transition duration-200 shadow-md"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default Shipping;
