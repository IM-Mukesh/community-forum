"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { createComment } from "@/app/actions/comment-actions"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { AlertCircle } from "lucide-react"

interface CommentFormProps {
  forumId: string
}

export function CommentForm({ forumId }: CommentFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const validateComment = () => {
    if (!content.trim()) {
      setError("Comment cannot be empty")
      return false
    }

    if (content.length < 3) {
      setError("Comment must be at least 3 characters")
      return false
    }

    if (content.length > 1000) {
      setError("Comment must be less than 1000 characters")
      return false
    }

    setError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to comment.",
        variant: "destructive",
      })
      return
    }

    if (!validateComment()) {
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("content", content)

      await createComment(forumId, formData)

      setContent("")
      setError(null)
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      })
    } catch (error) {
      console.error("Error submitting comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please log in to comment on this forum.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Textarea
              placeholder="Write your comment..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                if (error) validateComment()
              }}
              className={error ? "border-destructive" : ""}
              aria-invalid={error ? "true" : "false"}
              rows={4}
            />
            {error && (
              <p className="text-xs text-destructive flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {error}
              </p>
            )}
            <p className="text-xs text-muted-foreground text-right">{content.length}/1000 characters</p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t pt-4">
          <Button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
