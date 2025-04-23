"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell } from "lucide-react"

interface NotificationSentAlertProps {
  recipientEmail: string
}

export function NotificationSentAlert({ recipientEmail }: NotificationSentAlertProps) {
  return (
    <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
      <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertTitle className="text-green-800 dark:text-green-300">Notification Sent</AlertTitle>
      <AlertDescription className="text-green-700 dark:text-green-400">
        An email notification has been sent to the forum owner at {recipientEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3")}
      </AlertDescription>
    </Alert>
  )
}
