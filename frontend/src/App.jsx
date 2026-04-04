import { Link, Outlet, Route, Routes } from "react-router-dom"
import { useStore } from "./store.jsx"
import Account from "./pages/Account.jsx"
import Admin from "./pages/admin/Admin.jsx"
import Users from "./pages/admin/Users.jsx"
import Orders from "./pages/admin/Orders.jsx"
import CreateProduct from "./pages/admin/CreateProduct.jsx"
import Catalog from "./pages/Catalog.jsx"
import Cart from "./pages/Cart.jsx"
import Checkout from "./pages/Checkout.jsx"
import ProductDetail from "./pages/ProductDetail.jsx"
import { Login, Register } from "./pages/Auth.jsx"

function Layout() {
  const { user, cart, logout } = useStore()
  const count = cart.reduce((s, l) => s + l.qty, 0)

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <header className="border-b border-neutral-800 bg-neutral-900/80">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 text-sm">
          <Link to="/" className="font-semibold text-amber-400">
            E-Store
          </Link>
          <Link to="/" className="hover:text-neutral-50">
            Catalog
          </Link>
          <Link to="/cart" className="hover:text-neutral-50">
            Cart{count > 0 ? ` (${count})` : ""}
          </Link>
          {user ? (
            <>
              <Link to="/account" className="hover:text-neutral-50">
                Account
              </Link>
              {user.role === "admin" && (
                <Link to="/admin" className="hover:text-neutral-50">
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={() => logout()}
                className="ml-auto text-amber-400/90 hover:text-amber-300"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="ml-auto hover:text-neutral-50">
                Sign in
              </Link>
              <Link to="/register" className="hover:text-neutral-50">
                Register
              </Link>
            </>
          )}
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
        <Route index element={<Catalog />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="account" element={<Account />} />
        <Route path="admin" element={<Admin />} />
        <Route path="admin/users" element={<Users />} />
        <Route path="admin/orders" element={<Orders />} />
        <Route path="admin/create-product" element={<CreateProduct />} />
      </Route>
    </Routes>
  )
}
