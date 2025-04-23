import { notFound, redirect } from "next/navigation"
import { ForumForm } from "@/components/forum-form"
import { getForum } from "@/app/actions/forum-actions"
import { getServerClient } from "@/lib/supabase"

export default async function EditForumPage({ params }: { params: { id: string } }) {
  // Special case for "new" route - redirect to the new forum page
  if (params.id === "new") {
    redirect("/forums/new")
  }

  const forum = await getForum(params.id)

  if (!forum) {
    notFound()
  }

  // Check if the current user is the owner
  const supabase = getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.id !== forum.user_id) {
    redirect(`/forums/${params.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Forum</h1>
      <ForumForm forum={forum} />
    </div>
  )
}
