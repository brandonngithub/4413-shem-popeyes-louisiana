import { Link } from "react-router-dom"
import { useStore } from "../../store.jsx"

export default function Users() {
  const { users } = useStore()

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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
