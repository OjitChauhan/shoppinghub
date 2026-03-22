import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    monthlyIncome: localStorage.getItem("advisor_monthlyIncome") ? Number(localStorage.getItem("advisor_monthlyIncome")) : "",
    monthlyExpenses: localStorage.getItem("advisor_monthlyExpenses") ? Number(localStorage.getItem("advisor_monthlyExpenses")) : "",
    currentSavings: localStorage.getItem("advisor_currentSavings") ? Number(localStorage.getItem("advisor_currentSavings")) : "",
};

const advisorSlice = createSlice({
    name: "advisor",
    initialState,
    reducers: {
        setFinancialData: (state, action) => {
            const { monthlyIncome, monthlyExpenses, currentSavings } = action.payload;
            state.monthlyIncome = monthlyIncome;
            state.monthlyExpenses = monthlyExpenses;
            state.currentSavings = currentSavings;

            localStorage.setItem("advisor_monthlyIncome", monthlyIncome);
            localStorage.setItem("advisor_monthlyExpenses", monthlyExpenses);
            localStorage.setItem("advisor_currentSavings", currentSavings);
        },
        resetFinancialData: (state) => {
            state.monthlyIncome = "";
            state.monthlyExpenses = "";
            state.currentSavings = "";

            localStorage.removeItem("advisor_monthlyIncome");
            localStorage.removeItem("advisor_monthlyExpenses");
            localStorage.removeItem("advisor_currentSavings");
        },
    },
});

export const { setFinancialData, resetFinancialData } = advisorSlice.actions;
export default advisorSlice.reducer;
