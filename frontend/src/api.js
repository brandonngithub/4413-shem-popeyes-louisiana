const base = () => import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

async function req(method, path, body) {
  const headers = {};
  try {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    if (user?.id != null) {
      headers["X-User-Id"] = String(user.id);
    }
  } catch {
    /* ignore */
  }
  if (body != null) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${base()}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  let data = {};
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }
  }
  if (!res.ok) {
    const err = new Error(typeof data.detail === "string" ? data.detail : "Request failed");
    err.response = { data };
    throw err;
  }
  return { data };
}

export const api = {
  get: (path) => req("GET", path),
  post: (path, body) => req("POST", path, body),
  patch: (path, body) => req("PATCH", path, body),
  put: (path, body) => req("PUT", path, body),
  delete: (path) => req("DELETE", path),
};

export function mapUser(u) {
  if (!u) return null;
  const role = typeof u.role === "string" ? u.role : u.role?.value ?? u.role;
  return {
    id: u.id,
    email: u.email,
    firstName: u.first_name,
    lastName: u.last_name,
    role,
  };
}

export function mapProduct(p) {
  const cat = typeof p.category === "string" ? p.category : p.category?.value ?? "other";
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    category: cat,
    brand: p.brand ?? "",
    model: p.model ?? "",
    price: p.price,
    quantity: p.stock,
    image: p.image || "https://picsum.photos/seed/none/320/320",
  };
}

export function productToApi(p) {
  return {
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    brand: p.brand,
    model: p.model,
    image: p.image,
    stock: p.quantity,
  };
}

export function mapOrder(o) {
  const raw = o.created_at;
  const date = typeof raw === "string" ? raw.slice(0, 10) : "";
  const status = typeof o.status === "string" ? o.status : o.status?.value ?? "placed";
  return {
    id: o.id,
    userId: o.user_id,
    date,
    createdAt: raw,
    status,
    total_price: o.total_price,
    total: o.total_price,
    shipTo: {
      name: o.ship_to_name ?? "",
      line1: o.ship_to_line1 ?? "",
      line2: o.ship_to_line2 ?? "",
      city: o.ship_to_city ?? "",
      state: o.ship_to_state ?? "",
      postalCode: o.ship_to_postal_code ?? "",
      country: o.ship_to_country ?? "",
    },
    lines: (o.items ?? []).map((i) => ({
      itemId: String(i.product_id),
      name: "",
      qty: i.quantity,
      unitPrice: i.price_at_purchase ?? i.price,
    })),
  };
}

export function errMsg(e, fallback) {
  const d = e.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d) && d[0]?.msg) return d[0].msg;
  return e.message || fallback;
}
