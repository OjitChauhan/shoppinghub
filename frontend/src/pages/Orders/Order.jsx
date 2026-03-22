import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Messsage from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  useGetPaypalClientIdQuery,
  usePayOrderMutation,
} from "../../redux/api/orderApiSlice";

const Order = () => {
  const { id: orderId } = useParams();

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  const {
    data: paypal,
    isLoading: loadingPaPal,
    error: errorPayPal,
  } = useGetPaypalClientIdQuery();

  useEffect(() => {
    if (!errorPayPal && !loadingPaPal && paypal.clientId) {
      const loadPaypalScript = async () => {
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": paypal.clientId,
            currency: "USD",
          },
        });
        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      };

      if (order && !order.isPaid) {
        if (!window.paypal) {
          loadPaypalScript();
        }
      }
    }
  }, [errorPayPal, loadingPaPal, order, paypal, paypalDispatch]);

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        await payOrder({ orderId, details });
        refetch();
        toast.success("Order is paid");
      } catch (error) {
        toast.error(error?.data?.message || error.message);
      }
    });
  }

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [{ amount: { value: order.totalPrice } }],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  function onError(err) {
    toast.error(err.message);
  }

  const deliverHandler = async () => {
    await deliverOrder(orderId);
    refetch();
  };

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Messsage variant="danger">{error.data.message}</Messsage>
  ) : (
    <div className="container mx-auto px-6 py-8 md:flex md:gap-8">
      {/* LEFT: ORDER ITEMS */}
      <div className="md:w-2/3 bg-[#E3DED7] rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-[#285570] mb-4">
          Order Items
        </h2>
        {order.orderItems.length === 0 ? (
          <Messsage>Order is empty</Messsage>
        ) : (
          <div className="overflow-x-auto">
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
                {order.orderItems.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-[#f9f7f3]"
                  >
                    <td className="p-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    </td>
                    <td className="p-3 text-[#333333] font-medium">
                      <Link
                        to={`/product/${item.product}`}
                        className="hover:text-[#3CBEAC] transition"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="p-3 text-center">{item.qty}</td>
                    <td className="p-3 text-center">$ {item.price}</td>
                    <td className="p-3 text-center font-semibold text-[#285570]">
                      $ {(item.qty * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RIGHT: SUMMARY */}
      <div className="md:w-1/3 bg-white rounded-lg shadow-lg p-6 border border-[#E3DED7]">
        <h2 className="text-2xl font-bold text-[#285570] mb-4">Order Summary</h2>

        <div className="text-[#333333] space-y-2 mb-4">
          <p>
            <strong className="text-[#3CBEAC]">Order ID:</strong> {order._id}
          </p>
          <p>
            <strong className="text-[#3CBEAC]">Name:</strong>{" "}
            {order.user.username}
          </p>
          <p>
            <strong className="text-[#3CBEAC]">Email:</strong>{" "}
            {order.user.email}
          </p>
          <p>
            <strong className="text-[#3CBEAC]">Address:</strong>{" "}
            {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.postalCode},{" "}
            {order.shippingAddress.country}
          </p>
          <p>
            <strong className="text-[#3CBEAC]">Payment:</strong>{" "}
            {order.paymentMethod}
          </p>

          {order.isPaid ? (
            <Messsage variant="success">Paid on {order.paidAt}</Messsage>
          ) : (
            <Messsage variant="danger">Not Paid</Messsage>
          )}
        </div>

        <div className="border-t border-[#E3DED7] pt-4 mb-4 text-[#333333] space-y-2">
          <div className="flex justify-between">
            <span>Items:</span>
            <span>$ {order.itemsPrice}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>$ {order.shippingPrice}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>$ {order.taxPrice}</span>
          </div>
          <div className="flex justify-between font-bold text-[#285570]">
            <span>Total:</span>
            <span>$ {order.totalPrice}</span>
          </div>
        </div>

        {!order.isPaid && (
          <div className="mt-4">
            {loadingPay && <Loader />}
            {isPending ? (
              <Loader />
            ) : (
              <div className="rounded-md border border-[#E3DED7] p-3 bg-[#f9f7f3]">
                <PayPalButtons
                  createOrder={createOrder}
                  onApprove={onApprove}
                  onError={onError}
                />
              </div>
            )}
          </div>
        )}

        {loadingDeliver && <Loader />}
        {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
          <button
            type="button"
            onClick={deliverHandler}
            className="mt-6 w-full py-2 rounded-md bg-[#EFAF76] text-[#333333] font-semibold hover:bg-[#3CBEAC] transition"
          >
            Mark As Delivered
          </button>
        )}
      </div>
    </div>
  );
};

export default Order;
