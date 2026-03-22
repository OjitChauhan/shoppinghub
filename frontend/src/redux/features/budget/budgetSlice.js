import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  budget: localStorage.getItem("budget") ? JSON.parse(localStorage.getItem("budget")) : 5000,
  transactions: localStorage.getItem("transactions") ? JSON.parse(localStorage.getItem("transactions")) : [],
};

const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    setBudget: (state, action) => {
      state.budget = action.payload;
      localStorage.setItem("budget", JSON.stringify(state.budget));
    },
    addTransaction: (state, action) => {
      state.transactions.push(action.payload);
      localStorage.setItem("transactions", JSON.stringify(state.transactions));
    },
    resetBudget: (state) => {
      state.budget = 5000;
      state.transactions = [];
      localStorage.setItem("budget", JSON.stringify(state.budget));
      localStorage.setItem("transactions", JSON.stringify(state.transactions));
    },
  },
});

export const { setBudget, addTransaction, resetBudget } = budgetSlice.actions;
export default budgetSlice.reducer;
