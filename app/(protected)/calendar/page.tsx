import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CalendarClient from "./CalendarClient"

export default async function CalendarPage() {
  const supabase = await createServerClientSSR()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: members } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single()
  const familyId = (members as unknown as { family_id: string } | null)?.family_id
  if (!familyId) redirect("/onboarding")

  const { data: reminders } = await supabase
    .from("reminders")
    .select("id, title, due_at, category, priority, status")
    .eq("family_id", familyId)
    .order("due_at", { ascending: true })

  return <CalendarClient initialReminders={(reminders as unknown as { id: string; title: string; due_at: string; category: string; priority: string; status: string }[]) || []} />
}
