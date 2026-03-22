import { PRODUCT_URL, UPLOAD_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ keyword }) => ({
        url: `${PRODUCT_URL}`,
        params: { keyword },
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Products"],
    }),

    getProductById: builder.query({
      query: (productId) => `${PRODUCT_URL}/${productId}`,
      providesTags: (result, error, productId) => [
        { type: "Product", id: productId },
      ],
    }),

    allProducts: builder.query({
      query: () => `${PRODUCT_URL}/allProducts`,
    }),

    getProductDetails: builder.query({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
      }),
      keepUnusedDataFor: 5,
    }),

    createProduct: builder.mutation({
      query: (productData) => ({
        url: `${PRODUCT_URL}`,
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation({
      query: ({ productId, formData }) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: "PUT",
        body: formData,
      }),
    }),

    uploadProductImage: builder.mutation({
      query: (data) => ({
        url: `${UPLOAD_URL}`,
        method: "POST",
        body: data,
      }),
    }),

    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: "DELETE",
      }),
      providesTags: ["Product"],
    }),

    createReview: builder.mutation({
      query: (data) => ({
        url: `${PRODUCT_URL}/${data.productId}/reviews`,
        method: "POST",
        body: data,
      }),
    }),

    getTopProducts: builder.query({
      query: () => `${PRODUCT_URL}/top`,
      keepUnusedDataFor: 5,
    }),

    getNewProducts: builder.query({
      query: () => `${PRODUCT_URL}/new`,
      keepUnusedDataFor: 5,
    }),

    getFilteredProducts: builder.query({
      query: ({ checked, radio }) => ({
        url: `${PRODUCT_URL}/filtered-products`,
        method: "POST",
        body: { checked, radio },
      }),
    }),

    getRelatedProducts: builder.query({
      query: (id) => `${PRODUCT_URL}/${id}/related`,
      keepUnusedDataFor: 5,
    }),

    getRecommendations: builder.query({
      query: (data) => ({
        url: `${PRODUCT_URL}/recommendations`,
        method: "POST",
        body: data,
      }),
      keepUnusedDataFor: 5,
    }),

    compareProducts: builder.query({
      query: (ids) => ({
        url: `${PRODUCT_URL}/compare`,
        method: "POST",
        body: { ids },
      }),
      keepUnusedDataFor: 5,
    }),

    getAISimilar: builder.query({
      query: ({ productId, limit = 8 }) =>
        `${PRODUCT_URL}/${productId}/ai-similar?limit=${limit}`,
      keepUnusedDataFor: 30,
    }),

    getAIFeatureAnalysis: builder.query({
      query: (ids) => ({
        url: `${PRODUCT_URL}/ai-feature-analysis`,
        method: "POST",
        body: { ids },
      }),
      keepUnusedDataFor: 30,
    }),
  }),
});

export const {
  useGetProductByIdQuery,
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useAllProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateReviewMutation,
  useGetTopProductsQuery,
  useGetNewProductsQuery,
  useUploadProductImageMutation,
  useGetFilteredProductsQuery,
  useGetRelatedProductsQuery,
  useGetRecommendationsQuery,
  useCompareProductsQuery,
  useGetAISimilarQuery,
  useGetAIFeatureAnalysisQuery,
} = productApiSlice;
