import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFinancialData } from "../../redux/features/advisor/advisorSlice";
import { motion, AnimatePresence } from "framer-motion";
import { FaCalculator, FaWallet, FaRegMoneyBillAlt, FaChartLine } from "react-icons/fa";

const FinancialAdvisor = ({ product }) => {
    const dispatch = useDispatch();
    const { monthlyIncome, monthlyExpenses, currentSavings } = useSelector(
        (state) => state.advisor
    );

    const [income, setIncome] = useState(monthlyIncome || "");
    const [expenses, setExpenses] = useState(monthlyExpenses || "");
    const [savings, setSavings] = useState(currentSavings || "");
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (monthlyIncome && monthlyExpenses) {
            setShowResults(true);
        }
    }, [monthlyIncome, monthlyExpenses]);

    const handleCalculate = (e) => {
        e.preventDefault();
        dispatch(
            setFinancialData({
                monthlyIncome: Number(income),
                monthlyExpenses: Number(expenses),
                currentSavings: Number(savings),
            })
        );
        setShowResults(true);
    };

    const calculateEMI = (principal, annualRate, months) => {
        const monthlyRate = annualRate / 12 / 100;
        const emi =
            (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1);
        return Math.round(emi);
    };

    const price = product?.price || 0;
    const inc = Number(monthlyIncome) || 0;
    const exp = Number(monthlyExpenses) || 0;
    const sav = Number(currentSavings) || 0;

    const disposableIncome = inc - exp;
    const safeSpendingLimit = disposableIncome * 0.3;
    const canAffordUpfront = price <= safeSpendingLimit;
    const shortFall = price - (sav + safeSpendingLimit);

    const emi6 = calculateEMI(price, 15, 6);
    const emi12 = calculateEMI(price, 15, 12);
    const emi24 = calculateEMI(price, 15, 24);

    const emiAffordable = (emi) => emi <= safeSpendingLimit;

    return (
        <div className="mt-12 bg-white dark:bg-[#0c1222] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-10 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointers-events-none">
                <FaChartLine size={200} />
            </div>

            <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-secondary/10 rounded-2xl text-secondary">
                    <FaCalculator size={28} />
                </div>
                <div>
                    <h3 className="text-2xl md:text-3xl font-black text-content-primary dark:text-surface tracking-tight">
                        AI Financial Advisor
                    </h3>
                    <p className="text-sm font-medium text-zinc-500 mt-1">
                        Smart affordability analysis for {product?.name}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                {/* Input Form */}
                <div>
                    <form onSubmit={handleCalculate} className="flex flex-col gap-6">
                        <div>
                            <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2">
                                Monthly Income (₹)
                            </label>
                            <input
                                type="number"
                                required
                                value={income}
                                onChange={(e) => setIncome(e.target.value)}
                                className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-content-primary dark:text-surface focus:outline-none focus:border-secondary transition-colors"
                                placeholder="e.g. 100000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2">
                                Monthly Expenses (₹)
                            </label>
                            <input
                                type="number"
                                required
                                value={expenses}
                                onChange={(e) => setExpenses(e.target.value)}
                                className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-content-primary dark:text-surface focus:outline-none focus:border-secondary transition-colors"
                                placeholder="e.g. 50000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2">
                                Current Savings (₹) - Optional
                            </label>
                            <input
                                type="number"
                                value={savings}
                                onChange={(e) => setSavings(e.target.value)}
                                className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-content-primary dark:text-surface focus:outline-none focus:border-secondary transition-colors"
                                placeholder="e.g. 20000"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4 rounded-2xl bg-black text-white dark:bg-secondary dark:text-primary font-black text-lg shadow-lg hover:opacity-90 transition-opacity"
                        >
                            Analyze Affordability
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                <AnimatePresence>
                    {showResults && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center"
                        >
                            <div className="mb-8">
                                <h4 className="text-xl font-bold mb-4 flex items-center gap-2 text-content-primary dark:text-surface">
                                    <FaWallet className="text-secondary" />
                                    Your Financial Profile
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white dark:bg-[#0c1222] rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Disposable</p>
                                        <p className="text-lg font-black text-content-primary dark:text-surface">₹{disposableIncome.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-[#0c1222] rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Safe Limit</p>
                                        <p className="text-lg font-black text-secondary">₹{safeSpendingLimit.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
                                <h4 className="text-xl font-bold mb-4 flex items-center gap-2 text-content-primary dark:text-surface">
                                    <FaRegMoneyBillAlt className="text-secondary" />
                                    Recommendation
                                </h4>

                                {disposableIncome <= 0 ? (
                                    <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-800/30">
                                        <p className="font-bold">❌ Not Recommended</p>
                                        <p className="text-sm mt-1">Your expenses exceed or match your income. We advise prioritizing savings before purchasing.</p>
                                    </div>
                                ) : canAffordUpfront ? (
                                    <div className="p-4 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-2xl border border-green-200 dark:border-green-800/30">
                                        <p className="font-bold text-lg">✅ Buy Now</p>
                                        <p className="text-sm mt-1">This product is well within your safe spending limit ({`₹${safeSpendingLimit.toLocaleString()}`}). You can afford to buy it directly.</p>
                                    </div>
                                ) : emiAffordable(emi12) ? (
                                    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 rounded-2xl border border-yellow-200 dark:border-yellow-800/30">
                                        <p className="font-bold text-lg">⏳ Buy Using EMI</p>
                                        <p className="text-sm mt-1">Direct purchase exceeds your safe limit, but a 12-month EMI of ₹{emi12.toLocaleString()} is within your monthly budget.</p>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-2xl border border-blue-200 dark:border-blue-800/30">
                                        <p className="font-bold text-lg">🏦 Save Up</p>
                                        <p className="text-sm mt-1">Even with EMIs, this purchase might strain your budget. Consider saving <strong>₹{Math.ceil(safeSpendingLimit)}/month</strong> for {Math.ceil(price / safeSpendingLimit)} months to buy it safely.</p>
                                    </div>
                                )}
                            </div>

                            {!canAffordUpfront && disposableIncome > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold mb-3 text-zinc-500 uppercase tracking-widest text-center">EMI Options (15% p.a.)</h4>
                                    <div className="flex gap-2 justify-between">
                                        {[
                                            { m: 6, emi: emi6 },
                                            { m: 12, emi: emi12 },
                                            { m: 24, emi: emi24 },
                                        ].map(({ m, emi }) => (
                                            <div key={m} className={`flex-1 p-3 rounded-xl border text-center transition-colors ${emiAffordable(emi) ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800/30' : 'bg-white dark:bg-[#0c1222] border-zinc-100 dark:border-zinc-800'}`}>
                                                <p className="text-xs text-zinc-500 font-bold mb-1">{m} Months</p>
                                                <p className={`font-black ${emiAffordable(emi) ? 'text-green-600 dark:text-green-400' : 'text-content-primary dark:text-surface'}`}>₹{emi.toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FinancialAdvisor;
