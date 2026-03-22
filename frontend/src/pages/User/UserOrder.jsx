import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";

const UserOrder = () => {
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();

  return (
    <div className="container mx-auto px-3 sm:px-6 lg:px-10 py-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-[#285570] mb-5 text-center sm:text-left">
        My Orders
      </h2>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger" className="max-w-md mx-auto text-center">
          {error?.data?.error || error.error}
        </Message>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md border border-[#E3DED7] text-sm sm:text-base">
            <thead className="bg-[#3CBEAC] text-[#FAF7F6] font-semibold">
              <tr>
                <th className="p-3 hidden md:table-cell">Image</th>
                <th className="p-3">Order ID</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total</th>
                <th className="p-3">Paid</th>
                <th className="p-3">Delivered</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order) => (
                <tr
                  key={order._id}
                  className="odd:bg-[#FAF7F6] even:bg-[#E3DED7] hover:bg-[#C9F0E1] transition"
                >
                  <td className="p-3 hidden md:table-cell">
                    <img
                      src={order.orderItems[0]?.image}
                      alt={order.user}
                      className="w-16 h-16 object-cover rounded mx-auto md:mx-0"
                    />
                  </td>

                  <td className="p-3 font-mono text-xs sm:text-sm break-words">
                    {order._id}
                  </td>
                  <td className="p-3 text-xs sm:text-sm">
                    {order.createdAt.substring(0, 10)}
                  </td>
                  <td className="p-3 font-semibold text-xs sm:text-sm">
                    Rs. {order.totalPrice.toFixed(2)}
                  </td>

                  <td className="p-3">
                    {order.isPaid ? (
                      <span className="bg-green-400 text-white px-2 sm:px-3 py-1 rounded-full inline-block text-center text-xs sm:text-sm">
                        Completed
                      </span>
                    ) : (
                      <span className="bg-red-400 text-white px-2 sm:px-3 py-1 rounded-full inline-block text-center text-xs sm:text-sm">
                        Pending
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    {order.isDelivered ? (
                      <span className="bg-green-400 text-white px-2 sm:px-3 py-1 rounded-full inline-block text-center text-xs sm:text-sm">
                        Completed
                      </span>
                    ) : (
                      <span className="bg-red-400 text-white px-2 sm:px-3 py-1 rounded-full inline-block text-center text-xs sm:text-sm">
                        Pending
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <Link to={`/order/${order._id}`}>
                      <button className="bg-gradient-to-r from-[#EFAF76] to-[#3CBEAC] text-[#285570] font-semibold rounded-md px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:from-[#3CBEAC] hover:to-[#285570] hover:text-white transition">
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserOrder;
