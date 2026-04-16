import { useState } from "react"
import { Link } from "react-router-dom"
import { useStore } from "../../store.jsx"

export default function Users() {
  const { users, adminUpdateUser, adminDeleteUser } = useStore()
  const [drafts, setDrafts] = useState({})
  const [savedId, setSavedId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const draftFor = (u) =>
    drafts[u.id] ?? {
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      shippingStreet: u.shippingStreet ?? "",
      shippingProvince: u.shippingProvince ?? "",
      shippingCountry: u.shippingCountry ?? "",
      shippingZip: u.shippingZip ?? "",
    }

  const updateDraft = (u, key, value) => {
    const id = u.id
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        firstName: prev[id]?.firstName ?? u.firstName ?? "",
        lastName: prev[id]?.lastName ?? u.lastName ?? "",
        shippingStreet: prev[id]?.shippingStreet ?? u.shippingStreet ?? "",
        shippingProvince:
          prev[id]?.shippingProvince ?? u.shippingProvince ?? "",
        shippingCountry: prev[id]?.shippingCountry ?? u.shippingCountry ?? "",
        shippingZip: prev[id]?.shippingZip ?? u.shippingZip ?? "",
        [key]: value,
      },
    }))
  }

  const save = async (id) => {
    const d = drafts[id]
    if (!d) return
    await adminUpdateUser(id, d)
    setSavedId(id)
    setTimeout(() => setSavedId(null), 1500)
  }

  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    setDeletingId(id)
    try {
      await adminDeleteUser(id)
      // The store should automatically update the users list
    } catch (error) {
      alert("Failed to delete user: " + error.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-100">Users</h1>
        <Link to="/admin" className="text-sm text-amber-400 underline">
          Back to Admin
        </Link>
      </div>
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
        {users.length === 0 ? (
          <p className="text-neutral-500">No users available yet.</p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
              >
                <p className="font-semibold text-neutral-100">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-neutral-400">{user.email}</p>
                <p className="text-sm text-neutral-400">Role: {user.role}</p>
                {user.role !== "admin" && (
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <input
                      value={draftFor(user).firstName}
                      onChange={(e) =>
                        updateDraft(user, "firstName", e.target.value)
                      }
                      placeholder="First name"
                      className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-neutral-100"
                    />
                    <input
                      value={draftFor(user).lastName}
                      onChange={(e) =>
                        updateDraft(user, "lastName", e.target.value)
                      }
                      placeholder="Last name"
                      className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-neutral-100"
                    />
                    <input
                      value={draftFor(user).shippingStreet}
                      onChange={(e) =>
                        updateDraft(user, "shippingStreet", e.target.value)
                      }
                      placeholder="Street"
                      className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-neutral-100 sm:col-span-2"
                    />
                    <input
                      value={draftFor(user).shippingProvince}
                      onChange={(e) =>
                        updateDraft(user, "shippingProvince", e.target.value)
                      }
                      placeholder="Province"
                      className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-neutral-100"
                    />
                    <input
                      value={draftFor(user).shippingCountry}
                      onChange={(e) =>
                        updateDraft(user, "shippingCountry", e.target.value)
                      }
                      placeholder="Country"
                      className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-neutral-100"
                    />
                    <input
                      value={draftFor(user).shippingZip}
                      onChange={(e) =>
                        updateDraft(user, "shippingZip", e.target.value)
                      }
                      placeholder="Postal / ZIP"
                      className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-neutral-100"
                    />
                    <div className="sm:col-span-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => save(user.id)}
                        className="rounded bg-amber-500 px-3 py-1.5 text-sm font-medium text-neutral-950 hover:bg-amber-400"
                      >
                        Save user changes
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUser(user.id)}
                        disabled={deletingId === user.id}
                        className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
                      >
                        {deletingId === user.id ? "Deleting..." : "Delete user"}
                      </button>
                      {savedId === user.id && (
                        <span className="ml-3 text-emerald-400">Saved.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
