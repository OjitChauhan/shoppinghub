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

  /* ── Admin dropdown ── */
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
                className="block px-4 py-2.5 text-sm text-gray-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium">
                {label}
              </Link>
            </li>
          ))}
          <li><div className="my-1 border-t border-black/5 dark:border-white/8" /></li>
        </>
      )}
      <li>
        <Link to="/profile" onClick={() => setUserDropdown(false)}
          className="block px-4 py-2.5 text-sm text-gray-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium">
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
      bg-white/80 dark:bg-[#05091A]/90
      backdrop-blur-xl
      border-b border-black/6 dark:border-white/6
      shadow-sm dark:shadow-none">

      {/* ── Top bar ── */}
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4 md:px-8 py-3.5">

        {/* Mobile burger */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/8 text-gray-700 dark:text-white transition-colors">
          <AiOutlineMenu size={22} />
        </button>

        {/* Logo */}
        <div className="flex-1 flex justify-center md:justify-start">
          <Link to="/" className="group flex items-center gap-1">
            <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white select-none font-display">
              SHOP
              <span className="text-orange-500 group-hover:text-amber-400 transition-colors">X</span>
            </span>
          </Link>
        </div>

        {/* Right: theme + user */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/8 text-gray-500 dark:text-slate-400 transition-all active:scale-90"
            aria-label="Toggle Theme">
            <div className={`transition-transform duration-500 ${isDarkMode ? "rotate-[360deg]" : "rotate-0"}`}>
              {isDarkMode
                ? <FaSun  size={16} className="text-amber-400" />
                : <FaMoon size={16} className="text-gray-600" />}
            </div>
          </button>

          {/* User */}
          {userInfo ? (
            <div className="relative">
              <button onClick={() => setUserDropdown(p => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold
                  text-gray-800 dark:text-white
                  bg-gray-200 dark:bg-navy-800
                  hover:bg-orange-100 dark:hover:bg-orange-500/15
                  hover:text-orange-600 dark:hover:text-orange-400
                  border border-gray-300 dark:border-white/12
                  transition-all focus:outline-none">
                {userInfo.username}
                <svg className={`w-3.5 h-3.5 transition-transform ${userDropdown ? "rotate-180":""}`}
                  fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {userDropdown && <div className="absolute right-0 top-full pt-2">{userMenu}</div>}
            </div>
          ) : (
            <Link to="/login"
              className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold text-white
                bg-orange-500 hover:bg-orange-600
                shadow-lg shadow-orange-500/25
                transition-all active:scale-95">
              <AiOutlineLogin size={16} /> Login
            </Link>
          )}
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
                  ? "text-orange-500 dark:text-orange-400"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"}`}>
              <Icon size={16} className="group-hover:scale-110 transition-transform" />
              <span>{label}</span>
              {badge && cartItems.length > 0 && (
                <span className="absolute -top-1 -right-3 min-w-[17px] h-[17px] px-1 text-[9px] font-black rounded-full bg-orange-500 text-white flex items-center justify-center shadow-sm">
                  {cartItems.reduce((a,c) => a+c.qty, 0)}
                </span>
              )}
              {/* Active underline */}
              <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-orange-500 rounded-full transition-all duration-300 ${active ? "w-full" : "w-0 group-hover:w-full"}`} />
            </Link>
          );
        })}

        {/* Compare */}
        <Link to="/compare"
          className={`group relative flex items-center gap-2 px-1 py-1.5 text-sm font-bold whitespace-nowrap transition-all
            ${isActive("/compare")
              ? "text-orange-500 dark:text-orange-400"
              : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"}`}>
          <FaBalanceScale size={14} className="group-hover:scale-110 transition-transform" />
          <span>Compare</span>
          {compareList.length > 0 && (
            <span className="absolute -top-1 -right-3 min-w-[17px] h-[17px] px-1 text-[9px] font-black rounded-full bg-orange-500 text-white flex items-center justify-center">
              {compareList.length}
            </span>
          )}
          <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-orange-500 rounded-full transition-all duration-300 ${isActive("/compare") ? "w-full" : "w-0 group-hover:w-full"}`} />
        </Link>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div onClick={e => e.stopPropagation()}
            className="absolute left-0 top-0 h-full w-72 flex flex-col shadow-2xl overflow-y-auto
              bg-white dark:bg-[#05091A]
              border-r border-black/6 dark:border-white/6
              py-5 px-4">

            <div className="flex items-center justify-between mb-6 px-2">
              <span className="text-xl font-black text-gray-900 dark:text-white font-display">
                SHOP<span className="text-orange-500">X</span>
              </span>
              <button onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 text-gray-500 dark:text-slate-400">
                <AiOutlineClose size={20} />
              </button>
            </div>

            {navItems.map(({ label, icon: Icon, link, badge }) => {
              const active = isActive(link);
              return (
                <Link to={link} key={label} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold mb-1 transition-all
                    ${active
                      ? "bg-orange-50 dark:bg-orange-500/12 text-orange-600 dark:text-orange-400"
                      : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/6 hover:text-gray-900 dark:hover:text-white"}`}>
                  <Icon size={18} />
                  <span>{label}</span>
                  {badge && cartItems.length > 0 && (
                    <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-500 text-white">
                      {cartItems.reduce((a,c) => a+c.qty, 0)}
                    </span>
                  )}
                </Link>
              );
            })}

            <Link to="/compare" onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold mb-1 transition-all
                ${isActive("/compare")
                  ? "bg-orange-50 dark:bg-orange-500/12 text-orange-600 dark:text-orange-400"
                  : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/6"}`}>
              <FaBalanceScale size={16} />
              <span>Compare</span>
              {compareList.length > 0 && (
                <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-500 text-white">
                  {compareList.length}
                </span>
              )}
            </Link>

            <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/8">
              {userInfo ? (
                <div className="space-y-1">
                  <p className="px-3 py-2 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                    {userInfo.username}
                  </p>
                  {userInfo.isAdmin && (
                    <>
                      {["/admin/dashboard","/admin/productlist","/admin/categorylist","/admin/orderlist","/admin/userlist"].map(p => (
                        <Link key={p} to={p} onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium capitalize">
                          {p.replace("/admin/","").replace("list"," list")}
                        </Link>
                      ))}
                      <div className="my-2 border-t border-black/5 dark:border-white/8" />
                    </>
                  )}
                  <Link to="/profile" onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium">
                    Profile
                  </Link>
                  <button onClick={() => { setMobileOpen(false); logoutHandler(); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25">
                  <AiOutlineLogin size={16} /> Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
