"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { createForum, updateForum } from "@/app/actions/forum-actions"
import { useToast } from "@/components/ui/use-toast"
import type { ForumWithAuthor } from "@/types/database"
import { AlertCircle } from "lucide-react"

interface ForumFormProps {
  forum?: ForumWithAuthor
}

export function ForumForm({ forum }: ForumFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{
    title?: string
    description?: string
  }>({})
  const router = useRouter()
  const { toast } = useToast()

  const tagsString = forum?.tags ? (Array.isArray(forum.tags) ? forum.tags.join(", ") : "") : ""

  const validateForm = (formData: FormData) => {
    const newErrors: {
      title?: string
      description?: string
    } = {}

    const title = formData.get("title") as string
    const description = formData.get("description") as string

    if (!title.trim()) {
      newErrors.title = "Title is required"
    } else if (title.length < 3) {
      newErrors.title = "Title must be at least 3 characters"
    } else if (title.length > 100) {
      newErrors.title = "Title must be less than 100 characters"
    }

    if (!description.trim()) {
      newErrors.description = "Description is required"
    } else if (description.length < 10) {
      newErrors.description = "Description must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    if (!validateForm(formData)) {
      return
    }

    setIsSubmitting(true)

    try {
      if (forum) {
        await updateForum(forum.id, formData)
      } else {
        await createForum(formData)
      }

      toast({
        title: forum ? "Forum updated" : "Forum created",
        description: forum ? "Your forum has been updated successfully." : "Your forum has been created successfully.",
      })
    } catch (error) {
      console.error("Error submitting forum:", error)
      toast({
        title: "Error",
        description: `Failed to ${forum ? "update" : "create"} forum. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center justify-between">
              Title
              {errors.title && (
                <span className="text-xs text-destructive flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.title}
                </span>
              )}
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={forum?.title}
              className={errors.title ? "border-destructive" : ""}
              aria-invalid={errors.title ? "true" : "false"}
              aria-describedby={errors.title ? "title-error" : undefined}
              placeholder="Enter a title for your forum"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center justify-between">
              Description
              {errors.description && (
                <span className="text-xs text-destructive flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.description}
                </span>
              )}
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={forum?.description}
              className={errors.description ? "border-destructive" : ""}
              aria-invalid={errors.description ? "true" : "false"}
              aria-describedby={errors.description ? "description-error" : undefined}
              placeholder="Describe your forum topic"
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" name="tags" defaultValue={tagsString} placeholder="react, nextjs, typescript" />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas (e.g., "react, nextjs, typescript")
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (forum ? "Updating..." : "Creating...") : forum ? "Update Forum" : "Create Forum"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
