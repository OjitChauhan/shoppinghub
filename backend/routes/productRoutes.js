import express from "express";
import formidable from "express-formidable";
const router = express.Router();

// controllers
import {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  fetchAllProducts,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  filterProducts,
  fetchRelatedProducts,
  fetchRecommendations,
  compareProducts,
} from "../controllers/productController.js";
import {
  getAISimilarProducts,
  getAIFeatureAnalysis,
} from "../controllers/aiComparatorController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import checkId from "../middlewares/checkId.js";

router
  .route("/")
  .get(fetchProducts)
  .post(authenticate, authorizeAdmin, formidable(), addProduct);

router.route("/allproducts").get(fetchAllProducts);
router.route("/:id/reviews").post(authenticate, checkId, addProductReview);

router.get("/top", fetchTopProducts);
router.get("/new", fetchNewProducts);
router.get("/:id/related", fetchRelatedProducts);
router.post("/recommendations", fetchRecommendations);
router.post("/compare", compareProducts);
router.get("/:id/ai-similar", getAISimilarProducts);
router.post("/ai-feature-analysis", getAIFeatureAnalysis);

router
  .route("/:id")
  .get(fetchProductById)
  .put(authenticate, authorizeAdmin, formidable(), updateProductDetails)
  .delete(authenticate, authorizeAdmin, removeProduct);

router.route("/filtered-products").post(filterProducts);

export default router;
