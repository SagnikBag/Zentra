import { createBrowserRouter } from "react-router";

import { Register } from "../features/auth/pages/Register";
import { Login } from "../features/auth/pages/Login";

import { CreateProduct } from "../features/products/pages/CreateProduct";
import { Dashboard } from "../features/products/pages/Dashboard";
import Home from "../features/products/pages/Home";
import ProductDetail from "../features/products/pages/ProductDetail";
import SellerProductDetails from "../features/products/pages/SellerProductDetails";

import Cart from "../features/cart/pages/Cart";

import Protected from "../features/auth/components/Protected";
import AppLayout from "./AppLayout";

export const routes = createBrowserRouter([
    {
        path: "/register",
        element: <Register />
    },

    {
        path: "/login",
        element: <Login />
    },

    {
        element: <AppLayout />,
        children: [
            // =========================
            // PUBLIC ROUTES
            // =========================

            {
                path: "/",
                element: <Home />
            },

            {
                path: "/product/:productId",
                element: <ProductDetail />
            },

            // =========================
            // AUTHENTICATED ROUTES
            // =========================

            {
                element: <Protected />,
                children: [
                    {
                        path: "/cart",
                        element: <Cart />
                    }
                ]
            },

            // =========================
            // SELLER ONLY ROUTES
            // =========================

            {
                element: <Protected role="seller" />,
                children: [
                    {
                        path: "/seller/create-product",
                        element: <CreateProduct />
                    },

                    {
                        path: "/seller/dashboard",
                        element: <Dashboard />
                    },

                    {
                        path: "/seller/product/:productId",
                        element: <SellerProductDetails />
                    }
                ]
            }
        ]
    }
]);