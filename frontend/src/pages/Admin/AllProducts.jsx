import { Link } from "react-router-dom";
import moment from "moment";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";


const AllProducts = () => {
  const { data: products, isLoading, isError } = useAllProductsQuery();

  if (isLoading) {
    return (
      <div className="text-center py-16 text-[#285570] font-semibold text-xl">
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16 text-[#3CBEAC] font-semibold text-xl">
        Error loading products
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 xl:px-20 py-10 bg-[#FAF7F6] rounded-3xl shadow-xl min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 p-4">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h1 className="text-4xl font-extrabold text-[#285570]">All Products</h1>
            <span className="bg-[#3CBEAC] text-[#FAF7F6] text-base font-semibold px-5 py-2 rounded-full shadow-lg">
              {products.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/admin/product/update/${product._id}`}
                className="block rounded-2xl shadow-lg overflow-hidden transform transition hover:scale-105 hover:shadow-2xl bg-gradient-to-r from-[#FAF7F6] to-[#E3DED7]"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 sm:h-56 md:h-48 object-cover rounded-t-2xl"
                />
                <div className="p-5 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-[#333333]">
                      {product.name}
                    </h2>
                    <p className="text-[#3CBEAC] text-xs font-medium">
                      {moment(product.createdAt).format("MMMM Do YYYY")}
                    </p>
                  </div>
                  <p className="text-[#285570] text-sm mb-5 h-20 overflow-hidden">
                    {product.description?.substring(0, 100)}...
                  </p>
                  <div className="flex justify-between items-center flex-wrap gap-3">
                    <Link
                      to={`/admin/product/update/${product._id}`}
                      className="inline-flex items-center px-5 py-2 text-sm font-bold bg-gradient-to-r from-[#EFAF76] to-[#3CBEAC] text-[#285570] rounded-full shadow hover:from-[#3CBEAC] hover:to-[#285570] hover:text-white transition"
                    >
                      Update Product
                      <svg
                        className="w-4 h-4 ml-2"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 10"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M1 5h12m0 0L9 1m4 4L9 9"
                        />
                      </svg>
                    </Link>
                    <span className="font-semibold text-[#3CBEAC]">
                      $ {product.price?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="md:w-64 p-4 sticky top-16 h-fit bg-white rounded-xl shadow-lg">
         
        </aside>
      </div>
    </div>
  );
};

export default AllProducts;
