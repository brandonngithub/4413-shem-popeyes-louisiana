import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useStore } from "../../store.jsx"

export default function Inventory() {
  const { products, adminSetStock } = useStore()
  const [drafts, setDrafts] = useState({})
  const [savedId, setSavedId] = useState(null)

  const rows = useMemo(() => {
    return [...products].sort((a, b) => a.name.localeCompare(b.name))
  }, [products])

  const qtyFor = (p) => {
    const draft = drafts[p.id]
    return draft == null ? String(p.quantity ?? 0) : draft
  }

  const save = async (p) => {
    const raw = qtyFor(p)
    const next = Number(raw)
    if (!Number.isFinite(next) || next < 0) return
    await adminSetStock(p.id, Math.floor(next))
    setSavedId(p.id)
    setTimeout(() => setSavedId(null), 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-100">Inventory</h1>
        <Link to="/admin" className="text-sm text-amber-400 underline">
          Back to Admin
        </Link>
      </div>

      <div className="space-y-3 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
        {rows.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-3"
          >
            <div className="min-w-[16rem] flex-1">
              <p className="font-semibold text-neutral-100">{p.name}</p>
              <p className="text-sm text-neutral-500">
                {p.brand} · {p.category}
              </p>
            </div>
            <label className="text-sm text-neutral-400">
              Stock
              <input
                type="number"
                min={0}
                value={qtyFor(p)}
                onChange={(e) =>
                  setDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
                className="ml-2 w-24 rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100"
              />
            </label>
            <button
              type="button"
              onClick={() => save(p)}
              className="rounded bg-amber-500 px-3 py-1.5 text-sm font-medium text-neutral-950 hover:bg-amber-400"
            >
              Save
            </button>
            {savedId === p.id && <span className="text-emerald-400">Saved.</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
