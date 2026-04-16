import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store.jsx";

export default function Shop() {
  const { products } = useStore();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [model, setModel] = useState("all");
  const [sort, setSort] = useState("name-asc");

  const categories = useMemo(
    () => ["all", ...new Set(products.map((p) => p.category))],
    [products]
  );
  const brands = useMemo(
    () => ["all", ...new Set(products.map((p) => p.brand))],
    [products]
  );
  const models = useMemo(
    () => ["all", ...new Set(products.map((p) => p.model).filter(Boolean))],
    [products]
  );

  const list = useMemo(() => {
    let rows = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (brand !== "all" && p.brand !== brand) return false;
      if (model !== "all" && p.model !== model) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return (
        p.name.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        p.model.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s)
      );
    });
    const [key, dir] = sort.split("-");
    rows = [...rows].sort((a, b) => {
      const av = key === "price" ? a.price : a.name.toLowerCase();
      const bv = key === "price" ? b.price : b.name.toLowerCase();
      const c = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === "asc" ? c : -c;
    });
    return rows;
  }, [products, q, category, brand, model, sort]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-100">Shop</h1>
      <div className="flex flex-wrap gap-3 text-sm">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search keyword…"
          className="min-w-48 flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder:text-neutral-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All categories" : c}
            </option>
          ))}
        </select>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
        >
          {brands.map((b) => (
            <option key={b} value={b}>
              {b === "all" ? "All brands" : b}
            </option>
          ))}
        </select>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
        >
          {models.map((m) => (
            <option key={m} value={m}>
              {m === "all" ? "All models" : m}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
        >
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <li
            key={p.id}
            className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60"
          >
            <Link to={`/product/${p.id}`} className="block">
              <div className="relative">
                <img
                  src={p.image}
                  alt=""
                  className={
                    "aspect-square w-full object-cover transition" +
                    (p.quantity === 0
                      ? " blur-sm grayscale opacity-60"
                      : "")
                  }
                />
                {p.quantity === 0 ? (
                  <span className="absolute top-2 left-2 rounded-full bg-neutral-800/90 px-2 py-0.5 text-xs font-medium text-neutral-300">
                    Sold Out
                  </span>
                ) : p.quantity < 5 ? (
                  <span className="absolute top-2 left-2 rounded-full bg-red-500/90 px-2 py-0.5 text-xs font-medium text-white">
                    Almost Sold Out: {p.quantity} Left
                  </span>
                ) : null}
              </div>
              <div className="space-y-1 p-4">
                <p className="font-medium text-neutral-100">{p.name}</p>
                <p className="text-xs text-neutral-500">
                  {p.brand} · {p.category}
                </p>
                <p className="text-sm text-amber-400">${p.price}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && (
        <p className="text-neutral-500">No products match these filters.</p>
      )}
    </div>
  );
}
