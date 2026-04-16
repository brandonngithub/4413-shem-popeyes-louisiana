import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  AddressElement,
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { api, errMsg } from "../api.js";
import { useStore } from "../store.jsx";

const stripePromiseCache = new Map();
function getStripePromise(publishableKey) {
  if (!publishableKey) return null;
  if (!stripePromiseCache.has(publishableKey)) {
    stripePromiseCache.set(publishableKey, loadStripe(publishableKey));
  }
  return stripePromiseCache.get(publishableKey);
}

function StripeCheckoutForm({ user, onOrderPlaced, onFailed }) {
  const stripe = useStripe();
  const elements = useElements();
  const { checkout } = useStore();
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error: confirmErr, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    if (confirmErr) {
      setSubmitting(false);
      onFailed(confirmErr.message || "Credit Card Authorization Failed.");
      return;
    }
    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      setSubmitting(false);
      onFailed("Credit Card Authorization Failed.");
      return;
    }
    const r = await checkout({ paymentIntentId: paymentIntent.id });
    setSubmitting(false);
    if (r.ok) onOrderPlaced(r);
    else onFailed(r.error);
  };

  const defaultName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return (
    <form onSubmit={submit} className="space-y-4 text-sm">
      <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <p className="text-neutral-400">Shipping address</p>
        <AddressElement
          options={{
            mode: "shipping",
            allowedCountries: ["CA", "US"],
            defaultValues: { name: defaultName },
            fields: { phone: "never" },
          }}
        />
      </div>

      <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <p className="text-neutral-400">Card details</p>
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full rounded-lg bg-amber-500 py-2.5 font-medium text-neutral-950 hover:bg-amber-400 disabled:opacity-60"
      >
        {submitting ? "Processing…" : "Pay and confirm order"}
      </button>
    </form>
  );
}

export default function Checkout() {
  const nav = useNavigate();
  const { user, cart } = useStore();
  const [publishableKey, setPublishableKey] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!user || cart.length === 0) {
        if (!cancel) setLoading(false);
        return;
      }
      try {
        const { data: cfg } = await api.get("/payments/config");
        if (cancel) return;
        setPublishableKey(cfg.publishable_key);
        const { data } = await api.post("/payments/create-intent", {
          items: cart.map((l) => ({
            product_id: Number(l.itemId),
            quantity: l.qty,
            price_at_purchase: 0,
          })),
        });
        if (!cancel) setClientSecret(data.client_secret);
      } catch (e) {
        if (!cancel) setErr(errMsg(e, "Could not initialize checkout."));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [user, cart]);

  const stripePromise = useMemo(
    () => getStripePromise(publishableKey),
    [publishableKey]
  );

  if (!user) return <Navigate to="/login" replace state={{ from: "/checkout" }} />;
  if (cart.length === 0) return <Navigate to="/cart" replace />;

  const onOrderPlaced = (r) => {
    nav("/orders", {
      state: {
        orderSuccess: true,
        orderId: r.orderId,
        totalPrice: r.total_price,
      },
    });
  };

  const onFailed = (message) => setErr(message);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-100">Checkout</h1>

      {loading && <p className="text-neutral-500">Loading payment form…</p>}

      {!loading && clientSecret && stripePromise && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "night",
              variables: {
                colorPrimary: "#f59e0b",
                colorBackground: "#0a0a0a",
                colorText: "#f5f5f5",
                colorTextSecondary: "#a3a3a3",
                colorTextPlaceholder: "#737373",
                colorDanger: "#f87171",
                colorIconTab: "#a3a3a3",
                colorIconTabSelected: "#f59e0b",
                borderRadius: "8px",
                fontFamily:
                  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                fontSizeBase: "14px",
                spacingUnit: "4px",
              },
              rules: {
                ".Input": {
                  border: "1px solid #404040",
                  backgroundColor: "#171717",
                },
                ".Input:focus": {
                  border: "1px solid #f59e0b",
                  boxShadow: "0 0 0 1px #f59e0b",
                },
                ".Label": {
                  color: "#d4d4d4",
                  fontWeight: "500",
                },
                ".Tab": {
                  border: "1px solid #404040",
                  backgroundColor: "#171717",
                },
                ".Tab:hover": {
                  backgroundColor: "#262626",
                },
                ".Tab--selected": {
                  borderColor: "#f59e0b",
                  backgroundColor: "#1c1917",
                },
              },
            },
          }}
        >
          <StripeCheckoutForm
            user={user}
            onOrderPlaced={onOrderPlaced}
            onFailed={onFailed}
          />
        </Elements>
      )}

      {err && (
        <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">
          {err}
        </div>
      )}

      <Link to="/cart" className="text-sm text-amber-400 underline">
        Back to cart
      </Link>
    </div>
  );
}
