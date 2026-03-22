import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";
import { addToCart, removeFromCart } from "../redux/features/cart/cartSlice";
import { setBudget, addTransaction, resetBudget } from "../redux/features/budget/budgetSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import { motion, AnimatePresence } from "framer-motion";

// Theme shades aligned with central config
const THEME = {
  primary: "#0F172A",      // slate-900
  secondary: "#D4AF37",    // gold
  surface: "#F8FAFC",   // slate-50
  accent: "#3CBEAC",       // aqua (keeping for budget)
};

const BudgetTracker = () => {
  const dispatch = useDispatch();
  const { data: categoriesData } = useFetchCategoriesQuery();

  const categories = categoriesData?.map(c => c.name) || ["Other", "Food", "Travel", "Shopping", "Bills"];
  const budget = useSelector(state => state.budget.budget);
  const transactions = useSelector(state => state.budget.transactions);

  const [isEditing, setIsEditing] = useState(false);
  const [inputBudget, setInputBudget] = useState(budget);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0] || "Other");
  const [description, setDescription] = useState("");
  const [filterCategory, setFilterCategory] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (categories.length > 0) setCategory(categories[0]);
  }, [categories]);

  useEffect(() => {
    setInputBudget(budget);
  }, [budget]);

  const spent = transactions.reduce((acc, t) => acc + Number(t.amount), 0);
  const remaining = budget - spent;
  const percentUsed = budget ? Math.round((spent / budget) * 100) : 0;

  const filteredTransactions = filterCategory
    ? transactions.filter(tx => tx.category === filterCategory)
    : transactions;

  const handleAddTransaction = () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    dispatch(
      addTransaction({
        id: Date.now(),
        amount: Number(amount),
        category,
        description,
      })
    );
    setAmount("");
    setCategory(categories[0]);
    setDescription("");
  };

  const handleEditBudget = () => {
    if (!inputBudget || isNaN(inputBudget) || Number(inputBudget) < 0) {
      alert("Please enter a valid budget amount");
      return;
    }
    dispatch(setBudget(Number(inputBudget)));
    setIsEditing(false);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the budget and all transactions?")) {
      dispatch(resetBudget());
      setFilterCategory(null);
      setShowHistory(false);
      setIsEditing(false);
      setInputBudget(0);
    }
  };

  const handleDownloadCSV = () => {
    if (transactions.length === 0) {
      alert("No transactions to download");
      return;
    }

    const headers = "Date,Amount,Category,Description,Items Purchased\n";
    const rows = transactions.map(t =>
      `${new Date(t.id).toLocaleDateString()},${t.amount},${t.category},"${t.description || ''}","${t.itemsPurchased?.join('; ') || ''}"`
    ).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const anchor = document.createElement("a");
    anchor.setAttribute("href", csvContent);
    anchor.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <div className="rounded-3xl shadow-2xl p-8 max-w-4xl mx-auto mb-12 bg-white dark:bg-primary-light border border-zinc-100 dark:border-zinc-800 transition-all animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black tracking-tight text-primary dark:text-white">
          💰 Budget <span className="text-secondary">Tracker</span>
        </h2>
        <span className="px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest">Financial Wellness</span>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Budget", value: `₹${budget}`, color: "secondary", border: "border-secondary" },
          { label: "Total Spent", value: `₹${spent}`, color: "accent", border: "border-secondary-light" },
          { label: "Remaining", value: `₹${remaining}`, color: remaining < 0 ? "red-500" : "green-500", border: remaining < 0 ? "border-red-500" : "border-green-500" },
          { label: "Allocation", value: `${percentUsed}%`, color: percentUsed > 80 ? "red-500" : "secondary", border: percentUsed > 80 ? "border-red-500" : "border-secondary" }
        ].map((stat, i) => (
          <div key={i} className={`p-5 rounded-2xl bg-zinc-50 dark:bg-primary-dark/50 border-l-4 ${stat.border}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{stat.label}</p>
            <p className={`text-xl font-black text-${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mb-10 bg-zinc-50 dark:bg-primary-dark/30 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <p className="font-black text-sm uppercase tracking-tight text-primary dark:text-white">Limit Utilization</p>
          <p className="text-sm font-black text-secondary">₹{spent} of ₹{budget}</p>
        </div>
        <div className="w-full h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shadow-inner">
          <div
            className="h-full transition-all duration-700 rounded-full bg-gradient-to-r from-secondary-dark to-secondary-light"
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
        {remaining < 0 && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-black text-center animate-pulse uppercase tracking-widest">
            ⚠️ Liquidity Alert: Over Budget by ₹{Math.abs(remaining)}
          </div>
        )}
      </div>

      {/* Action Tabs */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <button
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${showHistory ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? "Hide Logs" : "View Logs"}
        </button>
        <button
          className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-primary-dark text-secondary font-black text-xs uppercase tracking-widest hover:bg-secondary hover:text-primary transition-all"
          onClick={handleDownloadCSV}
        >
          Export CSV
        </button>
        <button
          className="ml-auto px-5 py-2.5 rounded-xl bg-red-50 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
          onClick={handleReset}
        >
          Clear All
        </button>
      </div>

      {/* Forms Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-primary-dark/50 border border-zinc-100 dark:border-zinc-800">
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-black text-zinc-400 mb-6">Update Allowance</h3>
          {isEditing ? (
            <div className="flex flex-col gap-3">
              <input
                type="number"
                className="w-full p-4 rounded-xl dark:bg-primary-dark font-black focus:ring-2 focus:ring-secondary outline-none transition-all shadow-inner"
                value={inputBudget}
                onChange={e => setInputBudget(e.target.value)}
                min={0}
                placeholder="Set Amount"
              />
              <div className="flex gap-2">
                <button className="flex-1 py-3 rounded-xl bg-green-500 text-white font-black uppercase text-xs" onClick={handleEditBudget}>Save</button>
                <button className="flex-1 py-3 rounded-xl bg-zinc-200 text-zinc-600 font-black uppercase text-xs" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button
              className="w-full p-4 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-secondary hover:text-secondary font-black transition-all text-sm uppercase tracking-widest"
              onClick={() => setIsEditing(true)}
            >
              Edit Current: ₹{budget}
            </button>
          )}
        </div>

        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-primary-dark/50 border border-zinc-100 dark:border-zinc-800">
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-black text-zinc-400 mb-6">New Entry</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Amt ₹"
                className="w-32 p-4 rounded-xl dark:bg-primary-dark font-black focus:ring-2 focus:ring-secondary outline-none shadow-inner"
              />
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="flex-1 p-4 rounded-xl bg-secondary text-primary font-black uppercase text-[10px] tracking-widest outline-none cursor-pointer"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <input
              type="text"
              placeholder="Reference Note"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-4 rounded-xl dark:bg-primary-dark font-black focus:ring-2 focus:ring-secondary outline-none shadow-inner text-sm"
            />
            <button className="w-full py-4 rounded-xl bg-primary text-white dark:bg-white dark:text-primary font-black uppercase text-xs tracking-[0.2em] shadow-lg active:scale-95 transition-all" onClick={handleAddTransaction}>
              Commit Entry
            </button>
          </div>
        </div>
      </div>

      {/* History Slide */}
      {showHistory && (
        <div className="mt-10 animate-slide-up bg-zinc-50 dark:bg-primary-dark/80 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 max-h-80 overflow-y-auto">
          <h3 className="font-black text-sm uppercase tracking-widest mb-4">Transaction Ledger</h3>
          <div className="space-y-3">
            {transactions.length === 0 ? <p className="text-center text-zinc-400 py-10 font-bold italic">No records found</p> :
              transactions.slice().reverse().map(tx => (
                <div key={tx.id} className="bg-white dark:bg-primary-light p-4 rounded-2xl flex justify-between items-center shadow-sm border border-zinc-100 dark:border-zinc-800 group hover:border-secondary transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      <span className="font-black text-sm">{tx.category}</span>
                    </div>
                    <p className="text-xs text-zinc-400 font-bold mt-1 ml-4">{tx.description || 'No description'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-primary dark:text-secondary">₹{tx.amount}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">{new Date(tx.id).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart);
  const budget = useSelector((state) => state.budget.budget);
  const transactions = useSelector((state) => state.budget.transactions);

  const { cartItems } = cart;

  const [showBudgetExceeded, setShowBudgetExceeded] = useState(false);
  const [exceedAmount, setExceedAmount] = useState(0);

  const spent = transactions.reduce((acc, t) => acc + Number(t.amount), 0);
  const remainingBudget = budget - spent;

  const addToCartHandler = (product, qty) => {
    const newCost = qty * product.price;
    if (newCost > remainingBudget) {
      setExceedAmount(newCost - remainingBudget);
      setShowBudgetExceeded(true);
      return;
    }
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    const itemsByCategory = cartItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item.name);
      return acc;
    }, {});

    Object.entries(itemsByCategory).forEach(([category, products]) => {
      const amount = cartItems
        .filter((i) => i.category === category)
        .reduce((a, c) => a + c.qty * c.price, 0);

      dispatch(
        addTransaction({
          id: Date.now() + Math.random(),
          amount,
          category,
          description: "Checkout purchase",
          itemsPurchased: products,
        })
      );
    });

    navigate("/login?redirect=/shipping");
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="min-h-screen bg-surface dark:bg-primary-dark transition-colors duration-500">
      <div className="container mx-auto px-6 lg:px-20 pt-12 pb-24 animate-fade-in">
        {/* Budget Exceeded Modal */}
        <AnimatePresence>
          {showBudgetExceeded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-[200] p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-primary-light rounded-[3rem] p-10 max-w-md w-full text-center shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-zinc-100 dark:border-zinc-800"
              >
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-4xl mx-auto mb-6">🚫</div>
                <h3 className="text-2xl font-black text-red-500 mb-2 uppercase tracking-tight">Budget Limit Reached</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-bold mb-6">
                  Financial security guard: You need <span className="text-red-500">₹{exceedAmount.toFixed(2)}</span> more to authorize this addition.
                </p>
                <div className="bg-zinc-50 dark:bg-primary-dark p-6 rounded-2xl mb-8 border border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Available</p>
                    <p className="font-black text-secondary">₹{remainingBudget}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Entry Cost</p>
                    <p className="font-black text-red-500">₹{exceedAmount + remainingBudget}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    className="w-full btn-premium"
                    onClick={() => setShowBudgetExceeded(false)}
                  >
                    Adjust Basket
                  </button>
                  <button
                    className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-secondary py-3 transition-colors"
                    onClick={() => {
                      setShowBudgetExceeded(false);
                      const element = document.getElementById('budget-tracker');
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Top-up Allowance
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {cartItems.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-primary-light rounded-[4rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 max-w-4xl mx-auto">
            <div className="text-8xl mb-10 animate-bounce">🛒</div>
            <h1 className="text-5xl font-black tracking-tight mb-4">Empty <span className="text-secondary">Vault</span></h1>
            <p className="text-zinc-500 font-black mb-10 max-w-xs mx-auto text-lg leading-relaxed">
              Your luxury collection awaits. Start curating your style.
            </p>
            <Link to="/shop" className="btn-premium inline-block px-12 text-sm uppercase tracking-widest">
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-12">
            {/* Cart Item List */}
            <div className="flex-1">
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <h1 className="text-6xl font-black tracking-tighter">My <span className="text-secondary">Cart</span></h1>
                  <p className="text-zinc-400 font-black uppercase text-xs tracking-[0.3em] mt-2">Reserved: {cartItemCount} LUXURY ITEMS</p>
                </div>
                <div className="w-20 h-[2px] bg-secondary hidden md:block"></div>
              </div>

              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="group bg-white dark:bg-primary-light rounded-[2.5rem] p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all border border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center gap-8"
                  >
                    {/* Product Image */}
                    <div className="w-40 h-40 bg-zinc-50 dark:bg-primary-dark rounded-3xl p-6 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-contain w-full h-full"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 text-center md:text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary block mb-1">{item.brand}</span>
                      <Link
                        to={`/product/${item._id}`}
                        className="text-2xl font-black hover:text-secondary transition-colors block mb-4 tracking-tight"
                      >
                        {item.name}
                      </Link>
                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5">Price</p>
                          <p className="text-2xl font-black">₹{item.price.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="w-[1px] h-10 bg-zinc-100 dark:bg-zinc-800"></div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5">Asset Total</p>
                          <p className="text-2xl font-black text-secondary">₹{(item.qty * item.price).toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Delete */}
                    <div className="flex items-center gap-4 bg-zinc-50 dark:bg-primary-dark p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <div className="flex flex-col items-center px-4">
                        <span className="text-[9px] font-black text-zinc-400 uppercase mb-1">Qty</span>
                        <select
                          className="bg-transparent font-black text-primary dark:text-white focus:outline-none cursor-pointer text-lg appearance-none"
                          value={item.qty}
                          onChange={(e) => addToCartHandler(item, Number(e.target.value))}
                        >
                          {[...Array(Math.min(item.countInStock, 10)).keys()].map((x) => (
                            <option key={x + 1} value={x + 1} className="dark:bg-primary-dark">{x + 1}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-[1px] h-10 bg-zinc-200 dark:bg-zinc-800"></div>
                      <button
                        className="w-12 h-12 rounded-xl bg-white dark:bg-primary-light text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                        onClick={() => removeFromCartHandler(item._id)}
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="w-full xl:w-[450px]">
              <div className="bg-white dark:bg-primary-light rounded-[3.5rem] shadow-[0_25px_80px_rgba(0,0,0,0.15)] p-12 border border-zinc-100 dark:border-zinc-800 sticky top-32">
                <h2 className="text-3xl font-black mb-8 tracking-tighter">Valuation Summary</h2>

                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-end">
                    <span className="text-zinc-400 font-bold uppercase text-[11px] tracking-widest">Selected Assets</span>
                    <span className="font-black text-xl">{cartItemCount}</span>
                  </div>

                  <div className="flex justify-between items-end">
                    <span className="text-zinc-400 font-bold uppercase text-[11px] tracking-widest">Sub-estimated Value</span>
                    <span className="font-black text-3xl">₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="h-[2px] bg-gradient-to-r from-transparent via-zinc-100 dark:via-zinc-800 to-transparent" />
                </div>

                {/* Budget Health Card */}
                <div
                  className={`p-6 rounded-3xl mb-10 border-2 transition-all ${remainingBudget >= cartTotal
                    ? "bg-green-50 dark:bg-green-900/10 border-green-500/20"
                    : "bg-red-50 dark:bg-red-950/20 border-red-500/30 animate-pulse"
                    }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Allowance Review</span>
                    <div className={`w-3 h-3 rounded-full ${remainingBudget >= cartTotal ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-zinc-500">Available Credit</span>
                      <span className={`font-black ${remainingBudget >= cartTotal ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>₹{remainingBudget.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-zinc-500">Projected Delta</span>
                      <span className="font-black">₹{(remainingBudget - cartTotal).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {remainingBudget < cartTotal && (
                    <p className="text-[10px] font-black uppercase text-red-500 text-center mt-4 tracking-widest">
                      ⚠️ Transaction Restriction Active
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <button
                    className="w-full btn-premium py-5 disabled:opacity-30 disabled:scale-100 disabled:shadow-none min-h-[70px]"
                    disabled={cartItems.length === 0 || remainingBudget < cartTotal}
                    onClick={checkoutHandler}
                  >
                    <span className="text-base uppercase tracking-[0.2em]">Authorize Purchase</span>
                  </button>

                  <Link
                    to="/shop"
                    className="w-full block text-center py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-primary-dark transition-all text-zinc-400 hover:text-secondary border-2 border-transparent hover:border-zinc-100 dark:hover:border-zinc-800"
                  >
                    ← Continue Curating
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Budget Tracker Section */}
      <div id="budget-tracker" className="pt-20 pb-32 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-primary-dark/20 backdrop-blur-3xl">
        <BudgetTracker />
      </div>
    </div>
  );
};

export default Cart;
