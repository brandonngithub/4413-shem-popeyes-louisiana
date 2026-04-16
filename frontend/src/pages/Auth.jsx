import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../store.jsx";

export function Login() {
  const { user, login } = useStore();
  const nav = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  if (user) return <Navigate to={state?.from ?? "/"} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const r = await login(email, password);
    if (!r.ok) setErr(r.error);
    else nav(state?.from ?? "/");
  };

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-semibold text-neutral-100">Sign in</h1>
      <form onSubmit={submit} className="space-y-3 text-sm">
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
        />
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"
        />
        {err && <p className="text-red-400">{err}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-amber-500 py-2 font-medium text-neutral-950 hover:bg-amber-400"
        >
          Sign in
        </button>
      </form>
      <p className="text-sm text-neutral-500">
        No account?{" "}
        <Link to="/register" className="text-amber-400 underline">
          Register
        </Link>
      </p>
    </div>
  );
}

export function Register() {
  const { user, register } = useStore();
  const nav = useNavigate();
  const [f, setF] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    shippingStreet: "",
    shippingProvince: "",
    shippingCountry: "",
    shippingZip: "",
  });
  const [err, setErr] = useState("");

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const r = await register(f);
    if (!r.ok) setErr(r.error);
    else nav("/");
  };

  const ch = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold text-neutral-100">Register</h1>
      <form onSubmit={submit} className="grid gap-2 text-sm sm:grid-cols-2">
        <input required className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 sm:col-span-2" placeholder="Email" type="email" value={f.email} onChange={ch("email")} />
        <input required className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 sm:col-span-2" placeholder="Password" type="password" value={f.password} onChange={ch("password")} />
        <input required className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100" placeholder="First name" value={f.firstName} onChange={ch("firstName")} />
        <input required className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100" placeholder="Last name" value={f.lastName} onChange={ch("lastName")} />
        <input required className="sm:col-span-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100" placeholder="Street" value={f.shippingStreet} onChange={ch("shippingStreet")} />
        <input required className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100" placeholder="Province" value={f.shippingProvince} onChange={ch("shippingProvince")} />
        <input required className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100" placeholder="Country" value={f.shippingCountry} onChange={ch("shippingCountry")} />
        <input required className="sm:col-span-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100" placeholder="Postal / ZIP" value={f.shippingZip} onChange={ch("shippingZip")} />
        {err && <p className="text-red-400 sm:col-span-2">{err}</p>}
        <button type="submit" className="sm:col-span-2 rounded-lg bg-amber-500 py-2 font-medium text-neutral-950 hover:bg-amber-400">
          Create account
        </button>
      </form>
      <p className="text-sm text-neutral-500">
        <Link to="/login" className="text-amber-400 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
