"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  pageSize: number
  totalItems: number
}

export function Pagination({ currentPage, pageSize, totalItems }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const totalPages = Math.ceil(totalItems / pageSize)

  // If there's only one page, don't show pagination
  if (totalPages <= 1) {
    return null
  }

  const handlePageChange = (page: number) => {
    // Create new URLSearchParams
    const params = new URLSearchParams(searchParams)

    // Update the page parameter
    params.set("page", page.toString())

    // Navigate to the new URL
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous Page</span>
      </Button>

      <div className="text-sm">
        Page {currentPage} of {totalPages}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next Page</span>
      </Button>
    </div>
  )
}
