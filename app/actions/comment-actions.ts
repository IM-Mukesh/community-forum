"use server"

import { revalidatePath } from "next/cache"
import { getServerClient } from "@/lib/supabase"
import type { CommentWithAuthor, NotificationPreferences } from "@/types/database"
import { sendCommentNotification } from "@/lib/email-service"

export async function getComments(forumId: string): Promise<CommentWithAuthor[]> {
  const supabase = getServerClient()

  // Get comments
  const { data: comments, error } = await supabase
    .from("comments")
    .select("*")
    .eq("forum_id", forumId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching comments:", error)
    return []
  }

  // Get user IDs from comments
  const userIds = [...new Set(comments.map((comment) => comment.user_id))]

  // Get profiles for those users
  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("id", userIds)

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError)
  }

  // Get all likes for these comments
  const commentIds = comments.map((comment) => comment.id)
  const { data: likes, error: likeError } = await supabase
    .from("comment_likes")
    .select("comment_id")
    .in("comment_id", commentIds)

  if (likeError) {
    console.error("Error fetching comment likes:", likeError)
  }

  // Count likes manually
  const likeCounts = commentIds.reduce(
    (acc, commentId) => {
      acc[commentId] = likes?.filter((like) => like.comment_id === commentId).length || 0
      return acc
    },
    {} as Record<string, number>,
  )

  // Combine the data
  const commentsWithCounts = comments.map((comment) => {
    const author = profiles?.find((profile) => profile.id === comment.user_id) || null
    const likeCount = likeCounts[comment.id] || 0

    return {
      ...comment,
      author,
      _count: {
        likes: likeCount,
      },
    }
  })

  return commentsWithCounts
}

export async function createComment(forumId: string, formData: FormData) {
  const supabase = getServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("You must be logged in to comment")
  }

  const content = formData.get("content") as string

  // Insert the comment
  const { error } = await supabase.from("comments").insert({
    content,
    forum_id: forumId,
    user_id: user.id,
  })

  if (error) {
    console.error("Error creating comment:", error)
    throw new Error("Failed to create comment")
  }

  // Get the forum details and forum owner's profile for notification
  const { data: forum, error: forumError } = await supabase
    .from("forums")
    .select("*, profiles(*)")
    .eq("id", forumId)
    .single()

  if (forumError) {
    console.error("Error fetching forum for notification:", forumError)
  } else if (forum && forum.user_id !== user.id) {
    // Only send notification if the commenter is not the forum owner
    try {
      // Get the commenter's profile
      const { data: commenterProfile } = await supabase.from("profiles").select("username").eq("id", user.id).single()

      // Get the forum owner's email
      const { data: forumOwner } = await supabase.auth.admin.getUserById(forum.user_id)

      if (forumOwner?.user?.email) {
        // Get the forum owner's notification preferences
        const { data: ownerProfile } = await supabase
          .from("profiles")
          .select("notification_preferences")
          .eq("id", forum.user_id)
          .single()

        const notificationPrefs = ownerProfile?.notification_preferences as NotificationPreferences | null

        // Check if the user has enabled email notifications (default is true)
        if (!notificationPrefs || notificationPrefs.email_notifications !== false) {
          await sendCommentNotification({
            forumTitle: forum.title,
            forumId,
            commentAuthor: commenterProfile?.username || user.email || "A user",
            commentContent: content,
            recipientEmail: forumOwner.user.email,
          })
        }
      }
    } catch (notificationError) {
      // Log but don't fail the comment creation if notification fails
      console.error("Error sending notification:", notificationError)
    }
  }

  revalidatePath(`/forums/${forumId}`)
}

export async function deleteComment(commentId: string, forumId: string) {
  const supabase = getServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("You must be logged in to delete a comment")
  }

  // Check if the user is the owner of the comment
  const { data: comment, error: commentError } = await supabase
    .from("comments")
    .select("user_id")
    .eq("id", commentId)
    .single()

  if (commentError) {
    console.error("Error fetching comment:", commentError)
    throw new Error("Failed to fetch comment")
  }

  if (comment.user_id !== user.id) {
    throw new Error("You can only delete your own comments")
  }

  const { error } = await supabase.from("comments").delete().eq("id", commentId)

  if (error) {
    console.error("Error deleting comment:", error)
    throw new Error("Failed to delete comment")
  }

  revalidatePath(`/forums/${forumId}`)
}

export async function toggleCommentLike(commentId: string, forumId: string) {
  const supabase = getServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("You must be logged in to like a comment")
  }

  // Check if the user has already liked the comment
  const { data: existingLike, error: likeError } = await supabase
    .from("comment_likes")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_id", user.id)
    .single()

  if (likeError && likeError.code !== "PGRST116") {
    console.error("Error checking comment like:", likeError)
    throw new Error("Failed to check comment like")
  }

  if (existingLike) {
    // Unlike the comment
    const { error } = await supabase.from("comment_likes").delete().eq("id", existingLike.id)

    if (error) {
      console.error("Error unliking comment:", error)
      throw new Error("Failed to unlike comment")
    }
  } else {
    // Like the comment
    const { error } = await supabase.from("comment_likes").insert({
      comment_id: commentId,
      user_id: user.id,
    })

    if (error) {
      console.error("Error liking comment:", error)
      throw new Error("Failed to like comment")
    }
  }

  revalidatePath(`/forums/${forumId}`)
}
