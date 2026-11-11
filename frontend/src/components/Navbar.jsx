import { NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Navbar({ session }) {
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-700 text-white'
        : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
    }`

  return (
    <nav className="bg-indigo-600 shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <span className="text-white font-bold text-lg tracking-tight">
          Roommate Resolver
        </span>

        <div className="flex items-center gap-2">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/submit" className={linkClass}>
            Submit
          </NavLink>
          <NavLink to="/ra-view" className={linkClass}>
            RA View
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-indigo-200 text-sm hidden sm:block">
            {session.user.email}
          </span>
          <button
            onClick={handleSignOut}
            className="text-sm bg-indigo-800 hover:bg-indigo-900 text-white px-3 py-1.5 rounded transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
