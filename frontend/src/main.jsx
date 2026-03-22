import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./redux/store";
import { Route, RouterProvider, createRoutesFromElements } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import VirtualTryOn from "./pages/Products/VirtualTryOn";
import UserOrders from "./pages/User/UserOrder";

import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./pages/Admin/AdminRoute";

// Auth
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// User
import Profile from "./pages/User/Profile";

// Admin
import UserList from "./pages/Admin/UserList";
import CategoryList from "./pages/Admin/CategoryList";
import ProductList from "./pages/Admin/ProductList";
import AllProducts from "./pages/Admin/AllProducts";
import ProductUpdate from "./pages/Admin/ProductUpdate";
import OrderList from "./pages/Admin/OrderList";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";

// Products
import Home from "./pages/Home.jsx";
import Favorites from "./pages/Products/Favorites.jsx";
import ProductDetails from "./pages/Products/ProductDetails.jsx";

// Shop
import Cart from "./pages/Cart.jsx";
import Shop from "./pages/Shop.jsx";
import CompareProducts from "./pages/Products/CompareProducts.jsx";
import PurposeShopping from "./pages/Products/PurposeShopping.jsx";
import AIComparator from "./pages/Products/AIComparator.jsx";
import VirtualTryOnBody from "./pages/Products/VirtualTryOnBody.jsx";
import VirtualTryOnHub  from "./pages/Products/VirtualTryOnHub.jsx";

// Orders
import Shipping from "./pages/Orders/Shipping.jsx";
import PlaceOrder from "./pages/Orders/PlaceOrder.jsx";
import Order from "./pages/Orders/Order.jsx";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>

      {/* ---------- PUBLIC ROUTES ---------- */}
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="favorite" element={<Favorites />} />
      <Route path="favorites" element={<Favorites />} />
      <Route path="product/:id" element={<ProductDetails />} />
      <Route path="cart" element={<Cart />} />
      <Route path="shop" element={<Shop />} />
      <Route path="compare" element={<CompareProducts />} />
      <Route path="purpose-shopping" element={<PurposeShopping />} />
      <Route path="ai-comparator" element={<AIComparator />} />
      <Route path="user-orders" element={<UserOrders />} />

      {/* ✅ Public Virtual Try-On Routes */}
      <Route path="virtual-tryon/:_id"        element={<VirtualTryOn />} />
      <Route path="virtual-tryon-body/:_id"   element={<VirtualTryOnBody />} />
      <Route path="virtual-tryon-hub"          element={<VirtualTryOnHub />} />

      {/* ---------- PRIVATE ROUTES ---------- */}
      <Route element={<PrivateRoute />}>
        <Route path="profile" element={<Profile />} />
        <Route path="shipping" element={<Shipping />} />
        <Route path="placeorder" element={<PlaceOrder />} />
        <Route path="order/:id" element={<Order />} />
      </Route>

      {/* ---------- ADMIN ROUTES ---------- */}
      <Route path="admin" element={<AdminRoute />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="userlist" element={<UserList />} />
        <Route path="categorylist" element={<CategoryList />} />
        <Route path="productlist" element={<ProductList />} />
        <Route path="productlist/:pageNumber" element={<ProductList />} />
        <Route path="allproductslist" element={<AllProducts />} />
        <Route path="product/update/:_id" element={<ProductUpdate />} />
        <Route path="orderlist" element={<OrderList />} />

        {/* ✅ Admin Virtual Try-On */}
        <Route path="virtual-tryon/:_id" element={<VirtualTryOn />} />
      </Route>

    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PayPalScriptProvider options={{ "client-id": "test" }}>
      <RouterProvider router={router} />
    </PayPalScriptProvider>
  </Provider>
);
