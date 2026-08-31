import Link from "next/link"

export function Sidebar() {
  return (
    <aside className="hidden md:block w-60 bg-white border-r p-4 space-y-4">
      <div className="font-bold">KANLUEM</div>
      <nav className="space-y-1 text-sm">
        <Link href="/dashboard" className="block px-3 py-2 rounded-xl bg-slate-900 text-white">
          Today
        </Link>
        <Link href="/reminders" className="block px-3 py-2 rounded-xl hover:bg-slate-100">
          Reminders
        </Link>
        <Link href="/family" className="block px-3 py-2 rounded-xl hover:bg-slate-100">
          Family
        </Link>
        <Link href="/family/invite" className="block px-3 py-2 rounded-xl hover:bg-slate-100">
          Invite
        </Link>
      </nav>
    </aside>
  )
}
