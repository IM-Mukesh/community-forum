import Link from "next/link"
import { getForums, getAllTags } from "./actions/forum-actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, ThumbsUp, Filter, Plus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { SearchInput } from "@/components/search-input"
import { TagFilter } from "@/components/tag-filter"
import { Pagination } from "@/components/pagination"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { getServerClient } from "@/lib/supabase"
import { SeedButton } from "@/components/seed-button"

export default async function Home({
  searchParams,
}: {
  searchParams: { q?: string; tags?: string; page?: string }
}) {
  // Get the current page number
  const currentPage = Number.parseInt(searchParams.page || "1", 10)
  const pageSize = 12

  // Get forums with search and filter parameters
  const forums = await getForums(searchParams)

  // Get all unique tags for the filter
  const allTags = await getAllTags()

  // Check if user is authenticated
  const supabase = getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if there are any forums in the database
  const { data: allForumsInDb, error: dbError } = await supabase.from("forums").select("id")
  const hasForums = allForumsInDb && allForumsInDb.length > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-3xl font-bold">Forums</h1>

          <div className="flex space-x-2">
            {/* Seed button - only show if no forums exist */}
            {!hasForums && <SeedButton />}

            {/* Add New Forum button for authenticated users */}
            {user && (
              <Button asChild variant="default" size="sm" className="hidden md:flex">
                <Link href="/forums/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Forum
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile filter button */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="py-4">
                  <h2 className="text-lg font-semibold mb-4">Filters</h2>
                  <div className="space-y-4">
                    <SearchInput />
                    <Card>
                      <CardContent className="pt-6">
                        <TagFilter availableTags={allTags} />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop search */}
        <div className="hidden md:block w-full md:w-auto">
          <SearchInput />
        </div>

        {/* Mobile search */}
        <div className="md:hidden w-full">
          <SearchInput />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop sidebar */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <TagFilter availableTags={allTags} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {forums.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No forums found</h2>
              <p className="text-muted-foreground mb-6">
                {searchParams.q || searchParams.tags
                  ? "Try adjusting your search or filters"
                  : hasForums
                    ? "No forums match your criteria"
                    : "Be the first to create a forum or use the seed button to add sample forums!"}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {!hasForums && (
                  <div className="mb-4 sm:mb-0">
                    <SeedButton />
                  </div>
                )}
                {user ? (
                  <Button asChild>
                    <Link href="/forums/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Forum
                    </Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href="/login?callbackUrl=/forums/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Sign in to Create Forum
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                {forums.map((forum) => (
                  <Link key={forum.id} href={`/forums/${forum.id}`} className="block">
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={forum.author?.avatar_url || ""} alt={forum.author?.username || ""} />
                            <AvatarFallback>{forum.author?.username?.charAt(0) || "?"}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{forum.author?.username || "Unknown"}</span>
                        </div>
                        <CardTitle className="line-clamp-1">{forum.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{forum.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(forum.tags) &&
                            forum.tags.slice(0, 3).map((tag: any, i: number) => (
                              <Badge key={i} variant="secondary">
                                {typeof tag === 'string' ? tag : tag?.name ?? 'Unknown'}
                              </Badge>
                            ))}

                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4 w-full">
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span>{forum._count?.comments || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            <span>{forum._count?.likes || 0}</span>
                          </div>
                          <div className="ml-auto">
                            {formatDistanceToNow(new Date(forum.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalItems={forums.length >= pageSize ? (currentPage + 1) * pageSize : currentPage * pageSize}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
