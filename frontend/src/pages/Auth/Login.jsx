import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { useLoginMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Login = () => {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((s) => s.auth);

  const { search } = useLocation();
  const redirect   = new URLSearchParams(search).get("redirect") || "/";

  useEffect(() => { if (userInfo) navigate(redirect); }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
      toast.success("Signed in successfully!");
    } catch (err) {
      toast.error(err?.data?.message || err.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4
      bg-white dark:bg-[#05091A]
      bg-[radial-gradient(ellipse_at_60%_0%,rgba(251,191,36,0.12)_0%,transparent_60%)]
      dark:bg-[radial-gradient(ellipse_at_60%_0%,rgba(249,115,22,0.15)_0%,transparent_60%)]">

      <motion.div
        initial={{ scale:0.96, opacity:0 }}
        animate={{ scale:1,    opacity:1 }}
        transition={{ duration:0.35, ease:"easeOut" }}
        className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row
          bg-white dark:bg-[#0B1530]
          border border-black/6 dark:border-white/8">

        {/* ── Left branding panel ── */}
        <div className="hidden md:flex md:w-5/12
          bg-gradient-to-br from-orange-500 via-orange-600 to-red-500
          dark:from-[#0F1E3D] dark:via-[#1a2d56] dark:to-[#0F1E3D]
          flex-col justify-center items-center py-16 px-10 text-center relative overflow-hidden">

          {/* Decorative circles */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -right-8 w-40 h-40 rounded-full bg-white/8" />

          <div className="relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-4xl mb-8 shadow-xl">
              🛍️
            </div>
            <h1 className="text-3xl font-display font-black text-white mb-3 tracking-tight">
              SHOP<span className="dark:text-amber-400 text-yellow-200">X</span>
            </h1>
            <p className="text-white/80 dark:text-slate-300 text-sm leading-relaxed max-w-[220px] mx-auto">
              Your premium shopping destination. Sign in to continue.
            </p>
            <div className="mt-8 flex gap-3 justify-center">
              {["🚀 Fast","🔒 Secure","✨ Premium"].map(t => (
                <span key={t} className="text-xs font-semibold text-white/70 bg-white/15 px-2.5 py-1 rounded-full border border-white/20">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 py-12 bg-white dark:bg-[#0B1530]">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-2xl font-display font-black text-gray-900 dark:text-white mb-1">
              Welcome back 👋
            </h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-8">Sign in to your account</p>

            <form className="space-y-5" onSubmit={submitHandler} autoComplete="off">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                  Email address
                </label>
                <input
                  type="email" id="email" placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none
                    bg-gray-50 dark:bg-[#05091A]
                    border border-gray-200 dark:border-white/10
                    text-gray-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-slate-500
                    focus:border-orange-500 dark:focus:border-orange-500
                    focus:ring-2 focus:ring-orange-500/20
                    transition-all"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoFocus
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password" id="password" placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none
                    bg-gray-50 dark:bg-[#05091A]
                    border border-gray-200 dark:border-white/10
                    text-gray-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-slate-500
                    focus:border-orange-500 dark:focus:border-orange-500
                    focus:ring-2 focus:ring-orange-500/20
                    transition-all"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit" disabled={isLoading}
                className="w-full py-3.5 rounded-xl text-sm font-black text-white
                  bg-orange-500 hover:bg-orange-600
                  shadow-lg shadow-orange-500/30
                  transition-all hover:scale-[1.02] active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : "Sign In →"}
              </button>
              {isLoading && <Loader />}
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
              New customer?{" "}
              <Link to={redirect ? `/register?redirect=${redirect}` : "/register"}
                className="font-bold text-orange-500 hover:text-orange-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
