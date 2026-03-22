import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { useRegisterMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const Register = () => {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else {
      try {
        const res = await register({ username, email, password }).unwrap();
        dispatch(setCredentials({ ...res }));
        navigate(redirect);
        toast.success("User successfully registered");
      } catch (err) {
        console.log(err);
        toast.error(err.data?.message || "Registration failed");
      }
    }
  };

  const closeHandler = () => {
    navigate(-1); // Navigate back on close
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
      >
        {/* Close button */}
        <button
          onClick={closeHandler}
          className="absolute top-4 right-4 text-[#EFAF76] hover:text-[#FFD700] text-2xl font-bold z-50 transition"
          aria-label="Close Register Modal"
        >
          <FaTimes />
        </button>

        {/* Left side image/branding - hidden on mobile */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-[#285570] to-[#3CBEAC] flex-col justify-center items-center py-12 px-6 text-center relative">
          <div className="mb-6 mt-4 flex flex-col gap-2 items-center">
            <div className="w-16 h-16 rounded-full bg-[#EFAF76] flex justify-center items-center text-3xl font-bold text-[#285570]">
              🚀
            </div>
            <h2 className="text-white text-xl font-bold mt-2">Welcome to</h2>
            <span className="text-2xl font-extrabold text-white mb-2 tracking-wide">
              Spacer
            </span>
            <p className="text-[#E3DED7] text-center text-base max-w-xs">
              shopX
            </p>
          </div>
        </div>

        {/* Right side form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-10 bg-[#FAF7F6] overflow-y-auto max-h-[90vh]">
          <h2 className="text-[#285570] text-2xl font-bold mb-7 text-center">
            Create your account
          </h2>

          <form className="space-y-6" onSubmit={submitHandler} autoComplete="off">
            <div>
              <label
                htmlFor="name"
                className="block text-[#333333] font-semibold mb-2"
              >
                Name
              </label>
              <input
                name="username"
                type="text"
                id="name"
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-[#3CBEAC] rounded-lg text-[#333333] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#3CBEAC]"
                value={username}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-[#333333] font-semibold mb-2"
              >
                Email
              </label>
              <input
                name="email"
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-[#3CBEAC] rounded-lg text-[#333333] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#3CBEAC]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[#333333] font-semibold mb-2"
              >
                Password
              </label>
              <input
                name="password"
                type="password"
                id="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-[#3CBEAC] rounded-lg text-[#333333] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#3CBEAC]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[#333333] font-semibold mb-2"
              >
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                id="confirmPassword"
                placeholder="Confirm your password"
                className="w-full px-4 py-3 border border-[#3CBEAC] rounded-lg text-[#333333] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#3CBEAC]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-[#285570] text-[#FAF7F6] py-3 px-4 rounded-lg font-semibold text-lg shadow-md transition disabled:opacity-50"
            >
              {isLoading ? "Registering..." : "Sign Up"}
            </button>

            {isLoading && <Loader />}

            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-sm text-[#333333] opacity-70">
                Already have an account?
              </span>
              <Link
                to={redirect ? `/login?redirect=${redirect}` : "/login"}
                className="text-[#EFAF76] hover:underline font-semibold"
              >
                Login
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
