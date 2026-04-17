import { useEffect, useState } from "react"
import { IoPersonCircleOutline } from "react-icons/io5";
import { Link, Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom"
import { useStore } from "./store.jsx"
import Account from "./pages/Account.jsx"
import Admin from "./pages/admin/Admin.jsx"
import Users from "./pages/admin/Users.jsx"
import AdminOrders from "./pages/admin/Orders.jsx"
import Products from "./pages/admin/Products.jsx"
import CreateProduct from "./pages/admin/CreateProduct.jsx"
import Orders from "./pages/Orders.jsx"
import Shop from "./pages/Shop.jsx"
import Cart from "./pages/Cart.jsx"
import Checkout from "./pages/Checkout.jsx"
import ProductDetail from "./pages/ProductDetail.jsx"
import { Login, Register } from "./pages/Auth.jsx"

function AdminRoute({ children }) {
  const { user } = useStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== "admin") return <Navigate to="/" replace />
  return children
}

function Layout() {
  const { user, cart, logout } = useStore()
  const count = cart.reduce((s, l) => s + l.qty, 0)
  const nav = useNavigate()
  const [loggedOutToast, setLoggedOutToast] = useState(false)

  useEffect(() => {
    if (!loggedOutToast) return
    const t = setTimeout(() => setLoggedOutToast(false), 3000)
    return () => clearTimeout(t)
  }, [loggedOutToast])

  const handleLogout = () => {
    logout()
    setLoggedOutToast(true)
    nav("/")
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      {loggedOutToast && (
        <div
          role="status"
          className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-emerald-800 bg-emerald-950/90 px-4 py-2 text-sm text-emerald-200 shadow-lg"
        >
          Signed out successfully.
          <button
            type="button"
            onClick={() => setLoggedOutToast(false)}
            className="ml-3 text-emerald-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}
      <header className="border-b border-neutral-800 bg-neutral-900/80">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 text-sm">
          <span className="flex items-center gap-2 font-semibold text-amber-400">
            <img
              src="/shem.png"
              alt="Shem"
              className="h-7 w-7 rounded-full object-cover ring-1 ring-amber-500/40"
            />
            Shem Store
          </span>
          <Link to="/" className="hover:text-neutral-50">
            Home
          </Link>
          <Link to="/cart" className="hover:text-neutral-50">
            Cart{count > 0 ? ` (${count})` : ""}
          </Link>
          {user && (
            <>
              <Link to="/orders" className="hover:text-neutral-50">
                Orders
              </Link>
              <Link to="/account" className="hover:text-neutral-50">
                Account
              </Link>
              {user.role === "admin" && (
                <Link to="/admin" className="hover:text-neutral-50">
                  Admin
                </Link>
              )}
            </>
          )}
          <div className="ml-auto flex items-center gap-4">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="text-amber-400/90 hover:text-amber-300"
              >
                Sign out
              </button>
            ) : (
              <>
                <Link to="/login" className="hover:text-neutral-50">
                  Sign in
                </Link>
                <Link to="/register" className="hover:text-neutral-50">
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Shop />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="account" element={<Account />} />
        <Route path="orders" element={<Orders />} />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route
          path="admin/products"
          element={
            <AdminRoute>
              <Products />
            </AdminRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          }
        />
        <Route
          path="admin/orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />
        <Route
          path="admin/create-product"
          element={
            <AdminRoute>
              <CreateProduct />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  )
}
