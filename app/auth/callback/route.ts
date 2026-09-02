import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDesc = searchParams.get("error_description")
  const next = searchParams.get("next") ?? "/dashboard"

  // If Supabase/G Google returns error directly in callback, forward it
  if (error) {
    console.error("callback error from provider:", error, errorDesc)
    return NextResponse.redirect(
      `${origin}/login?error=auth&error_code=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDesc || "")}`
    )
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {}
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error("exchangeCodeForSession error:", error)
    return NextResponse.redirect(`${origin}/login?error=auth&error_code=${error.code}&error_description=${encodeURIComponent(error.message)}`)
  }

  return NextResponse.redirect(`${origin}/login?error=auth&error_code=no_code`)
}
