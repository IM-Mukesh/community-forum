"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tag, X } from "lucide-react"

interface TagFilterProps {
  availableTags: string[]
}

export function TagFilter({ availableTags }: TagFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const tagParam = searchParams.get("tags")
    return tagParam ? tagParam.split(",") : []
  })

  // Use a ref to track if we're updating from URL changes
  const [isInitialized, setIsInitialized] = useState(false)

  // Update selected tags when URL changes, but only after initial render
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true)
      return
    }

    const tagParam = searchParams.get("tags")
    const newTags = tagParam ? tagParam.split(",") : []

    // Only update if the tags have actually changed
    if (JSON.stringify(newTags) !== JSON.stringify(selectedTags)) {
      setSelectedTags(newTags)
    }
  }, [searchParams, isInitialized, selectedTags])

  // Create a memoized function to update the URL
  const updateUrl = useCallback(
    (tags: string[]) => {
      // Create new URLSearchParams
      const params = new URLSearchParams(searchParams.toString())

      // Update or remove the tags parameter
      if (tags.length > 0) {
        params.set("tags", tags.join(","))
      } else {
        params.delete("tags")
      }

      // Navigate to the new URL
      router.push(`/?${params.toString()}`)
    },
    [router, searchParams],
  )

  const toggleTag = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]

    setSelectedTags(newSelectedTags)
    updateUrl(newSelectedTags)
  }

  const clearTags = () => {
    setSelectedTags([])
    updateUrl([])
  }

  if (availableTags.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center">
          <Tag className="mr-2 h-4 w-4" />
          Filter by Tags
        </h3>
        {selectedTags.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearTags} className="h-8 px-2 text-xs">
            Clear
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag)
          return (
            <Badge
              key={tag}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              {tag}
              {isSelected && <X className="ml-1 h-3 w-3" />}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
