import { useState } from "react";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoriesQuery,
} from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import CategoryForm from "../../components/CategoryForm";
import Modal from "../../components/Modal";

const CategoryList = () => {
  const { data: categories } = useFetchCategoriesQuery();
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updatingName, setUpdatingName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Category name is required"); return; }
    try {
      const result = await createCategory({ name }).unwrap();
      if (result.error) toast.error(result.error);
      else { setName(""); toast.success(`${result.name} created successfully.`); }
    } catch { toast.error("Creating category failed, please try again."); }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!updatingName.trim()) { toast.error("Category name is required"); return; }
    try {
      const result = await updateCategory({
        categoryId: selectedCategory._id,
        updatedCategory: { name: updatingName },
      }).unwrap();
      if (result.error) toast.error(result.error);
      else { toast.success(`${result.name} updated.`); setSelectedCategory(null); setUpdatingName(""); setModalVisible(false); }
    } catch { toast.error("Update failed, please try again."); }
  };

  const handleDeleteCategory = async () => {
    try {
      const result = await deleteCategory(selectedCategory._id).unwrap();
      if (result.error) toast.error(result.error);
      else { toast.success(`${result.name} deleted.`); setSelectedCategory(null); setModalVisible(false); }
    } catch { toast.error("Delete failed, please try again."); }
  };

  return (
    <div className="min-h-screen bg-[#fff7fb] dark:bg-[#0A0A0B] transition-colors px-4 sm:px-8 py-8 rounded-[2rem]">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-black text-gray-900 dark:text-white">
            Manage <span className="text-pink-500">Categories</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Create, update or delete product categories</p>
        </div>

        {/* Create form card */}
        <div className="rounded-2xl p-6 mb-8
          bg-white dark:bg-[#151518]
          border border-black/6 dark:border-white/8
          shadow-card-light dark:shadow-card-dark">
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">Add New Category</h2>
          <CategoryForm
            value={name}
            setValue={setName}
            handleSubmit={handleCreateCategory}
            buttonText="Create Category"
            inputClassName="w-full px-4 py-3 rounded-xl text-sm outline-none
              bg-gray-50 dark:bg-[#05091A]
              border border-gray-200 dark:border-white/10
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-slate-500
              focus:border-pink-500 dark:focus:border-pink-500
              focus:ring-2 focus:ring-pink-500/20 transition-all"
            buttonClassName="mt-3 px-6 py-3 rounded-xl text-sm font-black text-white
              bg-pink-500 hover:bg-pink-600
              shadow-lg shadow-pink-500/25
              transition-all hover:scale-[1.02] active:scale-[0.98]"
          />
        </div>

        {/* Category chips */}
        <div className="rounded-2xl p-6
          bg-white dark:bg-[#151518]
          border border-black/6 dark:border-white/8
          shadow-card-light dark:shadow-card-dark">
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-5">All Categories</h2>
          <div className="flex flex-wrap gap-3">
            {categories?.map((category) => (
              <button
                key={category._id}
                onClick={() => { setModalVisible(true); setSelectedCategory(category); setUpdatingName(category.name); }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold
                  bg-gray-100 dark:bg-white/8
                  text-gray-700 dark:text-slate-200
                  border border-gray-200 dark:border-white/10
                  hover:bg-pink-50 dark:hover:bg-pink-500/15
                  hover:text-pink-600 dark:hover:text-pink-400
                  hover:border-pink-300 dark:hover:border-pink-500/40
                  transition-all hover:scale-105 active:scale-95">
                {category.name}
              </button>
            ))}
            {(!categories || categories.length === 0) && (
              <p className="text-sm text-gray-400 dark:text-slate-500">No categories yet. Create one above.</p>
            )}
          </div>
        </div>

        {/* Edit/Delete modal */}
        <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
          <div className="p-6">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-5">Edit Category</h3>
            <CategoryForm
              value={updatingName}
              setValue={setUpdatingName}
              handleSubmit={handleUpdateCategory}
              buttonText="Update"
              handleDelete={handleDeleteCategory}
              inputClassName="w-full px-4 py-3 rounded-xl text-sm outline-none
                bg-gray-50 dark:bg-[#05091A]
                border border-gray-200 dark:border-white/10
                text-gray-900 dark:text-white
                focus:border-pink-500 dark:focus:border-pink-500
                focus:ring-2 focus:ring-pink-500/20 transition-all"
              buttonClassName="w-full mt-2 px-6 py-3 rounded-xl text-sm font-black text-white
                bg-pink-500 hover:bg-pink-600
                shadow-lg shadow-pink-500/25 transition-all"
              deleteButtonClassName="w-full mt-3 px-6 py-3 rounded-xl text-sm font-black text-white
                bg-red-500 hover:bg-red-600
                shadow-lg shadow-red-500/25 transition-all"
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CategoryList;
