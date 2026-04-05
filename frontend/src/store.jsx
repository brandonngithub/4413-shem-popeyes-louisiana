import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  api,
  errMsg,
  mapOrder,
  mapProduct,
  mapUser,
  productToApi,
} from "./api.js"

const StoreContext = createContext(null)

function readCart() {
  try {
    const raw = localStorage.getItem("cart")
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart))
}

function readUser() {
  try {
    const raw = localStorage.getItem("user")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeUser(user) {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user))
  } else {
    localStorage.removeItem("user")
  }
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [cart, setCartState] = useState(readCart)
  const [user, setUserState] = useState(readUser)

  const setUser = useCallback(
    (next) => {
      const n = typeof next === "function" ? next(user) : next
      writeUser(n)
      setUserState(n)
    },
    [user],
  )

  const setCart = useCallback((next) => {
    setCartState((c) => {
      const n = typeof next === "function" ? next(c) : next
      writeCart(n)
      return n
    })
  }, [])

  const refreshOrders = useCallback(async (session) => {
    if (!session) {
      setOrders([])
      return
    }
    const path =
      session.role === "admin" ? "/orders/" : `/users/${session.id}/orders`
    const { data } = await api.get(path)
    setOrders(data.map(mapOrder))
  }, [])

  useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const { data } = await api.get("/products/")
        if (!cancel) setProducts(data.map(mapProduct))
      } catch {
        if (!cancel) setProducts([])
      }
      if (user?.role === "admin") {
        try {
          const { data } = await api.get("/users/")
          if (!cancel) setUsers(data.map(mapUser))
        } catch {
          if (!cancel) setUsers([])
        }
      } else if (!cancel) {
        setUsers([])
      }
    })()
    return () => {
      cancel = true
    }
  }, [user?.role])

  useEffect(() => {
    if (user) refreshOrders(user)
    else setOrders([])
  }, [user, refreshOrders])

  const value = useMemo(() => {
    const productById = (id) =>
      products.find((p) => String(p.id) === String(id))

    return {
      products,
      users,
      orders,
      cart,
      user,

      refreshProducts: async () => {
        const { data } = await api.get("/products/")
        setProducts(data.map(mapProduct))
      },

      login: async (email, password) => {
        try {
          const { data } = await api.post("/auth/login", { email, password })
          const session = mapUser(data)
          setUser(session)
          if (session.role === "admin") {
            try {
              const { data: udata } = await api.get("/users/")
              setUsers(udata.map(mapUser))
            } catch {
              setUsers([])
            }
          }
          await refreshOrders(session)
          return { ok: true }
        } catch (e) {
          return { ok: false, error: errMsg(e, "Invalid email or password.") }
        }
      },

      logout: () => setUser(null),

      register: async (f) => {
        try {
          const { data } = await api.post("/users/", {
            email: f.email,
            password: f.password,
            first_name: f.firstName,
            last_name: f.lastName,
            role: "customer",
            shipping_street: f.shippingStreet,
            shipping_province: f.shippingProvince,
            shipping_country: f.shippingCountry,
            shipping_zip: f.shippingZip,
            card_last4: f.cardLast4.slice(-4),
          })
          const session = mapUser(data)
          setUser(session)
          await refreshOrders(session)
          return { ok: true }
        } catch (e) {
          return {
            ok: false,
            error: errMsg(e, "Email may already be registered."),
          }
        }
      },

      updateProfile: async (patch) => {
        if (!user) return
        try {
          await api.patch(`/users/${user.id}`, {
            first_name: patch.firstName,
            last_name: patch.lastName,
            shipping_street: patch.shippingStreet,
            shipping_province: patch.shippingProvince,
            shipping_country: patch.shippingCountry,
            shipping_zip: patch.shippingZip,
            card_last4: patch.cardLast4,
          })
          const { data } = await api.get(`/users/${user.id}`)
          setUser(mapUser(data))
        } catch {
          /* ignore */
        }
      },

      addToCart: (itemId, qty = 1) => {
        const sid = String(itemId)
        setCart((c) => {
          const i = c.findIndex((l) => l.itemId === sid)
          if (i >= 0) {
            const next = [...c]
            next[i] = { ...next[i], qty: next[i].qty + qty }
            return next
          }
          return [...c, { itemId: sid, qty }]
        })
      },

      setLineQty: (itemId, qty) => {
        const sid = String(itemId)
        setCart((c) => {
          if (qty < 1) return c.filter((l) => l.itemId !== sid)
          return c.map((l) => (l.itemId === sid ? { ...l, qty } : l))
        })
      },

      removeLine: (itemId) =>
        setCart((c) => c.filter((l) => l.itemId !== String(itemId))),

      checkout: async ({ useProfile, shipping, cardLast4 }) => {
        if (!user) return { ok: false, error: "Sign in to check out." }
        for (const line of cart) {
          const p = productById(line.itemId)
          if (!p) return { ok: false, error: "Unknown product in cart." }
          if (line.qty > p.quantity)
            return {
              ok: false,
              error: `${p.name}: only ${p.quantity} in stock (cart has ${line.qty}).`,
            }
        }
        try {
          const { data: order } = await api.post("/orders/", {
            user_id: user.id,
            total_price: 0,
            status: "placed",
            items: cart.map((l) => ({
              product_id: Number(l.itemId),
              quantity: l.qty,
              price_at_purchase: 0,
            })),
          })
          setCart([])
          if (!useProfile) {
            await api.patch(`/users/${user.id}`, {
              shipping_street: shipping.street,
              shipping_province: shipping.province,
              shipping_country: shipping.country,
              shipping_zip: shipping.zip,
              card_last4: cardLast4.slice(-4),
            })
            const { data } = await api.get(`/users/${user.id}`)
            setUser(mapUser(data))
          }
          const { data: plist } = await api.get("/products/")
          setProducts(plist.map(mapProduct))
          await refreshOrders(user)
          return { ok: true, orderId: order.id, total_price: order.total_price }
        } catch (e) {
          return { ok: false, error: errMsg(e, "Checkout failed.") }
        }
      },

      adminSetStock: async (itemId, quantity) => {
        const p = productById(itemId)
        if (!p) return
        const { data } = await api.put(`/products/${itemId}`, {
          ...productToApi({ ...p, quantity }),
        })
        setProducts((list) =>
          list.map((x) => (x.id === data.id ? mapProduct(data) : x)),
        )
      },

      adminAddProduct: async (row) => {
        const { data } = await api.post("/products/", {
          name: row.name,
          description: row.description,
          price: row.price,
          category: row.category,
          brand: row.brand,
          model: row.model,
          image: row.image,
          stock: row.quantity,
        })
        setProducts((list) => [...list, mapProduct(data)])
      },

      adminUpdateUser: async (id, patch) => {
        await api.patch(`/users/${id}`, {
          first_name: patch.firstName,
          last_name: patch.lastName,
          shipping_street: patch.shippingStreet,
          shipping_province: patch.shippingProvince,
          shipping_country: patch.shippingCountry,
          shipping_zip: patch.shippingZip,
          card_last4: patch.cardLast4,
        })
        const { data } = await api.get("/users/")
        setUsers(data.map(mapUser))
        if (user?.id === id) {
          const me = data.find((x) => x.id === id)
          if (me) setUser(mapUser(me))
        }
      },

      adminDeleteUser: async (id) => {
        await api.delete(`/users/${id}`)
        const { data } = await api.get("/users/")
        setUsers(data.map(mapUser))
        if (user?.id === id) {
          setUser(null)
          localStorage.removeItem("user")
        }
      },

      updateOrderStatus: async (orderId, status) => {
        const current = orders.find((o) => o.id === orderId)
        if (!current) return
        await api.put(`/orders/${orderId}`, {
          user_id: current.userId,
          total_price: current.total_price,
          status,
        })
        setOrders((orders) =>
          orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        )
      },
    }
  }, [products, users, orders, cart, user, setCart, refreshOrders])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const v = useContext(StoreContext)
  if (!v) throw new Error("useStore outside StoreProvider")
  return v
}
