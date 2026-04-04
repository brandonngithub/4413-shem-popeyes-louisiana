import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store.jsx";

export default function Cart() {
  const nav = useNavigate();
  const { cart, products, setLineQty, removeLine } = useStore();

  const lines = cart
    .map((l) => {
      const p = products.find((x) => String(x.id) === String(l.itemId));
      return p ? { ...l, product: p } : null;
    })
    .filter(Boolean);

  const total = lines.reduce((s, l) => s + l.qty * l.product.price, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-100">Cart</h1>
      {lines.length === 0 ? (
        <p className="text-neutral-500">
          Empty. <Link to="/" className="text-amber-400 underline">Browse catalog</Link>
        </p>
      ) : (
        <>
          <ul className="divide-y divide-neutral-800 rounded-xl border border-neutral-800">
            {lines.map(({ itemId, qty, product: p }) => (
              <li
                key={itemId}
                className="flex flex-wrap items-center gap-4 p-4 text-sm"
              >
                <img
                  src={p.image}
                  alt=""
                  className="h-16 w-16 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-neutral-100">{p.name}</p>
                  <p className="text-neutral-500">${p.price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="decrease"
                    className="rounded border border-neutral-600 px-2 py-0.5 text-neutral-300 hover:bg-neutral-800"
                    onClick={() => setLineQty(itemId, qty - 1)}
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-neutral-200">{qty}</span>
                  <button
                    type="button"
                    aria-label="increase"
                    className="rounded border border-neutral-600 px-2 py-0.5 text-neutral-300 hover:bg-neutral-800"
                    onClick={() => setLineQty(itemId, qty + 1)}
                  >
                    +
                  </button>
                </div>
                <p className="w-24 text-right font-medium text-amber-400">
                  ${qty * p.price}
                </p>
                <button
                  type="button"
                  onClick={() => removeLine(itemId)}
                  className="text-xs text-red-400 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-lg text-neutral-200">
              Total <span className="font-semibold text-amber-400">${total}</span>
            </p>
            <div className="flex gap-3">
              <Link to="/" className="text-sm text-amber-400 underline">
                Continue shopping
              </Link>
              <button
                type="button"
                onClick={() => nav("/checkout")}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-amber-400"
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
