import { ForumForm } from "@/components/forum-form"
import { redirect } from "next/navigation"
import { getServerClient } from "@/lib/supabase"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create New Forum",
  description: "Create a new discussion topic",
}

export default async function NewForumPage() {
  // Check if user is authenticated
  const supabase = getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?callbackUrl=/forums/new")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Forum</h1>
      <ForumForm />
    </div>
  )
}
