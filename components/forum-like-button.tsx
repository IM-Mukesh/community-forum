"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { toggleForumLike } from "@/app/actions/forum-actions"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface ForumLikeButtonProps {
  forumId: string
  initialLiked: boolean
  likeCount: number
}

export function ForumLikeButton({ forumId, initialLiked, likeCount }: ForumLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(likeCount)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to like a forum.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Optimistic update
    setLiked(!liked)
    setCount((prev) => (liked ? prev - 1 : prev + 1))

    try {
      await toggleForumLike(forumId)
    } catch (error) {
      console.error("Error toggling like:", error)
      toast({
        title: "Error",
        description: "Failed to like forum. Please try again.",
        variant: "destructive",
      })
      // Revert optimistic update
      setLiked(initialLiked)
      setCount(likeCount)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isLoading || !user}
      className={liked ? "text-primary" : ""}
    >
      <ThumbsUp className={`h-4 w-4 mr-1 ${liked ? "fill-current" : ""}`} />
      <span>{count}</span>
    </Button>
  )
}
