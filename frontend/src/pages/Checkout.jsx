import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useStore } from "../store.jsx";

export default function Checkout() {
  const { user, cart, checkout } = useStore();
  const [useProfile, setUseProfile] = useState(true);
  const [street, setStreet] = useState(user?.shippingStreet ?? "");
  const [province, setProvince] = useState(user?.shippingProvince ?? "");
  const [country, setCountry] = useState(user?.shippingCountry ?? "");
  const [zip, setZip] = useState(user?.shippingZip ?? "");
  const [cardLast4, setCardLast4] = useState(user?.cardLast4 ?? "");
  const [msg, setMsg] = useState(null);

  if (!user) return <Navigate to="/login" replace state={{ from: "/checkout" }} />;
  if (cart.length === 0) return <Navigate to="/cart" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    const r = await checkout({
      useProfile,
      shipping: { street, province, country, zip },
      cardLast4,
    });
    setMsg(r);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-100">Checkout</h1>
      <form onSubmit={submit} className="space-y-4 text-sm">
        <label className="flex items-center gap-2 text-neutral-300">
          <input
            type="checkbox"
            checked={useProfile}
            onChange={(e) => setUseProfile(e.target.checked)}
          />
          Use saved profile address &amp; card (last 4)
        </label>
        {!useProfile && (
          <div className="space-y-3 rounded-lg border border-neutral-800 p-4">
            <p className="text-neutral-500">Shipping</p>
            <input
              required={!useProfile}
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Street"
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
            />
            <input
              required={!useProfile}
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="Province"
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
            />
            <input
              required={!useProfile}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country"
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
            />
            <input
              required={!useProfile}
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="Postal / ZIP"
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
            />
            <p className="text-neutral-500">Card (last 4 digits — mock)</p>
            <input
              required={!useProfile}
              value={cardLast4}
              onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="4242"
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full rounded-lg bg-amber-500 py-2.5 font-medium text-neutral-950 hover:bg-amber-400"
        >
          Confirm order
        </button>
      </form>
      {msg && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            msg.ok
              ? "border-emerald-800 bg-emerald-950/40 text-emerald-200"
              : "border-red-900 bg-red-950/40 text-red-200"
          }`}
        >
          {msg.ok ? (
            <>
              Order {msg.orderId} placed. Total ${msg.total_price}. Cart cleared.{" "}
              <Link to="/account" className="underline">
                View account
              </Link>
            </>
          ) : (
            msg.error
          )}
        </div>
      )}
      <Link to="/cart" className="text-sm text-amber-400 underline">
        Back to cart
      </Link>
    </div>
  );
}
