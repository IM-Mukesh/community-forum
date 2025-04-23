"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

export function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [isInitialized, setIsInitialized] = useState(false)

  // Update search query when URL changes, but only after initial render
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true)
      return
    }

    const query = searchParams.get("q") || ""
    if (query !== searchQuery) {
      setSearchQuery(query)
    }
  }, [searchParams, isInitialized, searchQuery])

  const updateUrl = useCallback(
    (query: string) => {
      // Create new URLSearchParams
      const params = new URLSearchParams(searchParams.toString())

      // Update or remove the search query
      if (query) {
        params.set("q", query)
      } else {
        params.delete("q")
      }

      // Navigate to the new URL
      router.push(`/?${params.toString()}`)
    },
    [router, searchParams],
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrl(searchQuery)
  }

  const clearSearch = () => {
    setSearchQuery("")
    updateUrl("")
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search forums..."
          className="pl-8 pr-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
    </form>
  )
}
