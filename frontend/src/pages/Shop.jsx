import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGetFilteredProductsQuery } from "../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import { useAiAssistantChatMutation } from "../redux/api/productApiSlice";
import { setCategories, setProducts, setChecked } from "../redux/features/shop/shopSlice";
import { addToCart } from "../redux/features/cart/cartSlice";
import { addToFavorites } from "../redux/features/favorites/favoriteSlice";
import { addToCompare } from "../redux/features/compare/compareSlice";
import Loader from "../components/Loader";
import ProductCard from "./Products/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingBag, FaSearch, FaFilter, FaSort, FaHeart, FaHome, FaShoppingCart, FaMicrophone } from "react-icons/fa";

import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/700.css";
import "./User/scrollbar.css";

const Shop = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, products, checked, radio } = useSelector((state) => state.shop);
  const { cartItems } = useSelector((state) => state.cart);
  const favorites = useSelector((state) => state.favorites) || [];
  const compareList = useSelector((state) => state.compare.compareList);

  const categoriesQuery = useFetchCategoriesQuery();
  const filteredProductsQuery = useGetFilteredProductsQuery({ checked, radio });
  const [aiAssistantChat] = useAiAssistantChatMutation();

  const [priceFilter, setPriceFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortOption, setSortOption] = useState("");

  const [highlightFilter, setHighlightFilter] = useState(false);
  const [highlightSort, setHighlightSort] = useState(false);
  const [highlightSearch, setHighlightSearch] = useState(false);
  const [highlightPrice, setHighlightPrice] = useState(false);
  const [highlightFavorites, setHighlightFavorites] = useState(false);
  const [highlightHome, setHighlightHome] = useState(false);
  const [highlightCart, setHighlightCart] = useState(false);

  // Chatbot & Voice States
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [showFullHelp, setShowFullHelp] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);

  const priceInputRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [assistantMessages, isTyping]);

  useEffect(() => {
    if (isAssistantOpen && assistantMessages.length === 0) {
      setShowFullHelp(false);
      setAssistantMessages([{ from: "bot", text: "Hi there! 👋 How can I help you curate your style today?" }]);
    }
  }, [isAssistantOpen, assistantMessages.length]);

  useEffect(() => {
    if (!categoriesQuery.isLoading && categoriesQuery.data) {
      dispatch(setCategories(categoriesQuery.data));
    }
  }, [categoriesQuery.data, dispatch]);

  useEffect(() => {
    if (!filteredProductsQuery.isSuccess) return;

    let filtered = filteredProductsQuery.data || [];

    if (checked.length > 0) {
      filtered = filtered.filter((product) => checked.includes(product.category?._id));
    }

    if (priceFilter.trim()) {
      const targetPrice = parseInt(priceFilter, 10);
      if (!isNaN(targetPrice)) {
        filtered = filtered.filter((product) => product.price <= targetPrice);
      }
    }

    if (searchTerm.trim()) {
      const searchWords = searchTerm.toLowerCase().split(" ").filter(w => w.length > 0);

      // 1. Calculate Relevancy Score for each product
      let scoredProducts = filtered.map(p => {
        let score = 0;
        const name = p.name?.toLowerCase() || "";
        const brand = p.brand?.toLowerCase() || "";
        const desc = p.description?.toLowerCase() || "";
        const catName = p.category?.name?.toLowerCase() || "";

        searchWords.forEach(word => {
          if (name.includes(word)) score += 3;
          if (brand.includes(word)) score += 2;
          if (catName.includes(word)) score += 2;
          if (desc.includes(word)) score += 1;
        });

        return { ...p, _relevancyScore: score };
      });

      // 2. Keep only products with a score > 0
      scoredProducts = scoredProducts.filter(p => p._relevancyScore > 0);

      // 3. Sort by relevancy if no manual sort option is chosen
      if (!sortOption) {
        scoredProducts.sort((a, b) => b._relevancyScore - a._relevancyScore);
      }

      filtered = scoredProducts;
    }

    switch (sortOption) {
      case "price-asc":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    dispatch(setProducts(filtered));
  }, [
    checked,
    radio,
    filteredProductsQuery.data,
    priceFilter,
    searchTerm,
    sortOption,
    dispatch,
  ]);

  const handleCheck = (value, id) => {
    const updatedChecked = value ? [...checked, id] : checked.filter((c) => c !== id);
    dispatch(setChecked(updatedChecked));
  };

  const handleBrandClick = (brand) => {
    const productsByBrand = filteredProductsQuery.data?.filter((p) => p.brand === brand);
    dispatch(setProducts(productsByBrand));
  };

  const uniqueBrands = [
    ...new Set(
      filteredProductsQuery.data?.map((p) => p.brand).filter((b) => b !== undefined)
    ),
  ];

  const handleSearchChange = (e) => {
    applySmartSearch(e.target.value);
    setShowSuggestions(true);
  };

  const applySmartSearch = (rawText) => {
    setSearchTerm(rawText);

    // Safety check
    if (!rawText || rawText.trim().length === 0) return;

    let queryText = rawText.toLowerCase();

    // 1. Price Intent Extraction (e.g., "under 500", "less than 1000", "max 50")
    const priceMatch = queryText.match(/(?:under|below|less than|max|cheaper than)\s*₹?\s*(\d+)/i) ||
      queryText.match(/(\d+)\s*₹?\s*(?:or less|max)/i);

    if (priceMatch && priceMatch[1]) {
      const price = priceMatch[1];
      setPriceFilter(price);

      // Remove the pricing intent from the text so it doesn't mess up fuzzy text search
      queryText = queryText.replace(priceMatch[0], "").trim();
      setSearchTerm(queryText);
      toast.info(`Smart Search: Applying price filter under ₹${price}`, { autoClose: 2500, hideProgressBar: true });
    }

    // 2. Category Extraction
    if (categories && categories.length > 0) {
      const matchedCategory = categories.find(c => queryText.includes(c.name.toLowerCase()));
      if (matchedCategory) {
        if (!checked.includes(matchedCategory._id)) {
          dispatch(setChecked([...checked, matchedCategory._id]));
          toast.info(`Smart Search: Applying category '${matchedCategory.name}'`, { autoClose: 2500, hideProgressBar: true });
        }

        // Remove category name from raw query text to prioritize brand/name search
        queryText = queryText.replace(matchedCategory.name.toLowerCase(), "").trim();
        setSearchTerm(queryText);
      }
    }
  };

  const handleSuggestionClick = (name) => {
    setSearchTerm(name);
    setShowSuggestions(false);
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice recognition not supported in this browser.");
      return;
    }

    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      toast.info("🎙️ Listening... Speak your query clearly.", { autoClose: 2000 });
    };

    recognition.onresult = (event) => {
      let voiceResult = event.results[0][0].transcript.trim().toLowerCase();
      voiceResult = voiceResult.replace(/[.,!?]/g, "");

      // Feed directly into NLP engine
      applySmartSearch(voiceResult);

      setShowSuggestions(true);
      toast.success(`Heard: "${voiceResult}"`, { hideProgressBar: true });
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const suggestions = filteredProductsQuery.data?.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Advanced NLP Engine
  const processBotResponse = (text) => {
    const msgLower = text.toLowerCase();
    let reply = "I'm here to help! Try asking about pricing, specific brands, shipping, returns, or how to use the shop filters.";
    let action = null; // We can return a function to execute UI state changes

    setHighlightFilter(false);
    setHighlightSort(false);
    setHighlightSearch(false);
    setHighlightPrice(false);
    setHighlightFavorites(false);
    setHighlightHome(false);
    setHighlightCart(false);

    // 1. Price Extraction Intent
    const priceMatch = msgLower.match(/(?:under|below|less than|max|cheaper than)\s*₹?\s*(\d+)/i) ||
      msgLower.match(/(\d+)\s*₹?\s*(?:or less|max)/i);

    // 2. Clear Filters Intent
    const isClearIntent = msgLower.includes("clear") || msgLower.includes("reset") || msgLower.includes("start over");

    // 3. Category/Brand Search Intent
    // Simple entity extraction against loaded categories
    let matchedCategory = null;
    if (categories) {
      matchedCategory = categories.find(c => msgLower.includes(c.name.toLowerCase()));
    }

    const catalogue = filteredProductsQuery.data || products || [];
    const bestMatchByText = (queryText) => {
      const q = (queryText || "").toLowerCase().trim();
      if (!q) return null;
      const ranked = catalogue.map((p) => {
        let score = 0;
        const name = (p.name || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        if (name.includes(q)) score += 5;
        if (brand.includes(q)) score += 3;
        if (desc.includes(q)) score += 1;
        return { p, score };
      }).sort((a, b) => b.score - a.score);
      return ranked[0] && ranked[0].score > 0 ? ranked[0].p : null;
    };

    if (msgLower.includes("open cart") || msgLower.includes("go to cart")) {
      reply = "Opening your cart now.";
      action = () => navigate("/cart");
    } else if (msgLower.includes("open favorites") || msgLower.includes("go to favorites") || msgLower.includes("open wishlist")) {
      reply = "Taking you to Favorites.";
      action = () => navigate("/favorites");
    } else if (msgLower.includes("open compare") || msgLower.includes("go to compare")) {
      reply = "Opening compare page.";
      action = () => navigate("/compare");
    } else if (msgLower.includes("open home") || msgLower.includes("go home")) {
      reply = "Returning to Home.";
      action = () => navigate("/");
    } else if (msgLower.includes("my orders") || msgLower.includes("open orders")) {
      reply = "Opening your orders page.";
      action = () => navigate("/user-orders");
    } else if (msgLower.includes("how many in cart") || msgLower.includes("cart count")) {
      const count = cartItems.reduce((a, c) => a + (c.qty || 1), 0);
      reply = `You currently have ${count} item${count === 1 ? "" : "s"} in your cart.`;
    } else if (msgLower.includes("how many favorites") || msgLower.includes("favorites count")) {
      reply = `You currently have ${favorites.length} favorite item${favorites.length === 1 ? "" : "s"}.`;
    } else if (msgLower.includes("compare count")) {
      reply = `You currently have ${compareList.length} item${compareList.length === 1 ? "" : "s"} in compare list.`;
    } else if (msgLower.includes("add to cart")) {
      const query = msgLower.replace("add to cart", "").trim();
      const match = bestMatchByText(query);
      if (match) {
        reply = `${match.name} added to cart.`;
        action = () => dispatch(addToCart({ ...match, qty: 1 }));
      } else {
        reply = "I couldn't identify that product. Try full product name, like 'add to cart iPhone'.";
      }
    } else if (msgLower.includes("add to favorites") || msgLower.includes("save favorite")) {
      const query = msgLower.replace("add to favorites", "").replace("save favorite", "").trim();
      const match = bestMatchByText(query);
      if (match) {
        reply = `${match.name} saved to favorites.`;
        action = () => dispatch(addToFavorites(match));
      } else {
        reply = "I couldn't match a product to save. Try product name.";
      }
    } else if (msgLower.includes("add to compare")) {
      const query = msgLower.replace("add to compare", "").trim();
      const match = bestMatchByText(query);
      if (!match) {
        reply = "I couldn't find that product for compare.";
      } else if (compareList.length >= 3) {
        reply = "Compare list is full (max 3 products). Remove one and try again.";
      } else {
        reply = `${match.name} added to compare.`;
        action = () => dispatch(addToCompare(match));
      }
    } else if (isClearIntent) {
      reply = "Filters reset! Let's start fresh.";
      action = () => {
        setSearchTerm("");
        setPriceFilter("");
        dispatch(setChecked([]));
      };
    } else if (priceMatch && priceMatch[1]) {
      const price = priceMatch[1];
      reply = `Done! Filtering items under ₹${price} for you. 💸`;
      action = () => setPriceFilter(price);
    } else if (matchedCategory) {
      reply = `I found the ${matchedCategory.name} category! Applying that filter now. 📂`;
      action = () => {
        if (!checked.includes(matchedCategory._id)) {
          dispatch(setChecked([...checked, matchedCategory._id]));
        }
      };
    } else if (msgLower.startsWith("find") || msgLower.startsWith("search") || msgLower.includes("looking for")) {
      const searchItem = msgLower.replace(/find|search for|search|looking for|me/gi, "").trim();
      if (searchItem.length > 2) {
        // Check if we actually have matches
        const exactMatches = products?.filter(p => p.name.toLowerCase().includes(searchItem) || p.brand?.toLowerCase().includes(searchItem));
        if (exactMatches && exactMatches.length > 0) {
          reply = `Found **${exactMatches.length}** matches for "${searchItem}"! I've updated your search. 🎯`;
          action = () => setSearchTerm(searchItem);
        } else {
          reply = `I couldn't find any exact matches for "${searchItem}" right now, but I've updated the search bar for you to explore similar items.`;
          action = () => setSearchTerm(searchItem);
        }
      } else {
        reply = "What would you like me to find? Just type 'Find [item]'! 🔍";
        setHighlightSearch(true); setTimeout(() => setHighlightSearch(false), 3000);
      }
    } else if (msgLower.includes("filter") || msgLower.includes("category")) {
      reply = "Click the checkboxes on the left sidebar to combine and view multiple categories!";
      setHighlightFilter(true); setTimeout(() => setHighlightFilter(false), 3000);
    } else if (msgLower.includes("sort")) {
      reply = "Use the Sort Order dropdown on the left. You can sort alphabetically or by price.";
      setHighlightSort(true); setTimeout(() => setHighlightSort(false), 3000);
    } else if (msgLower.includes("search") || msgLower.includes("find")) {
      reply = "Look up top ^! Type what you're looking for or click the microphone to speak your search.";
      setHighlightSearch(true); setTimeout(() => setHighlightSearch(false), 3000);
    } else if (msgLower.includes("price") || msgLower.includes("budget") || msgLower.includes("cheap")) {
      reply = "💰 Simply type your maximum budget in the Price Limit box to find affordable items.";
      setHighlightPrice(true); setTimeout(() => setHighlightPrice(false), 3000);
    } else if (msgLower.includes("voice") || msgLower.includes("speak")) {
      reply = "Click the pulsing microphone icon next to the search bar. We'll listen to your command!";
      setHighlightSearch(true); setTimeout(() => setHighlightSearch(false), 3000);
    } else if (msgLower.includes("favorite") || msgLower.includes("wishlist")) {
      reply = "❤️ Click the heart icon on any product to save it to your Favorites collection.";
      setHighlightFavorites(true); setTimeout(() => setHighlightFavorites(false), 3000);
    } else if (msgLower.includes("cart") || msgLower.includes("checkout")) {
      reply = "🛒 Click the cart icon to view your basket and proceed to checkout.";
      setHighlightCart(true); setTimeout(() => setHighlightCart(false), 3000);
    } else if (msgLower.includes("brand")) {
      reply = "🏷️ Click any brand name under the Brands section on the left to filter immediately. Or just ask me 'Find Nike'!";
    } else if (msgLower.includes("shipping") || msgLower.includes("delivery")) {
      reply = "🚚 Global delivery is available! Free shipping applies on premium orders above ₹5000.";
    } else if (msgLower.includes("hello") || msgLower.includes("hi") || msgLower.includes("hey")) {
      reply = "Hello! 🌟 I'm your X-Assistant. You can ask me to 'Find shoes', 'Show items under 500', or 'Reset filters'. How can I help?";
    } else if (msgLower.includes("help")) {
      reply = "🆘 Try these commands:\n• 'Find [item]'\n• 'Items under [price]'\n• 'Show [category]'\n• 'Reset filters'";
    }

    return { reply, action };
  };

  const submitAssistantMessage = async (text) => {
    if (!text.trim()) return;

    const newMsg = { from: "user", text };
    setAssistantMessages((prev) => [...prev, newMsg]);
    setUserMessage("");
    setIsTyping(true);

    const localResponse = processBotResponse(text);
    let finalReply = localResponse.reply;

    try {
      const ai = await aiAssistantChat({
        message: text,
        context: {
          currentPath: window.location.pathname,
          cartCount: cartItems.reduce((a, c) => a + (c.qty || 1), 0),
          favoritesCount: favorites.length,
          compareCount: compareList.length,
          activeCategories: checked,
          activePriceFilter: priceFilter,
          searchTerm,
        },
      }).unwrap();

      if (ai?.reply) finalReply = ai.reply;
    } catch {
      // Keep local assistant behavior if backend AI fails.
    }

    await new Promise((resolve) => setTimeout(resolve, 700));
    setAssistantMessages((prev) => [...prev, { from: "bot", text: finalReply }]);
    setIsTyping(false);

    if (localResponse.action) {
      setTimeout(localResponse.action, 250);
    }
  };

  const handleHelpClick = () => {
    if (!showFullHelp) {
      setShowFullHelp(true);
      submitAssistantMessage("Show me what you can do");
    }
  };

  const chatSuggestions = [
    "How to filter by price?",
    "Find cheap items",
    "Where is my cart?",
    "Shipping details"
  ];

  return (
    <div className="flex min-h-screen bg-surface dark:bg-[#060a12] text-content-primary dark:text-surface animate-fade-in relative overflow-x-hidden">

      {/* Decorative animated background gradients for ultra-premium mood */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-secondary/10 dark:bg-secondary/5 blur-[120px] rounded-full animate-pulse [animation-duration:10s]"></div>
        <div className="absolute top-[40%] text-center -right-[20%] w-[60%] h-[60%] bg-primary/5 dark:bg-white/5 blur-[150px] rounded-full animate-pulse [animation-duration:15s] [animation-delay:-5s]"></div>
      </div>

      {/* Sidebar with ultra-glassmorphism */}
      <div
        className={`fixed top-0 left-0 h-screen w-72 overflow-y-auto bg-white/40 dark:bg-primary-dark/40 backdrop-blur-[40px] border-r border-white/20 dark:border-white/5 p-6 hidden sm:block z-50 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_40px_-5px_rgba(0,0,0,0.4)]
          ${highlightFilter ? "ring-2 ring-secondary/50 rounded-r-[initial] bg-white/60 dark:bg-primary-light/60" : ""}
          ${highlightFavorites ? "ring-2 ring-red-500/50 rounded-r-[initial] bg-red-50/50 dark:bg-red-900/10" : ""}
          ${highlightHome ? "ring-2 ring-pink-400/50 rounded-r-[initial] bg-pink-50/50 dark:bg-pink-900/10" : ""}
          ${highlightCart ? "ring-2 ring-green-500/50 rounded-r-[initial] bg-green-50/50 dark:bg-green-900/10" : ""}
          transition-all duration-500
        `}
      >
        <div className="mb-10 text-center relative">
          <span className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light dark:from-white dark:to-zinc-400 select-none">
            SHOP
            <span className="text-secondary drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">X</span>
          </span>
          <p className="text-[9px] uppercase tracking-[0.4em] text-zinc-500 font-black mt-2">Elite Collections</p>
        </div>

        {/* Global Search - Pill shaped with inner glow */}
        <div className={`relative mb-10 group ${highlightSearch ? "ring-2 ring-secondary/50 rounded-3xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]" : ""}`}>
          <div className="flex items-center bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-3xl p-3 border border-white/30 dark:border-white/5 group-focus-within:border-secondary/40 group-focus-within:bg-white/80 dark:group-focus-within:bg-black/40 group-focus-within:shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-300">
            <FaSearch className="text-zinc-400 ml-2 mr-3 group-focus-within:text-secondary transition-colors" />
            <input
              type="text"
              placeholder="Explore..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-transparent text-sm text-content-primary dark:text-surface placeholder-zinc-400 focus:outline-none font-bold placeholder:font-medium"
            />
            {/* Enhanced Voice Button */}
            <button
              onClick={startVoiceRecognition}
              className={`relative p-3.5 rounded-full flex items-center justify-center transition-all duration-300 ${isListening
                ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                : "bg-secondary/10 dark:bg-white/10 text-secondary dark:text-white hover:bg-secondary hover:text-white dark:hover:bg-white dark:hover:text-primary hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:scale-105"
                }`}
              title="Voice Search"
            >
              {isListening && (
                <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-[ping_1.5s_ease-out_infinite]"></span>
              )}
              <FaMicrophone size={14} className={isListening ? "animate-bounce" : ""} />
            </button>
          </div>

          {showSuggestions && searchTerm && (
            <ul className="absolute left-0 right-0 top-full mt-3 bg-white/90 dark:bg-primary-light/90 backdrop-blur-xl text-content-primary dark:text-surface rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/50 dark:border-white/10 max-h-60 overflow-y-auto text-sm z-[60] overflow-hidden">
              {suggestions?.length > 0 ? (
                suggestions.map((s) => (
                  <li
                    key={s._id}
                    className="px-5 py-3.5 hover:bg-secondary/10 dark:hover:bg-secondary/20 cursor-pointer text-sm font-bold border-b border-zinc-100/50 dark:border-zinc-800/50 last:border-0 transition-colors"
                    onClick={() => handleSuggestionClick(s.name)}
                  >
                    {s.name}
                  </li>
                ))
              ) : (
                <li className="px-5 py-6 text-zinc-400 italic text-center text-xs">No elite assets match your criteria</li>
              )}
            </ul>
          )}
        </div>

        {/* Category Filters with styled checkboxes */}
        <div className={`mb-10 ${highlightFilter ? "bg-secondary/10 p-5 rounded-3xl border border-secondary/20 shadow-[0_0_30px_-5px_rgba(212,175,55,0.15)]" : ""}`}>
          <h3 className="text-[10px] uppercase tracking-[0.25em] mb-5 font-black text-zinc-400 flex items-center gap-2">
            <FaFilter size={10} className="text-secondary/60" /> Categories
          </h3>
          <div className="space-y-4">
            {categories?.map((c) => (
              <div key={c._id} className="flex items-center group cursor-pointer relative">
                <div className="relative flex items-center justify-center w-5 h-5 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-black/20 group-hover:border-secondary transition-all">
                  <input
                    type="checkbox"
                    checked={checked.includes(c._id)}
                    onChange={(e) => handleCheck(e.target.checked, c._id)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-2.5 h-2.5 rounded-[3px] transition-all duration-300 ${checked.includes(c._id) ? "bg-secondary scale-100" : "bg-transparent scale-0"}`}></div>
                </div>
                <label className="ml-3 text-sm font-bold text-zinc-600 dark:text-zinc-300 group-hover:text-primary dark:group-hover:text-white transition-colors cursor-pointer select-none">
                  {c.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Brands with premium minimal styling */}
        <div className="mb-10">
          <h3 className="text-[10px] uppercase tracking-[0.25em] mb-5 font-black text-zinc-400 flex items-center gap-2">
            <FaShoppingBag size={10} className="text-secondary/60" /> Curated Brands
          </h3>
          <div className="grid grid-cols-1 gap-2.5">
            {uniqueBrands?.map((brand) => (
              <button
                key={brand}
                onClick={() => handleBrandClick(brand)}
                className="text-left px-5 py-3 rounded-2xl text-xs uppercase tracking-wider font-black bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/40 dark:border-white/5 hover:border-secondary hover:bg-secondary/5 hover:text-secondary hover:shadow-[inset_0_0_10px_rgba(212,175,55,0.05)] transition-all duration-300"
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Price Filter with inner glow */}
        <div className="mb-10">
          <h3 className="text-[10px] uppercase tracking-[0.25em] mb-5 font-black text-zinc-400 flex items-center gap-2">
            ₹ Value Limit
          </h3>
          <div className={`relative ${highlightPrice ? "ring-2 ring-secondary/50 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.2)]" : ""}`}>
            <input
              type="number"
              placeholder="Ex: 5000"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full px-5 py-4 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-2xl text-sm font-bold border border-white/30 dark:border-white/5 focus:outline-none focus:border-secondary/40 focus:bg-white/80 dark:focus:bg-black/40 focus:shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-300 placeholder:text-zinc-400"
              ref={priceInputRef}
            />
          </div>
        </div>

        {/* Sort By with custom arrow */}
        <div className={`mb-10 ${highlightSort ? "ring-2 ring-secondary/50 p-5 rounded-3xl bg-secondary/5 border border-secondary/20 shadow-[0_0_30px_-5px_rgba(212,175,55,0.15)]" : ""}`}>
          <h3 className="text-[10px] uppercase tracking-[0.25em] mb-5 font-black text-zinc-400 flex items-center gap-2">
            <FaSort size={10} className="text-secondary/60" /> Layout Flow
          </h3>
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full bg-white/50 dark:bg-black/20 backdrop-blur-md px-5 py-4 rounded-2xl text-sm font-bold border border-white/30 dark:border-white/5 focus:outline-none focus:border-secondary/40 hover:border-white/60 dark:hover:border-white/20 transition-all duration-300 cursor-pointer appearance-none outline-none"
            >
              <option value="">Default Collection</option>
              <option value="price-asc">Value: Essential First</option>
              <option value="price-desc">Value: Premium First</option>
              <option value="name-asc">Alphabetical: A → Z</option>
              <option value="name-desc">Alphabetical: Z → A</option>
            </select>
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-zinc-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Quick Nav Blocks - Glassy pills */}
        <div className="space-y-3 pt-8 mt-4 border-t border-zinc-200/30 dark:border-zinc-800/50">
          <Link to="/favorites" className={`flex items-center gap-4 p-3.5 rounded-2xl hover:bg-red-50/80 dark:hover:bg-red-900/20 backdrop-blur-md border border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-all duration-300 group ${highlightFavorites ? "ring-2 ring-red-500/50 bg-red-50/80 dark:bg-red-900/20" : ""}`}>
            <div className="w-10 h-10 rounded-xl bg-red-100/50 dark:bg-red-900/30 flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300 shadow-inner">
              <FaHeart size={16} />
            </div>
            <span className="text-sm font-black text-content-primary dark:text-surface">Favorites</span>
          </Link>

          <Link to="/" className={`flex items-center gap-4 p-3.5 rounded-2xl hover:bg-pink-50/80 dark:hover:bg-pink-900/20 backdrop-blur-md border border-transparent hover:border-pink-100 dark:hover:border-pink-900/30 transition-all duration-300 group ${highlightHome ? "ring-2 ring-pink-400/50 bg-pink-50/80 dark:bg-pink-900/20" : ""}`}>
            <div className="w-10 h-10 rounded-xl bg-pink-100/50 dark:bg-pink-900/30 flex items-center justify-center text-pink-500 group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300 shadow-inner">
              <FaHome size={16} />
            </div>
            <span className="text-sm font-black text-content-primary dark:text-surface">Dashboard</span>
          </Link>

          <Link to="/cart" className={`flex items-center gap-4 p-3.5 rounded-2xl hover:bg-green-50/80 dark:hover:bg-green-900/20 backdrop-blur-md border border-transparent hover:border-green-100 dark:hover:border-green-900/30 transition-all duration-300 group ${highlightCart ? "ring-2 ring-green-500/50 bg-green-50/80 dark:bg-green-900/20" : ""}`}>
            <div className="w-10 h-10 rounded-xl bg-green-100/50 dark:bg-green-900/30 flex items-center justify-center text-green-500 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white transition-all duration-300 shadow-inner">
              <FaShoppingCart size={16} />
            </div>
            <span className="text-sm font-black text-content-primary dark:text-surface">My Cart</span>
          </Link>
        </div>
      </div>

      {/* Main Products Grid - Adjusted for new dark background */}
      <div className="w-full sm:ml-72 flex-1 p-6 md:p-10 lg:p-12 relative z-10">
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-1 text-primary dark:text-white">The <span className="text-secondary drop-shadow-sm">Marketplace</span></h1>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] ml-1">Discover {products?.length} premium results</p>
          </div>
          <div className="flex items-center gap-4 pb-2">
            <span className="px-5 py-2.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md text-secondary text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-secondary/20">Live Inventory</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {products.length === 0 ? (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-zinc-400 bg-white/20 dark:bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/20">
              <div className="w-32 h-32 rounded-full bg-zinc-100/50 dark:bg-black/20 flex items-center justify-center mb-8 shadow-inner">
                <FaSearch size={48} className="opacity-20 text-primary dark:text-white" />
              </div>
              <p className="text-2xl font-black text-primary dark:text-white mb-2">No assets found</p>
              <p className="text-sm font-bold text-zinc-500">Your specific criteria yielded zero results.</p>
              <button
                onClick={() => { dispatch(setChecked([])); setPriceFilter(""); setSearchTerm(""); }}
                className="mt-8 px-8 py-4 rounded-2xl bg-primary dark:bg-white text-white dark:text-primary text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Reset Parameters
              </button>
            </div>
          ) : (
            products.map((p) => (
              <div key={p._id} className="animate-slide-up">
                <ProductCard p={p} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ultra Premium AI Assistant */}
      {createPortal(
        <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-[9999]">
          {/* Floating Orb Toggle Button */}
          <button
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            className="w-16 h-16 rounded-full shadow-[0_0_40px_rgba(212,175,55,0.4)] flex items-center justify-center text-white text-3xl transition-all duration-500 hover:scale-110 active:scale-95 group relative border border-white/20 overflow-visible"
            aria-label="Toggle AI Assistant"
          >
            {/* Animated Gradient Background for Button */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-secondary-light via-secondary to-secondary-dark ${isAssistantOpen ? 'animate-spin-slow' : 'opacity-90'}`}></div>
            {/* Inner Glow */}
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 to-transparent"></div>
            {/* Pulse Effect */}
            {!isAssistantOpen && <div className="absolute inset-0 rounded-full border border-secondary/50 animate-[ping_3s_ease-out_infinite]"></div>}

            <div className="relative z-10 drop-shadow-md">
              {isAssistantOpen ? (
                <svg className="w-6 h-6 transform rotate-90 transition-transform duration-500 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <span className="block group-hover:-translate-y-1 transition-transform duration-300">🤖</span>
              )}
            </div>
          </button>

          <AnimatePresence>
            {isAssistantOpen && (
              <motion.div
                drag
                dragConstraints={{ left: -1000, right: 50, top: -800, bottom: 50 }}
                dragElastic={0.1}
                initial={{ opacity: 0, scale: 0.8, y: 40, rx: 50, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, y: 0, rx: 40, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, y: 40, filter: "blur(10px)" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute bottom-20 right-0 w-[92vw] sm:w-[420px] h-[72vh] sm:h-[650px] min-w-[300px] sm:min-w-[320px] min-h-[420px] sm:min-h-[450px] bg-white/80 dark:bg-[#060a12]/80 backdrop-blur-[40px] rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.3),_0_0_40px_rgba(212,175,55,0.1)] flex flex-col border border-white/40 dark:border-white/10 overflow-hidden resize"
                style={{ touchAction: "none" }}
              >
                {/* Premium Header */}
                <div className="px-8 py-6 flex justify-between items-center relative overflow-hidden bg-gradient-to-b from-white/60 to-transparent dark:from-white/5 border-b border-white/20 dark:border-white/5 cursor-grab active:cursor-grabbing">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-[40px] -mr-10 -mt-10"></div>
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-light to-secondary shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center justify-center text-white text-lg">🤖</div>
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#060a12] rounded-full shadow-sm"></span>
                    </div>
                    <div>
                      <h3 className="font-black text-base text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light dark:from-white dark:to-zinc-300 tracking-tight">X-Intelligence</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">System Online</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleHelpClick}
                    className="relative z-10 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2.5 rounded-xl bg-primary/5 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 text-primary dark:text-white transition-all backdrop-blur-md shadow-inner border border-white/20 dark:border-white/5"
                  >
                    Help
                  </button>
                </div>

                {/* Chat Body - Frosted Glass Area */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-none relative">

                  {/* Intro Suggestion Chips if it's new */}
                  {assistantMessages.length === 1 && (
                    <div className="flex flex-wrap gap-2 mt-4 animate-fade-in pl-2">
                      {chatSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => submitAssistantMessage(suggestion)}
                          className="text-[10px] font-black uppercase tracking-widest text-secondary border border-secondary/30 bg-secondary/5 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-secondary hover:text-white dark:hover:text-primary transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:-translate-y-0.5"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Messages */}
                  {assistantMessages.map((msg, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      key={i}
                      className={`flex ${msg.from === "bot" ? "justify-start" : "justify-end"}`}
                    >
                      <div className={`max-w-[85%] px-6 py-4 rounded-3xl font-bold text-sm leading-relaxed shadow-sm backdrop-blur-md ${msg.from === "bot"
                        ? "bg-white/80 dark:bg-white/5 text-content-primary dark:text-surface rounded-tl-sm border border-white/50 dark:border-white/10"
                        : "bg-gradient-to-br from-secondary to-secondary-dark text-white rounded-tr-sm shadow-[0_10px_20px_rgba(212,175,55,0.2)] border border-white/20"
                        }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing Indicator - Glass pill */}
                  {isTyping && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-start">
                      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-3xl rounded-tl-sm border border-white/50 dark:border-white/10 px-6 py-5 shadow-sm flex gap-2 items-center">
                        <span className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-secondary/70 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-secondary/40 rounded-full animate-bounce"></span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Input Area - Floating Island */}
                <div className="p-6 bg-gradient-to-t from-white/90 via-white/80 to-transparent dark:from-[#060a12]/90 dark:via-[#060a12]/80 relative z-10 pt-10">
                  <div className="flex gap-3 bg-white/60 dark:bg-black/30 backdrop-blur-xl p-2 rounded-2xl border border-white/50 dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.05)] group focus-within:border-secondary/50 focus-within:bg-white/90 dark:focus-within:bg-black/50 transition-all duration-300">
                    <input
                      type="text"
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      placeholder="Ask about premium items..."
                      className="flex-1 px-4 py-3 bg-transparent text-content-primary dark:text-surface placeholder-zinc-400 focus:outline-none text-sm font-bold transition-all"
                      onKeyDown={(e) => e.key === "Enter" && submitAssistantMessage(userMessage)}
                      disabled={isTyping}
                    />
                    <button
                      onClick={() => submitAssistantMessage(userMessage)}
                      disabled={isTyping || !userMessage.trim()}
                      className="w-12 h-12 bg-gradient-to-br from-secondary-light to-secondary text-white rounded-xl flex items-center justify-center hover:shadow-[0_0_15px_rgba(212,175,55,0.5)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                    >
                      <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Shop;
