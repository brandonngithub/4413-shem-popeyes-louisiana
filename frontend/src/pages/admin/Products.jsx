import { useState } from "react"
import { Link } from "react-router-dom"
import { api, errMsg } from "../../api.js"
import { useStore } from "../../store.jsx"

export default function Products() {
  const { products, refreshProducts } = useStore()
  const [editingProduct, setEditingProduct] = useState(null)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
    category: "",
  })
  const [error, setError] = useState("")

  const handleEditProduct = (product) => {
    setEditingProduct(product.id)
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.quantity.toString(),
      image: product.image,
      category: product.category,
    })
  }

  const handleDeleteProduct = async () => {
    if (!editingProduct) return
    try {
      await api.delete(`/products/${editingProduct}`)
      await refreshProducts()
      setEditingProduct(null)
    } catch (e) {
      setError(errMsg(e, "Failed to delete product."))
    }
  }

  const handleSaveProduct = async () => {
    if (!editingProduct) return
    setError("")
    const base = products.find((p) => p.id === editingProduct)
    if (!base) return
    try {
      await api.put(`/products/${editingProduct}`, {
        name: editForm.name,
        description: editForm.description,
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock, 10),
        image: editForm.image,
        category: editForm.category,
        brand: base.brand,
        model: base.model,
      })
      await refreshProducts()
      setEditingProduct(null)
    } catch (e) {
      setError(errMsg(e, "Failed to update product."))
    }
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
    setEditForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      image: "",
      category: "",
    })
  }

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-100">Products</h1>
        <Link
          to="/admin/create-product"
          className="text-sm text-amber-400 underline"
        >
          Create New Product
        </Link>
      </div>

      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
        {error && <p className="mb-3 text-sm text-rose-400">{error}</p>}
        {products.length === 0 ? (
          <p className="text-neutral-500">No products available yet.</p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
              >
                {editingProduct === product.id ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm text-neutral-300">Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-neutral-300">
                          Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editForm.price}
                          onChange={(e) =>
                            handleInputChange("price", e.target.value)
                          }
                          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-neutral-300">
                          Stock
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.stock}
                          onChange={(e) =>
                            handleInputChange("stock", e.target.value)
                          }
                          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-neutral-300">
                          Image URL
                        </label>
                        <input
                          type="url"
                          value={editForm.image}
                          onChange={(e) =>
                            handleInputChange("image", e.target.value)
                          }
                          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-neutral-300">
                          Category
                        </label>
                        <select
                          value={editForm.category}
                          onChange={(event) => handleInputChange("category", event.target.value)}
                          className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-neutral-100"
                        >
                          <option value="electronic">Electronic</option>
                          <option value="accessory">Accessory</option>
                          <option value="book">Book</option>
                          <option value="other">Other</option>
                          <option value="food">Food</option>
                          <option value="beverage">Beverage</option>
                          <option value="clothing">Clothing</option>
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm text-neutral-300">
                          Description
                        </label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                          rows={3}
                          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <button
                        onClick={handleDeleteProduct}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Delete Product
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveProduct}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="rounded-lg bg-neutral-600 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt=""
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-neutral-100">
                          {product.name}
                        </h3>
                        <p className="text-sm text-neutral-400">
                          {product.category}
                        </p>
                        <p className="text-sm text-amber-400">
                          ${product.price}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-neutral-500">Stock: </span>
                        <span
                          className={
                            product.quantity === 0
                              ? "text-red-400"
                              : "text-neutral-200"
                          }
                        >
                          {product.quantity}
                        </span>
                      </div>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="rounded-lg bg-amber-600 px-3 py-1 text-sm font-medium text-white hover:bg-amber-500"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Link to="/admin" className="text-sm text-amber-400 underline">
        Back to Admin
      </Link>
    </div>
  )
}
