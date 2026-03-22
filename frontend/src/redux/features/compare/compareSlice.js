import { createSlice } from "@reduxjs/toolkit";

const MAX_COMPARE = 3;

const loadCompareFromStorage = () => {
  try {
    const stored = localStorage.getItem("compareList");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCompareToStorage = (list) => {
  try {
    localStorage.setItem("compareList", JSON.stringify(list));
  } catch {}
};

const compareSlice = createSlice({
  name: "compare",
  initialState: {
    compareList: loadCompareFromStorage(),
  },
  reducers: {
    addToCompare: (state, action) => {
      const product = action.payload;
      const exists = state.compareList.find((p) => p._id === product._id);
      if (!exists && state.compareList.length < MAX_COMPARE) {
        state.compareList.push(product);
        saveCompareToStorage(state.compareList);
      }
    },
    removeFromCompare: (state, action) => {
      const id = action.payload;
      state.compareList = state.compareList.filter((p) => p._id !== id);
      saveCompareToStorage(state.compareList);
    },
    clearCompare: (state) => {
      state.compareList = [];
      saveCompareToStorage([]);
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare } =
  compareSlice.actions;

export default compareSlice.reducer;
