"use server"

import { revalidatePath } from "next/cache"
import { getServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import type { ForumWithAuthor } from "@/types/database"

export async function getForums(searchParams?: {
  q?: string
  tags?: string
  page?: string
  limit?: string
}): Promise<ForumWithAuthor[]> {
  const supabase = getServerClient()

  // Parse pagination parameters
  const page = Number.parseInt(searchParams?.page || "1", 10)
  const limit = Number.parseInt(searchParams?.limit || "12", 10)
  const offset = (page - 1) * limit

  // Start building the query
  let query = supabase.from("forums").select("*")

  // Apply search filter if provided
  if (searchParams?.q) {
    const searchTerm = searchParams.q.trim()
    query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
  }

  // Apply tags filter if provided
  if (searchParams?.tags) {
    const tags = searchParams.tags.split(",")
    // For each tag, check if it exists in the JSONB array
    tags.forEach((tag) => {
      query = query.contains("tags", [tag])
    })
  }

  // Apply pagination and ordering
  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

  // Execute the query
  const { data: forums, error } = await query

  if (error) {
    console.error("Error fetching forums:", error)
    return []
  }

  // If no forums found, return empty array
  if (!forums || forums.length === 0) {
    return []
  }

  // Get user IDs from forums
  const userIds = [...new Set(forums.map((forum) => forum.user_id))]

  // Get profiles for those users
  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("id", userIds)

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError)
  }

  // Get all comments for these forums
  const forumIds = forums.map((forum) => forum.id)
  const { data: comments, error: commentError } = await supabase
    .from("comments")
    .select("forum_id")
    .in("forum_id", forumIds)

  if (commentError) {
    console.error("Error fetching comments:", commentError)
  }

  // Get all likes for these forums
  const { data: likes, error: likeError } = await supabase
    .from("forum_likes")
    .select("forum_id")
    .in("forum_id", forumIds)

  if (likeError) {
    console.error("Error fetching likes:", likeError)
  }

  // Count comments and likes manually
  const commentCounts = forumIds.reduce(
    (acc, forumId) => {
      acc[forumId] = comments?.filter((comment) => comment.forum_id === forumId).length || 0
      return acc
    },
    {} as Record<string, number>,
  )

  const likeCounts = forumIds.reduce(
    (acc, forumId) => {
      acc[forumId] = likes?.filter((like) => like.forum_id === forumId).length || 0
      return acc
    },
    {} as Record<string, number>,
  )

  // Combine the data
  const forumsWithCounts = forums.map((forum) => {
    const author = profiles?.find((profile) => profile.id === forum.user_id) || null
    const commentCount = commentCounts[forum.id] || 0
    const likeCount = likeCounts[forum.id] || 0

    return {
      ...forum,
      author,
      _count: {
        comments: commentCount,
        likes: likeCount,
      },
    }
  })

  console.log("Forums fetched:", forumsWithCounts.length)
  return forumsWithCounts
}

// Add a new function to get all unique tags
export async function getAllTags(): Promise<string[]> {
  const supabase = getServerClient()

  const { data: forums, error } = await supabase.from("forums").select("tags")

  if (error) {
    console.error("Error fetching tags:", error)
    return []
  }

  // Extract all tags from forums and flatten the array
  const allTags = forums.flatMap((forum) => forum.tags || []).filter(Boolean) as string[]

  // Remove duplicates and sort
  const uniqueTags = [...new Set(allTags)].sort()

  return uniqueTags
}

export async function getForum(id: string): Promise<ForumWithAuthor | null> {
  // Validate UUID format to prevent database errors
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    console.error(`Invalid UUID format: ${id}`)
    return null
  }

  const supabase = getServerClient()

  // Get the forum
  const { data: forum, error } = await supabase.from("forums").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching forum:", error)
    return null
  }

  // Get the author profile
  const { data: author, error: authorError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", forum.user_id)
    .single()

  if (authorError) {
    console.error("Error fetching author:", authorError)
  }

  // Get comments count
  const { data: comments, error: commentError } = await supabase.from("comments").select("id").eq("forum_id", id)

  if (commentError) {
    console.error("Error fetching comments:", commentError)
  }

  // Get likes count
  const { data: likes, error: likeError } = await supabase.from("forum_likes").select("id").eq("forum_id", id)

  if (likeError) {
    console.error("Error fetching likes:", likeError)
  }

  return {
    ...forum,
    author: author || null,
    _count: {
      comments: comments?.length || 0,
      likes: likes?.length || 0,
    },
  }
}

export async function createForum(formData: FormData) {
  const supabase = getServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("You must be logged in to create a forum")
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const tagsString = formData.get("tags") as string

  // Parse tags
  const tags = tagsString
    ? tagsString
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : []

  const { error } = await supabase.from("forums").insert({
    title,
    description,
    tags,
    user_id: user.id,
  })

  if (error) {
    console.error("Error creating forum:", error)
    throw new Error("Failed to create forum")
  }

  revalidatePath("/")
  redirect("/")
}

export async function updateForum(id: string, formData: FormData) {
  const supabase = getServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("You must be logged in to update a forum")
  }

  // Check if the user is the owner of the forum
  const { data: forum, error: forumError } = await supabase.from("forums").select("user_id").eq("id", id).single()

  if (forumError) {
    console.error("Error fetching forum:", forumError)
    throw new Error("Failed to fetch forum")
  }

  if (forum.user_id !== user.id) {
    throw new Error("You can only update your own forums")
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const tagsString = formData.get("tags") as string

  // Parse tags
  const tags = tagsString
    ? tagsString
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : []

  const { error } = await supabase
    .from("forums")
    .update({
      title,
      description,
      tags,
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating forum:", error)
    throw new Error("Failed to update forum")
  }

  revalidatePath(`/forums/${id}`)
  redirect(`/forums/${id}`)
}

export async function deleteForum(id: string) {
  const supabase = getServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("You must be logged in to delete a forum")
  }

  // Check if the user is the owner of the forum
  const { data: forum, error: forumError } = await supabase.from("forums").select("user_id").eq("id", id).single()

  if (forumError) {
    console.error("Error fetching forum:", forumError)
    throw new Error("Failed to fetch forum")
  }

  if (forum.user_id !== user.id) {
    throw new Error("You can only delete your own forums")
  }

  const { error } = await supabase.from("forums").delete().eq("id", id)

  if (error) {
    console.error("Error deleting forum:", error)
    throw new Error("Failed to delete forum")
  }

  revalidatePath("/")
  redirect("/")
}

export async function toggleForumLike(forumId: string) {
  const supabase = getServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("You must be logged in to like a forum")
  }

  // Check if the user has already liked the forum
  const { data: existingLike, error: likeError } = await supabase
    .from("forum_likes")
    .select("id")
    .eq("forum_id", forumId)
    .eq("user_id", user.id)
    .single()

  if (likeError && likeError.code !== "PGRST116") {
    console.error("Error checking forum like:", likeError)
    throw new Error("Failed to check forum like")
  }

  if (existingLike) {
    // Unlike the forum
    const { error } = await supabase.from("forum_likes").delete().eq("id", existingLike.id)

    if (error) {
      console.error("Error unliking forum:", error)
      throw new Error("Failed to unlike forum")
    }
  } else {
    // Like the forum
    const { error } = await supabase.from("forum_likes").insert({
      forum_id: forumId,
      user_id: user.id,
    })

    if (error) {
      console.error("Error liking forum:", error)
      throw new Error("Failed to like forum")
    }
  }

  revalidatePath(`/forums/${forumId}`)
}
