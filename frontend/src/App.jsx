import { Outlet } from "react-router-dom";
import Navigation from "./pages/Auth/Navigation";
import { ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/Footer";
import { useEffect } from "react";
import CompareBar from "./components/CompareBar";
import DarkSportsBackground3D from "./components/DarkSportsBackground3D";

const App = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Use saved theme if it exists, otherwise use OS preference (fallback to dark if none)
    // We default to dark mode if no saved theme and no OS preference
    const isDarkMode = savedTheme === "dark" || (!savedTheme && (prefersDark !== false));

    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, []);

  return (
    <div className="relative bg-surface dark:bg-primary min-h-screen text-content-primary dark:text-surface transition-colors duration-300 dark:[background-image:linear-gradient(140deg,#050505_0%,#09090b_55%,#0f0f12_100%)]">
      <DarkSportsBackground3D />
      <div className="relative z-10 flex flex-col min-h-screen">
      <ToastContainer
        theme={localStorage.getItem("theme") === "dark" ? "dark" : "light"}
      />
      <Navigation />
      <main className="flex-grow">
        <motion.div
          key={window.location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
      <CompareBar />
      </div>
    </div>
  );
};

export default App;

