const CategoryForm = ({
  value,
  setValue,
  handleSubmit,
  buttonText = "Submit",
  handleDelete,
}) => {
  return (
    <div className="p-4 bg-[#FAF7F6] rounded-lg shadow-lg max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          className="py-3 px-4 w-full rounded-lg border border-[#3CBEAC] text-[#285570] font-semibold placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#285570] transition"
          placeholder="Write category name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          required
        />

        <div className="flex justify-between gap-4">
          <button
            type="submit"
            className="flex-1 bg-[#3CBEAC] hover:bg-[#285570] text-white py-3 rounded-lg font-bold shadow transition"
          >
            {buttonText}
          </button>

          {handleDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-bold shadow transition"
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
