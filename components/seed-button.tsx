"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { seedForums } from "@/app/actions/seed-forums"
import { useToast } from "@/hooks/use-toast"
import { Loader2, SproutIcon as Seedling } from "lucide-react"
import { useRouter } from "next/navigation"

export function SeedButton() {
  const [isSeeding, setIsSeeding] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSeed = async () => {
    setIsSeeding(true)

    try {
      const result = await seedForums()

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Forums seeded successfully. Refreshing page...",
        })
        // Refresh the page to show the new forums
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to seed forums",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error seeding forums:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <Button onClick={handleSeed} disabled={isSeeding} variant="outline" size="sm">
      {isSeeding ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Seeding...
        </>
      ) : (
        <>
          <Seedling className="mr-2 h-4 w-4" />
          Seed Sample Forums
        </>
      )}
    </Button>
  )
}
