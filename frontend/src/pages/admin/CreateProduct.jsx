import { useState } from "react"
import { Link } from "react-router-dom"
import { api } from "../../api.js"

const defaultProduct = {
  name: "",
  description: "",
  price: 0,
  category: "other",
  brand: "",
  model: "",
  image: "",
  stock: 0,
}

export default function CreateProduct() {
  const [product, setProduct] = useState(defaultProduct)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleChange = (key, value) => {
    setProduct((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage("")
    setError("")
    if (product.price < 0) {
      setError("Price cannot be negative.")
      return
    }

    if (product.stock < 0) {
      setError("Stock cannot be negative.")
      return
    }
    
    try {
      await api.post("/products/", {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
      })
      setMessage("Product created successfully.")
      setProduct(defaultProduct)
    } catch (err) {
      setError(err.message || "Failed to create product.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-100">
          Create Product
        </h1>
        <Link to="/admin" className="text-sm text-amber-400 underline">
          Back to Admin
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-neutral-300">
            Name
            <input
              value={product.name}
              onChange={(event) => handleChange("name", event.target.value)}
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-neutral-100"
            />
          </label>
          <label className="space-y-2 text-sm text-neutral-300">
            Category
            <select
              value={product.category}
              onChange={(event) => handleChange("category", event.target.value)}
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
          </label>
          <label className="space-y-2 text-sm text-neutral-300 md:col-span-2">
            Description
            <textarea
              value={product.description}
              onChange={(event) =>
                handleChange("description", event.target.value)
              }
              className="w-full min-h-[120px] rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-neutral-100"
            />
          </label>
          <label className="space-y-2 text-sm text-neutral-300">
            Price
            <input
              type="number"
              step="0.01"
              min="0"
              value={product.price}
              onChange={(event) => handleChange("price", event.target.value)}
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-neutral-100"
            />
          </label>
          <label className="space-y-2 text-sm text-neutral-300">
            Stock
            <input
              type="number"
              min="0"
              value={product.stock}
              onChange={(event) => handleChange("stock", event.target.value)}
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-neutral-100"
            />
          </label>
          <label className="space-y-2 text-sm text-neutral-300">
            Brand
            <input
              value={product.brand}
              onChange={(event) => handleChange("brand", event.target.value)}
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-neutral-100"
            />
          </label>
          <label className="space-y-2 text-sm text-neutral-300">
            Model
            <input
              value={product.model}
              onChange={(event) => handleChange("model", event.target.value)}
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-neutral-100"
            />
          </label>
          <label className="space-y-2 text-sm text-neutral-300 md:col-span-2">
            Image URL
            <input
              value={product.image}
              onChange={(event) => handleChange("image", event.target.value)}
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-neutral-100"
            />
          </label>
        </div>

        {message && <p className="text-sm text-emerald-400">{message}</p>}
        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-6 py-3 font-semibold text-neutral-950 transition hover:bg-amber-300"
        >
          Create Product
        </button>
      </form>
    </div>
  )
}
