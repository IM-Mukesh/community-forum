import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getForum } from "@/app/actions/forum-actions"
import { getComments } from "@/app/actions/comment-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDistanceToNow } from "date-fns"
import { Edit, MessageSquare } from "lucide-react"
import { CommentForm } from "@/components/comment-form"
import { CommentList } from "@/components/comment-list"
import { ForumLikeButton } from "@/components/forum-like-button"
import { getServerClient } from "@/lib/supabase"
import { DeleteForumButton } from "@/components/delete-forum-button"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Special case for "new" route
  if (params.id === "new") {
    return {
      title: "Create New Forum",
      description: "Create a new forum topic for discussion",
    }
  }

  const forum = await getForum(params.id)

  if (!forum) {
    return {
      title: "Forum Not Found",
      description: "The requested forum could not be found.",
    }
  }

  return {
    title: forum.title,
    description: forum.description.substring(0, 160),
    openGraph: {
      title: forum.title,
      description: forum.description.substring(0, 160),
      type: "article",
      authors: [forum.author?.username || "Unknown"],
      tags: Array.isArray(forum.tags) ? forum.tags : [],
    },
  }
}

export default async function ForumPage({ params }: { params: { id: string } }) {
  // Special case for "new" route - redirect to the new forum page
  if (params.id === "new") {
    redirect("/forums/new")
  }

  const forum = await getForum(params.id)

  if (!forum) {
    notFound()
  }

  const comments = await getComments(params.id)

  // Get current user
  const supabase = getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user has liked this forum
  let userLiked = false
  if (user) {
    const { data, error } = await supabase
      .from("forum_likes")
      .select("id")
      .eq("forum_id", forum.id)
      .eq("user_id", user.id)
      .single()

    if (!error) {
      userLiked = true
    }
  }

  const isOwner = user?.id === forum.user_id

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
          &larr; Back to forums
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={forum.author?.avatar_url || ""} alt={forum.author?.username || ""} />
                  <AvatarFallback>{forum.author?.username?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{forum.author?.username || "Unknown"}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(forum.created_at), { addSuffix: true })}
                </span>
              </div>
              <h1 className="text-2xl font-bold">{forum.title}</h1>
            </div>

            {isOwner && (
              <div className="flex space-x-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                  <Link href={`/forums/${forum.id}/edit`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <DeleteForumButton forumId={forum.id} />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap">{forum.description}</p>

          {Array.isArray(forum.tags) && forum.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {forum.tags.map((tag, i) => (
                <Badge key={i} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t pt-4">
          <div className="flex items-center space-x-4 w-full">
            <ForumLikeButton forumId={forum.id} initialLiked={userLiked} likeCount={forum._count?.likes || 0} />
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{forum._count?.comments || 0} comments</span>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Separator className="my-8" />

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Comments</h2>

        <CommentForm forumId={forum.id} />

        <CommentList comments={comments} forumId={forum.id} currentUserId={user?.id} />
      </div>
    </div>
  )
}
