import Chart from "react-apexcharts";
import { useGetUsersQuery } from "../../redux/api/usersApiSlice";
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
} from "../../redux/api/orderApiSlice";
import { useState, useEffect } from "react";
import OrderList from "./OrderList";
import Loader from "../../components/Loader";

const StatCard = ({ icon, label, value, loading, color }) => (
  <div className={`flex-1 min-w-[160px] rounded-2xl p-6 border
    bg-white dark:bg-[#0B1530]
    border-black/6 dark:border-white/8
    shadow-card-light dark:shadow-card-dark
    hover:scale-[1.03] transition-all duration-200 group`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${color}`}>
      {icon}
    </div>
    <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1">{label}</p>
    <p className="text-2xl font-black text-gray-900 dark:text-white">
      {loading ? <span className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin inline-block" /> : value}
    </p>
  </div>
);

const AdminDashboard = () => {
  const { data: sales,       isLoading }         = useGetTotalSalesQuery();
  const { data: customers,   isLoading: loading } = useGetUsersQuery();
  const { data: orders,      isLoading: loadingTwo } = useGetTotalOrdersQuery();
  const { data: salesDetail }                     = useGetTotalSalesByDateQuery();

  const isDark = document.documentElement.classList.contains("dark");

  const [state, setState] = useState({
    options: {
      chart: {
        type: "area",
        background: "transparent",
        toolbar: { show: false },
      },
      theme: { mode: isDark ? "dark" : "light" },
      colors: ["#EC4899"],
      fill: {
        type: "gradient",
        gradient: { shadeIntensity:1, opacityFrom:0.5, opacityTo:0.05, stops:[0,90,100] },
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      grid: {
        borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        strokeDashArray: 4,
      },
      markers: { size: 5, colors: ["#EC4899"], strokeColors: isDark ? "#151518" : "#fff", strokeWidth: 3 },
      xaxis: {
        categories: [],
        labels: { style: { colors: isDark ? "#94A3B8" : "#6B7280", fontFamily:"Inter,sans-serif", fontSize:"12px" } },
        axisBorder: { show: false },
        axisTicks:  { show: false },
      },
      yaxis: {
        min: 0,
        labels: { style: { colors: isDark ? "#94A3B8" : "#6B7280", fontFamily:"Inter,sans-serif", fontSize:"12px" } },
      },
      tooltip: {
        theme: isDark ? "dark" : "light",
        style: { fontFamily:"Inter,sans-serif" },
      },
      legend: { show: false },
    },
    series: [{ name: "Sales (₹)", data: [] }],
  });

  useEffect(() => {
    if (salesDetail) {
      const formatted = salesDetail.map(i => ({ x: i._id, y: i.totalSales }));
      setState(p => ({
        ...p,
        options: { ...p.options, xaxis: { ...p.options.xaxis, categories: formatted.map(i => i.x) } },
        series:  [{ name:"Sales (₹)", data: formatted.map(i => i.y) }],
      }));
    }
  }, [salesDetail]);

  return (
    <div className="min-h-screen bg-[#fff7fb] dark:bg-[#0A0A0B] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-black text-gray-900 dark:text-white">
            Admin <span className="text-pink-500">Dashboard</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Overview of your store performance</p>
        </div>

        {/* Stat cards */}
        <div className="flex flex-col sm:flex-row gap-5 mb-10">
          <StatCard icon="💰" label="Total Sales"  color="bg-pink-100 dark:bg-pink-500/15"
            value={`₹${sales?.totalSales?.toFixed(2) ?? "—"}`}    loading={isLoading} />
          <StatCard icon="👤" label="Customers"    color="bg-zinc-100 dark:bg-white/10"
            value={customers?.length ?? "—"}                        loading={loading} />
          <StatCard icon="📦" label="Orders"       color="bg-pink-50 dark:bg-pink-500/10"
            value={orders?.totalOrders ?? "—"}                      loading={loadingTwo} />
        </div>

        {/* Chart */}
        <div className="rounded-3xl p-6 md:p-8 mb-10
          bg-white dark:bg-[#151518]
          border border-black/6 dark:border-white/8
          shadow-card-light dark:shadow-card-dark">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white">Sales Trend</h2>
            <span className="badge-orange">Live</span>
          </div>
          <Chart options={state.options} series={state.series} type="area" width="100%" height="300" />
        </div>

        {/* Orders list */}
        <div className="rounded-3xl overflow-hidden
          bg-white dark:bg-[#151518]
          border border-black/6 dark:border-white/8
          shadow-card-light dark:shadow-card-dark">
          <div className="px-6 py-5 border-b border-black/6 dark:border-white/8">
            <h2 className="text-lg font-black text-gray-900 dark:text-white">Recent Orders</h2>
          </div>
          <OrderList />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
