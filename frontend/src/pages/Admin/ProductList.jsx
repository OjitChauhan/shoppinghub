import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";

const ProductList = () => {
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  const [uploadProductImage] = useUploadProductImageMutation();
  const [createProduct] = useCreateProductMutation();
  const { data: categories } = useFetchCategoriesQuery();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = new FormData();
      productData.append("image", image);
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", price);
      productData.append("category", category);
      productData.append("quantity", quantity);
      productData.append("brand", brand);
      productData.append("countInStock", stock);

      const { data } = await createProduct(productData);

      if (data.error) {
        toast.error("Product create failed. Try Again.");
      } else {
        toast.success(`${data.name} is created`);
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Product create failed. Try Again.");
    }
  };

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);
      setImageUrl(res.image);
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff7fb] dark:bg-[#0A0A0B] p-4 transition-colors">
      <div className="w-full max-w-lg bg-white dark:bg-[#151518] rounded-xl shadow-2xl overflow-hidden border border-pink-100 dark:border-pink-500/20">
        {imageUrl && (
          <div className="w-full h-40 sm:h-60 bg-gray-100 dark:bg-[#0A0A0B] flex items-center justify-center overflow-hidden">
            <img
              src={imageUrl}
              alt="product"
              className="object-contain h-full w-full"
            />
          </div>
        )}
        <form className="p-6 space-y-5" onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 text-center">
            Product Registration
          </h2>

          {/* Upload */}
          <label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-pink-400 rounded-md py-6 transition hover:border-pink-600 text-center">
            <span className="font-semibold text-pink-500 mb-2 text-sm">
              {image ? image.name : "Upload Product Image"}
            </span>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={uploadFileHandler}
              className="hidden"
            />
          </label>

          {/* Name & Brand */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Name
              </label>
              <input
                type="text"
                className="w-full border-b border-pink-100 dark:border-pink-500/20 py-2 outline-none focus:border-pink-500 text-zinc-800 dark:text-zinc-100 bg-transparent text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Brand
              </label>
              <input
                type="text"
                className="w-full border-b border-pink-100 dark:border-pink-500/20 py-2 outline-none focus:border-pink-500 text-zinc-800 dark:text-zinc-100 bg-transparent text-sm"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Price & Quantity */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Price
              </label>
              <input
                type="number"
                className="w-full border-b border-pink-100 dark:border-pink-500/20 py-2 outline-none focus:border-pink-500 text-zinc-800 dark:text-zinc-100 bg-transparent text-sm"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Quantity
              </label>
              <input
                type="number"
                className="w-full border-b border-pink-100 dark:border-pink-500/20 py-2 outline-none focus:border-pink-500 text-zinc-800 dark:text-zinc-100 bg-transparent text-sm"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Count In Stock & Category */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Count In Stock
              </label>
              <input
                type="number"
                className="w-full border-b border-pink-100 dark:border-pink-500/20 py-2 outline-none focus:border-pink-500 text-zinc-800 dark:text-zinc-100 bg-transparent text-sm"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Category
              </label>
              <select
                className="w-full border-b border-pink-100 dark:border-pink-500/20 py-2 pr-2 outline-none focus:border-pink-500 text-zinc-800 dark:text-zinc-100 bg-transparent text-sm"
                onChange={(e) => setCategory(e.target.value)}
                required
                value={category}
              >
                <option value="">Select Category</option>
                {categories?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Description
            </label>
            <textarea
              className="w-full border-b border-pink-100 dark:border-pink-500/20 py-2 outline-none focus:border-pink-500 text-zinc-800 dark:text-zinc-100 bg-transparent text-sm resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white text-base font-bold py-2 rounded-lg mt-2 transition shadow"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductList;

