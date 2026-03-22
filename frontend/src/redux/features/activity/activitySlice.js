import { createSlice } from "@reduxjs/toolkit";

const getViewedProductsFromLocalStorage = () => {
    const viewedProductsJSON = localStorage.getItem("viewedProducts");
    if (viewedProductsJSON) {
        return JSON.parse(viewedProductsJSON);
    }
    return [];
};

const initialState = {
    viewedProducts: getViewedProductsFromLocalStorage(),
};

const activitySlice = createSlice({
    name: "activity",
    initialState,
    reducers: {
        addViewedProduct: (state, action) => {
            const productId = action.payload;

            // Remove it if it already exists so we can push it to the front
            state.viewedProducts = state.viewedProducts.filter((id) => id !== productId);

            // Add to the front of the array
            state.viewedProducts.unshift(productId);

            // Keep only the last 10 viewed items
            if (state.viewedProducts.length > 10) {
                state.viewedProducts.pop();
            }

            localStorage.setItem("viewedProducts", JSON.stringify(state.viewedProducts));
        },
        clearViewedProducts: (state) => {
            state.viewedProducts = [];
            localStorage.removeItem("viewedProducts");
        },
    },
});

export const { addViewedProduct, clearViewedProducts } = activitySlice.actions;
export default activitySlice.reducer;
