import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../store.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { products, addToCart } = useStore();
  const p = products.find((x) => String(x.id) === String(id));
  const [qty, setQty] = useState(1);

  if (!p)
    return (
      <p className="text-neutral-500">
        Product not found. <Link to="/" className="text-amber-400 underline">Catalog</Link>
      </p>
    );

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <img
        src={p.image}
        alt=""
        className="w-full max-w-md rounded-xl border border-neutral-800 object-cover"
      />
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-neutral-100">{p.name}</h1>
        <p className="text-neutral-400">{p.description}</p>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-neutral-500">Brand</dt>
          <dd className="text-neutral-200">{p.brand}</dd>
          <dt className="text-neutral-500">Category</dt>
          <dd className="text-neutral-200">{p.category}</dd>
          <dt className="text-neutral-500">Model</dt>
          <dd className="text-neutral-200">{p.model}</dd>
          <dt className="text-neutral-500">Price</dt>
          <dd className="text-amber-400">${p.price}</dd>
          <dt className="text-neutral-500">In stock</dt>
          <dd className="text-neutral-200">{p.quantity}</dd>
        </dl>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-neutral-400">
            Qty
            <input
              type="number"
              min={1}
              max={p.quantity}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || 1)}
              className="w-20 rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              addToCart(p.id, qty);
              nav("/cart");
            }}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-amber-400"
          >
            Add to cart
          </button>
          <Link to="/" className="text-sm text-amber-400 underline">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
