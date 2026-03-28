import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import AdminMenu from "./AdminMenu";

const ProductUpdate = () => {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState(0);

  const navigate = useNavigate();

  const [uploadProductImage] = useUploadProductImageMutation();
  const [createProduct] = useCreateProductMutation();
  const { data: categories } = useFetchCategoriesQuery();

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setImage(file);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImageUrl(res.image);
    } catch (error) {
      toast.error(error?.data?.message || "Image upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageUrl) {
      toast.error("Please upload an image before submitting");
      return;
    }

    try {
      const productData = {
        name,
        description,
        price,
        category,
        quantity,
        brand,
        countInStock: stock,
        image: imageUrl,
      };

      const res = await createProduct(productData).unwrap();
      toast.success(`${res.name} created successfully`);
      navigate("/");
    } catch (error) {
      toast.error("Product creation failed");
    }
  };

  return (
    <div className="container xl:mx-[9rem] sm:mx-[0] bg-[#fff7fb] dark:bg-[#0A0A0B] min-h-screen rounded-[2rem] transition-colors">
      <div className="flex flex-col md:flex-row">
        <AdminMenu />
        <div className="md:w-3/4 p-3">
          <div className="h-12 text-xl font-bold text-zinc-900 dark:text-white">Create Product</div>

          {imageUrl && (
            <div className="text-center">
              <img
                src={imageUrl}
                alt="product"
                className="block mx-auto max-h-[200px]"
              />
            </div>
          )}

          <div className="mb-3">
            <label className="border border-pink-300 dark:border-pink-500/30 text-zinc-800 dark:text-white px-4 block w-full text-center rounded-lg cursor-pointer font-bold py-11 bg-white/70 dark:bg-white/5">
              {image ? image.name : "Upload Image"}
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={uploadFileHandler}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-3">
            <div className="flex flex-wrap">
              <div>
                <label className="text-zinc-700 dark:text-zinc-300">Name</label>
                <input
                  type="text"
                  className="p-4 mb-3 w-[30rem] border border-pink-100 dark:border-pink-500/20 rounded-lg bg-white dark:bg-[#151518] text-zinc-900 dark:text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="ml-10">
                <label className="text-zinc-700 dark:text-zinc-300">Price</label>
                <input
                  type="number"
                  className="p-4 mb-3 w-[30rem] border border-pink-100 dark:border-pink-500/20 rounded-lg bg-white dark:bg-[#151518] text-zinc-900 dark:text-white"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap">
              <div>
                <label className="text-zinc-700 dark:text-zinc-300">Quantity</label>
                <input
                  type="number"
                  className="p-4 mb-3 w-[30rem] border border-pink-100 dark:border-pink-500/20 rounded-lg bg-white dark:bg-[#151518] text-zinc-900 dark:text-white"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="ml-10">
                <label className="text-zinc-700 dark:text-zinc-300">Brand</label>
                <input
                  type="text"
                  className="p-4 mb-3 w-[30rem] border border-pink-100 dark:border-pink-500/20 rounded-lg bg-white dark:bg-[#151518] text-zinc-900 dark:text-white"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
            </div>

            <label className="text-zinc-700 dark:text-zinc-300">Description</label>
            <textarea
              className="p-2 mb-3 bg-white dark:bg-[#151518] border border-pink-100 dark:border-pink-500/20 rounded-lg w-[95%] text-zinc-900 dark:text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>

            <div className="flex justify-between">
              <div>
                <label className="text-zinc-700 dark:text-zinc-300">Count In Stock</label>
                <input
                  type="number"
                  className="p-4 mb-3 w-[30rem] border border-pink-100 dark:border-pink-500/20 rounded-lg bg-white dark:bg-[#151518] text-zinc-900 dark:text-white"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>

              <div>
                <label className="text-zinc-700 dark:text-zinc-300">Category</label>
                <select
                  value={category}
                  className="p-4 mb-3 w-[30rem] border border-pink-100 dark:border-pink-500/20 rounded-lg bg-white dark:bg-[#151518] text-zinc-900 dark:text-white"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Choose Category</option>
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="py-4 px-10 mt-5 rounded-lg text-lg font-bold bg-pink-500 hover:bg-pink-600 text-white transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductUpdate;
