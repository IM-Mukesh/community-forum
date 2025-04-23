"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ThumbsUp, Trash2 } from "lucide-react"
import type { CommentWithAuthor } from "@/types/database"
import { deleteComment, toggleCommentLike } from "@/app/actions/comment-actions"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface CommentListProps {
  comments: CommentWithAuthor[]
  forumId: string
  currentUserId?: string
}

export function CommentList({ comments, forumId, currentUserId }: CommentListProps) {
  const { toast } = useToast()
  const [optimisticComments, setOptimisticComments] = useState(comments)

  const handleLike = async (commentId: string) => {
    // Optimistic update
    setOptimisticComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          const isLiked = comment._count?.likes && comment._count.likes > 0
          return {
            ...comment,
            _count: {
              ...comment._count,
              likes: isLiked ? (comment._count?.likes || 1) - 1 : (comment._count?.likes || 0) + 1,
            },
          }
        }
        return comment
      }),
    )

    try {
      await toggleCommentLike(commentId, forumId)
    } catch (error) {
      console.error("Error toggling like:", error)
      toast({
        title: "Error",
        description: "Failed to like comment. Please try again.",
        variant: "destructive",
      })
      // Revert optimistic update
      setOptimisticComments(comments)
    }
  }

  const handleDelete = async (commentId: string) => {
    // Optimistic update
    setOptimisticComments((prev) => prev.filter((comment) => comment.id !== commentId))

    try {
      await deleteComment(commentId, forumId)
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      })
      // Revert optimistic update
      setOptimisticComments(comments)
    }
  }

  if (optimisticComments.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">No comments yet. Be the first to comment!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {optimisticComments.map((comment) => (
        <Card key={comment.id}>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={comment.author?.avatar_url || ""} alt={comment.author?.username || ""} />
                <AvatarFallback>{comment.author?.username?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{comment.author?.username || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  {currentUserId === comment.user_id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(comment.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                <p className="whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t pt-4">
            <Button variant="ghost" size="sm" onClick={() => handleLike(comment.id)} disabled={!currentUserId}>
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span>{comment._count?.likes || 0}</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
