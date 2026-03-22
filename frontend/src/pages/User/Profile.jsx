import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { FaTimes, FaUser, FaEnvelope, FaLock, FaShoppingBag } from "react-icons/fa";
import Loader from "../../components/Loader";
import { useProfileMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";

const Field = ({ id, label, icon: Icon, type = "text", placeholder, value, onChange, required }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
        <Icon size={14} />
      </span>
      <input
        id={id} type={type} placeholder={placeholder}
        value={value} onChange={onChange} required={required}
        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none
          bg-gray-50 dark:bg-[#05091A]
          border border-gray-200 dark:border-white/10
          text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-slate-500
          focus:border-orange-500 dark:focus:border-orange-500
          focus:ring-2 focus:ring-orange-500/20
          transition-all"
      />
    </div>
  </div>
);

const Profile = () => {
  const [username,        setUserName]        = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { userInfo } = useSelector((s) => s.auth);
  const [updateProfile, { isLoading }] = useProfileMutation();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  useEffect(() => {
    if (userInfo) { setUserName(userInfo.username); setEmail(userInfo.email); }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    try {
      const res = await updateProfile({ _id: userInfo._id, username, email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success("Profile updated successfully!");
    } catch (err) { toast.error(err?.data?.message || err.error); }
  };

  /* Avatar initials */
  const initials = username ? username.slice(0, 2).toUpperCase() : "U";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10
      bg-gray-50 dark:bg-[#05091A]
      bg-[radial-gradient(ellipse_at_40%_0%,rgba(251,191,36,0.10)_0%,transparent_55%)]
      dark:bg-[radial-gradient(ellipse_at_40%_0%,rgba(249,115,22,0.12)_0%,transparent_55%)]">

      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1,    opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl
          bg-white dark:bg-[#0B1530]
          border border-black/6 dark:border-white/8">

        {/* Close */}
        <button onClick={() => navigate(-1)}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 dark:text-slate-500
            hover:bg-gray-100 dark:hover:bg-white/8 hover:text-gray-700 dark:hover:text-white transition-all"
          aria-label="Close">
          <FaTimes size={16} />
        </button>

        {/* Header strip */}
        <div className="relative px-8 pt-8 pb-6
          bg-gradient-to-br from-orange-500 via-orange-500 to-red-500
          dark:from-[#0F1E3D] dark:via-[#0F1E3D] dark:to-[#0F1E3D]">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage:"radial-gradient(circle at 80% 20%, #fff 0%, transparent 60%)" }} />

          {/* Avatar */}
          <div className="relative w-16 h-16 rounded-2xl bg-white/25 dark:bg-orange-500/20 border-2 border-white/30 dark:border-orange-500/30 flex items-center justify-center text-2xl font-black text-white mb-4 shadow-xl">
            {initials}
          </div>
          <h1 className="text-xl font-display font-black text-white mb-0.5">My Profile</h1>
          <p className="text-white/70 dark:text-slate-400 text-sm">{email}</p>
        </div>

        {/* Form */}
        <form onSubmit={submitHandler} className="px-8 py-7 space-y-4">
          <Field id="username"  label="Display Name"    icon={FaUser}     placeholder="Your name"        value={username}        onChange={e => setUserName(e.target.value)}        required />
          <Field id="email"     label="Email Address"   icon={FaEnvelope} type="email" placeholder="you@example.com" value={email}   onChange={e => setEmail(e.target.value)}           required />
          <Field id="password"  label="New Password"    icon={FaLock}     type="password" placeholder="Leave blank to keep"  value={password} onChange={e => setPassword(e.target.value)} />
          <Field id="confirm"   label="Confirm Password" icon={FaLock}    type="password" placeholder="Repeat new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" disabled={isLoading}
              className="flex-1 py-3 rounded-xl text-sm font-black text-white
                bg-orange-500 hover:bg-orange-600
                shadow-lg shadow-orange-500/25
                transition-all hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2">
              {isLoading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
              ) : "Save Changes"}
            </button>

            <Link to="/user-orders"
              className="flex-1 py-3 rounded-xl text-sm font-black text-center
                bg-gray-100 dark:bg-white/8
                text-gray-700 dark:text-slate-200
                border border-gray-200 dark:border-white/10
                hover:bg-orange-50 dark:hover:bg-orange-500/12
                hover:text-orange-600 dark:hover:text-orange-400
                hover:border-orange-200 dark:hover:border-orange-500/30
                transition-all hover:scale-[1.02] active:scale-[0.98]
                flex items-center justify-center gap-2">
              <FaShoppingBag size={13} /> My Orders
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
