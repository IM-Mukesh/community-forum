"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getBrowserClient } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Bell } from "lucide-react"
import type { NotificationPreferences } from "@/types/database"

export function NotificationPreferences() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const supabase = getBrowserClient()

  useEffect(() => {
    async function loadPreferences() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("notification_preferences")
            .eq("id", user.id)
            .single()

          if (error) {
            console.error("Error loading notification preferences:", error)
          } else {
            const prefs = data.notification_preferences as NotificationPreferences | null
            // If preferences exist and email_notifications is explicitly set to false, use that
            // Otherwise default to true
            setEmailNotifications(prefs ? prefs.email_notifications !== false : true)
          }
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [supabase])

  const savePreferences = async () => {
    setIsSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Not authenticated")
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          notification_preferences: {
            email_notifications: emailNotifications,
          },
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated.",
      })
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save notification preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading preferences...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>Manage how you receive notifications from Forum App</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email notifications when someone comments on your forums
            </p>
          </div>
          <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
        </div>

        <Button onClick={savePreferences} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  )
}
