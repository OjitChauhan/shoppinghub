import { useState } from "react";
import {
  AiOutlineHome,
  AiOutlineShopping,
  AiOutlineLogin,
  AiOutlineShoppingCart,
  AiOutlineMenu,
  AiOutlineClose,
} from "react-icons/ai";
import { FaHeart, FaSun, FaMoon, FaBalanceScale, FaCompass, FaRobot, FaCamera } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../../redux/api/usersApiSlice";
import { logout } from "../../redux/features/auth/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import FavoritesCount from "../Products/FavoritesCount";

const navItems = [
  { label: "Home",       icon: AiOutlineHome,         link: "/" },
  { label: "Shop",       icon: AiOutlineShopping,      link: "/shop" },
  { label: "Cart",       icon: AiOutlineShoppingCart,  link: "/cart",            badge: true },
  { label: "Favorites",  icon: FaHeart,                link: "/favorites",       favorites: true },
  { label: "For You",    icon: FaCompass,              link: "/purpose-shopping" },
  { label: "AI Compare", icon: FaRobot,                link: "/ai-comparator" },
  { label: "Try-On",     icon: FaCamera,               link: "/virtual-tryon-hub" },
];

const Navigation = () => {
  const { userInfo }   = useSelector((state) => state.auth);
  const { cartItems }  = useSelector((state) => state.cart);
  const compareList    = useSelector((state) => state.compare.compareList);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const location = useLocation();

  const [isDarkMode, setIsDarkMode] = useState(
    () => document.documentElement.classList.contains("dark")
  );

  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try { await logoutApiCall().unwrap(); dispatch(logout()); navigate("/login"); }
    catch (e) { console.error(e); }
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    const dark = html.classList.toggle("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");
    setIsDarkMode(dark);
  };

  const isActive = (link) => location.pathname === link || (link !== "/" && location.pathname.startsWith(link));
  const userInitial = userInfo?.username?.charAt(0)?.toUpperCase() || "U";

  const userMenu = userInfo && (
    <ul className="absolute right-0 top-full mt-2 min-w-[200px] bg-white dark:bg-navy-800 backdrop-blur-md rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 py-2 z-50 border border-black/5 dark:border-white/8 overflow-hidden">
      {userInfo.isAdmin && (
        <>
          {[
            { to: "/admin/dashboard",    label: "Dashboard" },
            { to: "/admin/productlist",  label: "Products" },
            { to: "/admin/categorylist", label: "Categories" },
            { to: "/admin/orderlist",    label: "Orders" },
            { to: "/admin/userlist",     label: "Users" },
          ].map(({ to, label }) => (
            <li key={to}>
              <Link to={to} onClick={() => setUserDropdown(false)}
                className="block px-4 py-2.5 text-sm text-gray-600 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-pink-500/10 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium">
                {label}
              </Link>
            </li>
          ))}
          <li><div className="my-1 border-t border-black/5 dark:border-white/8" /></li>
        </>
      )}
      <li>
        <Link to="/profile" onClick={() => setUserDropdown(false)}
          className="block px-4 py-2.5 text-sm text-gray-600 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-pink-500/10 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium">
          Profile
        </Link>
      </li>
      <li><div className="my-1 border-t border-black/5 dark:border-white/8" /></li>
      <li>
        <button onClick={() => { setUserDropdown(false); logoutHandler(); }}
          className="block w-full text-left px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-semibold transition-colors">
          Logout
        </button>
      </li>
    </ul>
  );

  return (
    <nav className="w-full sticky top-0 z-50 transition-all duration-300
      bg-white/80 dark:bg-[#0A0A0B]/90
      backdrop-blur-xl
      border-b border-black/6 dark:border-white/6
      shadow-sm dark:shadow-none">

      

      {/* ── Top bar ── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3">
        <div className="flex items-center h-12">
          
          {/* Left zone (Burger on mobile) */}
          <div className="flex-1 flex items-center md:hidden">
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="w-10 h-10 inline-flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/8 text-gray-700 dark:text-white transition-all active:scale-95">
              {mobileOpen ? <AiOutlineClose size={22} /> : <AiOutlineMenu size={22} />}
            </button>
          </div>

          {/* Center zone (Logo) */}
          <div className="flex-shrink-0 flex justify-center">
            <Link to="/" className="group flex items-center gap-1">
              <span className="text-2xl md:text-2xl font-black tracking-tighter text-gray-900 dark:text-white select-none font-display uppercase italic">
                SHOP
                <span className="text-pink-500 group-hover:text-pink-300 transition-colors">X</span>
              </span>
            </Link>
          </div>

          {/* Right zone (Theme + User) */}
          <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/8 text-gray-500 dark:text-slate-400 transition-all active:scale-90"
              aria-label="Toggle Theme">
              <div className={`transition-transform duration-500 ${isDarkMode ? "rotate-[360deg]" : "rotate-0"}`}>
                {isDarkMode
                  ? <FaSun  size={16} className="text-rose-400" />
                  : <FaMoon size={16} className="text-gray-600" />}
              </div>
            </button>

            {/* User */}
            {userInfo ? (
              <div className="relative">
                <button onClick={() => setUserDropdown(p => !p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black
                    text-gray-800 dark:text-white
                    bg-gray-100 dark:bg-white/5
                    hover:bg-pink-100 dark:hover:bg-pink-500/15
                    hover:text-pink-600 dark:hover:text-pink-400
                    border border-gray-200 dark:border-white/10
                    transition-all focus:outline-none">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-black/10 dark:bg-white/10 text-[10px]">
                    {userInitial}
                  </span>
                  <span className="hidden md:inline truncate max-w-[130px]">{userInfo.username}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${userDropdown ? "rotate-180":""}`}
                    fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userDropdown && <div className="absolute right-0 top-full pt-2">{userMenu}</div>}
              </div>
            ) : (
              <Link to="/login"
                className="flex items-center gap-1.5 px-4 md:px-5 py-2 rounded-full text-xs font-black text-white
                  bg-pink-500 hover:bg-pink-600
                  shadow-lg shadow-pink-500/25
                  transition-all active:scale-95 uppercase tracking-wider">
                <AiOutlineLogin size={16} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Second row: desktop nav tabs ── */}
      <div className="hidden md:flex justify-center items-center py-2 gap-8 lg:gap-12 border-t border-black/5 dark:border-white/5">
        {navItems.map(({ label, icon: Icon, link, badge }) => {
          const active = isActive(link);
          return (
            <Link to={link} key={label}
              className={`group relative flex items-center gap-2 px-1 py-1.5 text-sm font-bold whitespace-nowrap transition-all
                ${active
                  ? "text-pink-500 dark:text-pink-400"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"}`}>
              <Icon size={16} className="group-hover:scale-110 transition-transform" />
              <span>{label}</span>
              {badge && cartItems.length > 0 && (
                <span className="absolute -top-1 -right-3 min-w-[17px] h-[17px] px-1 text-[9px] font-black rounded-full bg-pink-500 text-white flex items-center justify-center shadow-sm">
                  {cartItems.reduce((a,c) => a+c.qty, 0)}
                </span>
              )}
              {/* Active underline */}
              <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-pink-500 rounded-full transition-all duration-300 ${active ? "w-full" : "w-0 group-hover:w-full"}`} />
            </Link>
          );
        })}

        {/* Compare */}
        <Link to="/compare"
          className={`group relative flex items-center gap-2 px-1 py-1.5 text-sm font-bold whitespace-nowrap transition-all
            ${isActive("/compare")
              ? "text-pink-500 dark:text-pink-400"
              : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"}`}>
          <FaBalanceScale size={14} className="group-hover:scale-110 transition-transform" />
          <span>Compare</span>
          {compareList.length > 0 && (
            <span className="absolute -top-1 -right-3 min-w-[17px] h-[17px] px-1 text-[9px] font-black rounded-full bg-pink-500 text-white flex items-center justify-center">
              {compareList.length}
            </span>
          )}
          <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-pink-500 rounded-full transition-all duration-300 ${isActive("/compare") ? "w-full" : "w-0 group-hover:w-full"}`} />
        </Link>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-[85%] max-w-sm z-[101] flex flex-col 
                bg-white/95 dark:bg-[#0A0A0B]/95 backdrop-blur-2xl
                border-r border-black/5 dark:border-white/5 shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
                <span className="text-2xl font-black text-gray-900 dark:text-white font-display italic uppercase tracking-tighter">
                  SHOP<span className="text-pink-500">X</span>
                </span>
                <button onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400 hover:scale-110 active:scale-90 transition-all">
                  <AiOutlineClose size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-grow overflow-y-auto py-6 px-4 space-y-2">
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 mb-2">
                  Navigation
                </p>
                {navItems.map(({ label, icon: Icon, link, badge }) => {
                  const active = isActive(link);
                  return (
                    <Link to={link} key={label} onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all
                        ${active
                          ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25"
                          : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"}`}>
                      <Icon size={20} />
                      <span className="flex-grow">{label}</span>
                      {badge && cartItems.length > 0 && (
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${active ? 'bg-white text-pink-500' : 'bg-pink-500 text-white'}`}>
                          {cartItems.reduce((a,c) => a+c.qty, 0)}
                        </span>
                      )}
                    </Link>
                  );
                })}

                <Link to="/compare" onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all
                    ${isActive("/compare")
                      ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25"
                      : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5"}`}>
                  <FaBalanceScale size={20} />
                  <span className="flex-grow">Compare</span>
                  {compareList.length > 0 && (
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${isActive("/compare") ? 'bg-white text-pink-500' : 'bg-pink-500 text-white'}`}>
                      {compareList.length}
                    </span>
                  )}
                </Link>

                {/* Account Section */}
                <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5">
                  <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 mb-4">
                    Account
                  </p>
                  {userInfo ? (
                    <div className="space-y-1">
                      <div className="px-4 py-3 mb-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5">
                        <p className="text-xs font-black text-pink-500 uppercase tracking-wider mb-0.5">Logged in as</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{userInfo.username}</p>
                      </div>
                      
                      {userInfo.isAdmin && (
                        <div className="mb-4 space-y-1">
                           <p className="px-4 text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-slate-500 mb-2">Admin Panel</p>
                          {["/admin/dashboard","/admin/productlist","/admin/categorylist","/admin/orderlist","/admin/userlist"].map(p => (
                            <Link key={p} to={p} onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-400 hover:bg-pink-500/10 hover:text-pink-500 transition-all capitalize">
                              <div className="w-1.5 h-1.5 rounded-full bg-pink-500/40" />
                              {p.replace("/admin/","").replace("list"," list")}
                            </Link>
                          ))}
                        </div>
                      )}
                      
                      <Link to="/profile" onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5">
                        Profile
                      </Link>
                      <button onClick={() => { setMobileOpen(false); logoutHandler(); }}
                        className="flex items-center gap-4 w-full text-left px-4 py-3.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link to="/login" onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-sm font-black text-white bg-pink-500 hover:bg-pink-600 transition-all shadow-xl shadow-pink-500/30 uppercase tracking-widest">
                      <AiOutlineLogin size={18} /> Login Account
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
