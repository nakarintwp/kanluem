import Link from "next/link"

export function BottomNav({ active = "today" }: { active?: string }) {
  const items = [
    { id: "today", label: "Today", icon: "🏠", href: "/dashboard" },
    { id: "calendar", label: "Calendar", icon: "📅", href: "/calendar" },
    { id: "reminders", label: "Reminders", icon: "🔔", href: "/reminders" },
    { id: "docs", label: "Docs", icon: "📄", href: "/docs" },
    { id: "family", label: "Family", icon: "👨‍👩‍👧", href: "/family" },
    { id: "more", label: "More", icon: "⋯", href: "/more" },
  ]

  return (
    <nav className="bg-white border-t grid grid-cols-6 text-center text-[10px] py-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={active === item.id ? "text-sky-600 font-medium" : "text-slate-400"}
        >
          <div className="text-lg">{item.icon}</div>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
