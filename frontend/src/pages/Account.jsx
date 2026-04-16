import { useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { useStore } from "../store.jsx"

function Field({ label, value, onChange, placeholder, readOnly = false, maxLength, type = "text" }) {
  const base =
    "w-full rounded-lg border px-3 py-2 text-neutral-100 transition " +
    (readOnly
      ? "border-neutral-800 bg-neutral-900/40 text-neutral-500 cursor-not-allowed"
      : "border-neutral-700 bg-neutral-900"
    )

  return (
    <label className="space-y-2 text-sm text-neutral-300">
      <span className="block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={readOnly ? undefined : onChange}
        placeholder={placeholder}
        disabled={readOnly}
        maxLength={maxLength}
        className={base}
      />
    </label>
  )
}

export default function Account() {
  const { user, updateProfile } = useStore();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [shippingStreet, setShippingStreet] = useState(user?.shippingStreet ?? "");
  const [shippingProvince, setShippingProvince] = useState(user?.shippingProvince ?? "");
  const [shippingCountry, setShippingCountry] = useState(user?.shippingCountry ?? "");
  const [shippingZip, setShippingZip] = useState(user?.shippingZip ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setShippingStreet(user?.shippingStreet ?? "");
    setShippingProvince(user?.shippingProvince ?? "");
    setShippingCountry(user?.shippingCountry ?? "");
    setShippingZip(user?.shippingZip ?? "");
  }, [
    user?.id,
    user?.firstName,
    user?.lastName,
    user?.shippingStreet,
    user?.shippingProvince,
    user?.shippingCountry,
    user?.shippingZip,
  ]);

  if (!user) return <Navigate to="/login" replace />

  const save = async (e) => {
    e.preventDefault()
    await updateProfile({
      firstName,
      lastName,
      shippingStreet,
      shippingProvince,
      shippingCountry,
      shippingZip,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-neutral-100">Account</h1>
      </div>
      <form onSubmit={save} className="max-w-2xl space-y-6 text-sm">
        <section className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <p className="text-neutral-400">Profile</p>
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
            />
            <Field
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
            />
            <Field
              label="Email"
              value={user.email}
              readOnly
              placeholder="Email"
            />
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <p className="text-neutral-400">Address</p>
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="Street"
              value={shippingStreet}
              onChange={(e) => setShippingStreet(e.target.value)}
              placeholder="Street"
            />
            <Field
              label="Province"
              value={shippingProvince}
              onChange={(e) => setShippingProvince(e.target.value)}
              placeholder="Province"
            />
            <Field
              label="Country"
              value={shippingCountry}
              onChange={(e) => setShippingCountry(e.target.value)}
              placeholder="Country"
            />
            <Field
              label="Postal / ZIP"
              value={shippingZip}
              onChange={(e) => setShippingZip(e.target.value)}
              placeholder="Postal / ZIP"
            />
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-neutral-800 px-4 py-2 text-neutral-100 hover:bg-neutral-700"
          >
            Save profile
          </button>
          {saved && <span className="text-emerald-400">Saved.</span>}
        </div>
      </form>
    </div>
  )
}
