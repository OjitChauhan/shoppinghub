import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";
import { getSimilarProducts } from "../utils/recommendationEngine.js";

const addProduct = asyncHandler(async (req, res) => {
  try {
    const { name, description, price, category, quantity, brand } = req.fields;

    // Validation
    switch (true) {
      case !name:
        return res.json({ error: "Name is required" });
      case !brand:
        return res.json({ error: "Brand is required" });
      case !description:
        return res.json({ error: "Description is required" });
      case !price:
        return res.json({ error: "Price is required" });
      case !category:
        return res.json({ error: "Category is required" });
      case !quantity:
        return res.json({ error: "Quantity is required" });
    }

    const product = new Product({ ...req.fields });
    await product.save();
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const updateProductDetails = asyncHandler(async (req, res) => {
  try {
    const { name, description, price, category, quantity, brand } = req.fields;

    // Validation
    switch (true) {
      case !name:
        return res.json({ error: "Name is required" });
      case !brand:
        return res.json({ error: "Brand is required" });
      case !description:
        return res.json({ error: "Description is required" });
      case !price:
        return res.json({ error: "Price is required" });
      case !category:
        return res.json({ error: "Category is required" });
      case !quantity:
        return res.json({ error: "Quantity is required" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.fields },
      { new: true }
    );

    await product.save();

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const removeProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

const fetchProducts = asyncHandler(async (req, res) => {
  try {
    const pageSize = 6;

    const keyword = req.query.keyword
      ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
      : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword }).limit(pageSize);

    res.json({
      products,
      page: 1,
      pages: Math.ceil(count / pageSize),
      hasMore: false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const fetchProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (product) {
      return res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Product not found" });
  }
});

const fetchAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category")
      .limit(12)
      .sort({ createAt: -1 });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const addProductReview = asyncHandler(async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Product already reviewed");
      }

      const review = {
        name: req.user.username,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const fetchTopProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(4);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const fetchNewProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 }).limit(5);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const filterProducts = asyncHandler(async (req, res) => {
  try {
    const { checked, radio } = req.body;

    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };

    const products = await Product.find(args);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const fetchRelatedProducts = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category");

    if (product) {
      // Fetch all products for analysis
      // In a production app with millions of items, we would cache this or use a vector database
      const allProducts = await Product.find({}).populate("category");

      const related = getSimilarProducts(product, allProducts, 12);

      res.json(related);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const fetchRecommendations = asyncHandler(async (req, res) => {
  try {
    const { favorites = [], history = [], activity = [] } = req.body;

    // Combine all IDs into a single unique array and filter out nulls/falsy
    const allInteractionIds = [...new Set([...favorites, ...history, ...activity])].filter(Boolean);

    // Verify if we have any interactions to base recommendations on
    if (allInteractionIds.length === 0) {
      // Fallback: Return top rated products if no history
      const products = await Product.find({}).sort({ rating: -1 }).limit(10);
      return res.json(products);
    }

    // 1. Fetch full Product objects for the user's interaction history
    const interactionProducts = await Product.find({ _id: { $in: allInteractionIds } }).populate("category");

    if (interactionProducts.length === 0) {
      const products = await Product.find({}).sort({ rating: -1 }).limit(10);
      return res.json(products);
    }

    // 2. Create a "User Profile" (Combined Text) from their combined history
    const profileName = "User Profile";
    const profileDescription = interactionProducts.map(p => `${p.name} ${p.description} ${p.brand}`).join(" ");
    const profileCategory = { name: interactionProducts.map(p => p.category?.name).join(" ") };

    // Calculate average price to use for price proximity scoring
    const validPrices = interactionProducts.map(p => p.price).filter(p => p && p > 0);
    const profilePrice = validPrices.length > 0 ? (validPrices.reduce((a, b) => a + b, 0) / validPrices.length) : 0;

    const userProfile = {
      _id: "user-profile", // Virtual ID
      name: profileName,
      description: profileDescription,
      brand: "",
      category: profileCategory,
      price: profilePrice
    };

    // 3. Fetch Candidate Products (All active products)
    // Exclude the items they've already interacted with heavily to prioritize discovery, 
    // or we can allow recommending similar items. Let's exclude their exact interactions so they see new stuff.
    const allProducts = await Product.find({ _id: { $nin: allInteractionIds } }).populate("category");

    // 4. Get Matches
    const recommendations = getSimilarProducts(userProfile, allProducts, 10);

    // 5. If recommendations are fewer than expected, pad with top products
    if (recommendations.length < 5) {
      const topProducts = await Product.find({ _id: { $nin: allInteractionIds } }).sort({ rating: -1 }).limit(10 - recommendations.length);
      // Ensure we don't duplicate
      const recommendationIds = new Set(recommendations.map(r => r._id.toString()));
      const newAdditions = topProducts.filter(r => !recommendationIds.has(r._id.toString()));
      res.json([...recommendations, ...newAdditions]);
    } else {
      res.json(recommendations);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const compareProducts = asyncHandler(async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Product IDs are required" });
    }
    const products = await Product.find({ _id: { $in: ids } }).populate("category");
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

export {
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
};
