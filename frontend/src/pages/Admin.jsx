import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useStore } from "../store.jsx";

export default function Admin() {
  const { user, orders, products, users, adminSetStock, adminAddProduct, adminUpdateUser } =
    useStore();
  const [cust, setCust] = useState("all");
  const [pid, setPid] = useState("all");
  const [d0, setD0] = useState("");
  const [d1, setD1] = useState("");

  const [newP, setNewP] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    model: "",
    price: "",
    quantity: "",
    image: "https://picsum.photos/seed/new/320/320",
  });

  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (cust !== "all" && String(o.userId) !== cust) return false;
      if (pid !== "all" && !o.lines.some((l) => l.itemId === pid)) return false;
      if (d0 && o.date < d0) return false;
      if (d1 && o.date > d1) return false;
      return true;
    });
  }, [orders, cust, pid, d0, d1]);

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold text-neutral-100">Admin</h1>

      <section className="space-y-3">
        <h2 className="text-lg text-neutral-300">Sales</h2>
        <div className="flex flex-wrap gap-2 text-xs">
          <select
            value={cust}
            onChange={(e) => setCust(e.target.value)}
            className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100"
          >
            <option value="all">All customers</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </select>
          <select
            value={pid}
            onChange={(e) => setPid(e.target.value)}
            className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100"
          >
            <option value="all">All products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input type="date" value={d0} onChange={(e) => setD0(e.target.value)} className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100" />
          <input type="date" value={d1} onChange={(e) => setD1(e.target.value)} className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100" />
        </div>
        <ul className="space-y-2 text-sm">
          {filtered.map((o) => (
            <li key={o.id} className="rounded border border-neutral-800 p-3">
              {o.id} · {o.date} · user {o.userId} · ${o.total}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg text-neutral-300">Inventory</h2>
        <ul className="space-y-2">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-2 text-sm text-neutral-200"
            >
              <span className="min-w-[8rem]">{p.name}</span>
              <input
                type="number"
                min={0}
                defaultValue={p.quantity}
                key={p.quantity}
                onBlur={async (e) => {
                  await adminSetStock(
                    p.id,
                    Math.max(0, Number(e.target.value) || 0)
                  );
                }}
                className="w-20 rounded border border-neutral-700 bg-neutral-900 px-2 py-1"
              />
            </li>
          ))}
        </ul>
        <form
          className="mt-4 grid max-w-xl gap-2 text-xs sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await adminAddProduct({
              name: newP.name,
              description: newP.description,
              category: newP.category,
              brand: newP.brand,
              model: newP.model,
              price: Number(newP.price) || 0,
              quantity: Number(newP.quantity) || 0,
              image: newP.image,
            });
            setNewP((x) => ({ ...x, name: "", description: "", price: "", quantity: "" }));
          }}
        >
          <input required placeholder="Name" value={newP.name} onChange={(e) => setNewP((x) => ({ ...x, name: e.target.value }))} className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100 sm:col-span-2" />
          <input required placeholder="Description" value={newP.description} onChange={(e) => setNewP((x) => ({ ...x, description: e.target.value }))} className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100 sm:col-span-2" />
          <input required placeholder="Category" value={newP.category} onChange={(e) => setNewP((x) => ({ ...x, category: e.target.value }))} />
          <input required placeholder="Brand" value={newP.brand} onChange={(e) => setNewP((x) => ({ ...x, brand: e.target.value }))} />
          <input required placeholder="Model" value={newP.model} onChange={(e) => setNewP((x) => ({ ...x, model: e.target.value }))} />
          <input required placeholder="Price" type="number" value={newP.price} onChange={(e) => setNewP((x) => ({ ...x, price: e.target.value }))} />
          <input required placeholder="Qty" type="number" value={newP.quantity} onChange={(e) => setNewP((x) => ({ ...x, quantity: e.target.value }))} />
          <button type="submit" className="rounded bg-amber-500 px-3 py-1 font-medium text-neutral-950 sm:col-span-2">
            Add product
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg text-neutral-300">Users</h2>
        <ul className="space-y-3 text-sm">
          {users.map((u) => (
            <li key={u.id} className="rounded border border-neutral-800 p-3">
              <UserRow u={u} onSave={(patch) => adminUpdateUser(u.id, patch)} />
            </li>
          ))}
        </ul>
      </section>

      <Link to="/" className="text-sm text-amber-400 underline">
        Storefront
      </Link>
    </div>
  );
}

function UserRow({ u, onSave }) {
  const [firstName, setFn] = useState(u.firstName);
  const [lastName, setLn] = useState(u.lastName);
  return (
    <div className="flex flex-wrap items-end gap-2">
      <span className="text-neutral-500">{u.email}</span>
      <input value={firstName} onChange={(e) => setFn(e.target.value)} className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100" />
      <input value={lastName} onChange={(e) => setLn(e.target.value)} className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100" />
      <button
        type="button"
        onClick={async () => {
          await onSave({ firstName, lastName });
        }}
        className="text-xs text-amber-400 underline"
      >
        Save
      </button>
    </div>
  );
}
