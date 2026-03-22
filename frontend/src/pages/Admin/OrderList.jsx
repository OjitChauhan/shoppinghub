import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { useGetOrdersQuery } from "../../redux/api/orderApiSlice";

const StatusBadge = ({ ok, okLabel = "Completed", failLabel = "Pending" }) => (
  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
    ok ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
       : "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400"
  }`}>
    {ok ? okLabel : failLabel}
  </span>
);

const OrderList = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05091A] transition-colors px-4 sm:px-6 py-8">
      <div className="max-w-7xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-black text-gray-900 dark:text-white">
            All <span className="text-orange-500">Orders</span>
          </h1>
        </div>

        {isLoading ? <Loader /> : error ? (
          <Message variant="danger">{error?.data?.message || error.error}</Message>
        ) : (
          <div className="rounded-2xl overflow-hidden
            bg-white dark:bg-[#0B1530]
            border border-black/6 dark:border-white/8
            shadow-card-light dark:shadow-card-dark">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/6 dark:border-white/8">
                    {["Item","Order ID","Customer","Date","Total","Paid","Delivered","Action"].map(h => (
                      <th key={h} className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr key={order._id}
                      className={`border-b border-black/4 dark:border-white/5 transition-colors
                        hover:bg-orange-50 dark:hover:bg-orange-500/6
                        ${i % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-white/2"}`}>
                      <td className="px-4 py-3">
                        <img src={order.orderItems[0]?.image} alt="" className="w-11 h-11 rounded-xl object-cover border border-black/6 dark:border-white/8" />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-slate-400 max-w-[120px] truncate">{order._id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-slate-200">{order.user?.username ?? "N/A"}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{order.createdAt?.substring(0,10) ?? "N/A"}</td>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">₹{order.totalPrice}</td>
                      <td className="px-4 py-3"><StatusBadge ok={order.isPaid} /></td>
                      <td className="px-4 py-3"><StatusBadge ok={order.isDelivered} /></td>
                      <td className="px-4 py-3">
                        <Link to={`/order/${order._id}`}>
                          <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all active:scale-95">
                            View
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <p className="text-center py-12 text-gray-400 dark:text-slate-500 text-sm">No orders yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
