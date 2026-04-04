import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useStore } from "../store.jsx";

export default function Account() {
  const { user, orders, products, logout, updateProfile } = useStore();
  const mine = orders.filter((o) => o.userId === user?.id);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
  }, [user?.id, user?.firstName, user?.lastName]);

  if (!user) return <Navigate to="/login" replace />;

  const save = async (e) => {
    e.preventDefault();
    await updateProfile({ firstName, lastName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-neutral-100">Account</h1>
        <button
          type="button"
          onClick={() => logout()}
          className="text-sm text-amber-400 underline"
        >
          Sign out
        </button>
      </div>
      <form onSubmit={save} className="max-w-md space-y-3 text-sm">
        <p className="text-neutral-500">Profile</p>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
        />
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
        />
        <p className="text-xs text-neutral-500">
          {user.email} · card …{user.cardLast4} · {user.shippingStreet}, {user.shippingZip}
        </p>
        <button
          type="submit"
          className="rounded-lg bg-neutral-800 px-4 py-2 text-neutral-100 hover:bg-neutral-700"
        >
          Save name
        </button>
        {saved && <span className="text-emerald-400">Saved.</span>}
      </form>
      <div>
        <p className="mb-2 text-neutral-500">Purchase history</p>
        <ul className="space-y-2 text-sm">
          {mine.map((o) => (
            <li
              key={o.id}
              className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3"
            >
              <span className="text-neutral-400">{o.date}</span> · {o.id} · $
              {o.total}
              <ul className="mt-1 text-neutral-500">
                {o.lines.map((l) => (
                  <li key={l.itemId}>
                    {products.find((p) => String(p.id) === l.itemId)?.name ??
                      l.itemId}{" "}
                    × {l.qty} @ ${l.unitPrice}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        {mine.length === 0 && <p className="text-neutral-600">No orders yet.</p>}
      </div>
      <Link to="/" className="text-sm text-amber-400 underline">
        Catalog
      </Link>
    </div>
  );
}
