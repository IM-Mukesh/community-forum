import { redirect } from "next/navigation"
import { getServerClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { NotificationPreferences } from "@/components/notification-preferences"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile | Forum App",
  description: "View and manage your profile, forums, and comments",
}

export default async function ProfilePage() {
  const supabase = getServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profileError) {
    console.error("Error fetching profile:", profileError)
  }

  // Get user's forums
  const { data: forums, error: forumsError } = await supabase
    .from("forums")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (forumsError) {
    console.error("Error fetching forums:", forumsError)
  }

  // Get user's comments
  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (commentsError) {
    console.error("Error fetching comments:", commentsError)
  }

  // Get forum IDs from comments
  const forumIds = [...new Set(comments?.map((comment) => comment.forum_id) || [])]

  // Get forum titles
  const { data: forumTitles, error: forumTitlesError } = await supabase
    .from("forums")
    .select("id, title")
    .in("id", forumIds.length > 0 ? forumIds : ["no-forums"])

  if (forumTitlesError) {
    console.error("Error fetching forum titles:", forumTitlesError)
  }

  // Combine comments with forum titles
  const commentsWithForums =
    comments?.map((comment) => {
      const forum = forumTitles?.find((f) => f.id === comment.forum_id)
      return {
        ...comment,
        forums: forum || { title: "Unknown Forum" },
      }
    }) || []

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || ""} alt={profile?.username || ""} />
              <AvatarFallback>{profile?.username?.charAt(0) || user.email?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl">{profile?.username || "User"}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="forums">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="forums" className="flex-1 sm:flex-none">
            My Forums <span className="ml-1 text-xs">({forums?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex-1 sm:flex-none">
            My Comments <span className="ml-1 text-xs">({comments?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 sm:flex-none">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forums" className="mt-6">
          {!forums || forums.length === 0 ? (
            <Card>
              <CardContent className="py-6">
                <p className="text-center text-muted-foreground">You haven&apos;t created any forums yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {forums.map((forum) => (
                <Card key={forum.id}>
                  <CardContent className="p-4">
                    <Link
                      href={`/forums/${forum.id}`}
                      className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <h3 className="font-semibold">{forum.title}</h3>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(forum.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{forum.description}</p>

                        {Array.isArray(forum.tags) && forum.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {forum.tags.map((tag, i) => (
                              <Badge key={i} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          {!commentsWithForums || commentsWithForums.length === 0 ? (
            <Card>
              <CardContent className="py-6">
                <p className="text-center text-muted-foreground">You haven&apos;t commented on any forums yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {commentsWithForums.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <Link
                          href={`/forums/${comment.forum_id}`}
                          className="font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                        >
                          {comment.forums?.title}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <NotificationPreferences />
        </TabsContent>
      </Tabs>
    </div>
  )
}
