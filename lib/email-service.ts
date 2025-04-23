"use server"

import sgMail from "@sendgrid/mail"

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "")

type EmailData = {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendEmail({ to, subject, text, html }: EmailData) {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM || "notifications@forumapp.com", // Use your verified sender
      subject,
      text,
      html,
    }

    await sgMail.send(msg)
    console.log(`Email sent to ${to}`)
    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

export async function sendCommentNotification({
  forumTitle,
  forumId,
  commentAuthor,
  commentContent,
  recipientEmail,
}: {
  forumTitle: string
  forumId: string
  commentAuthor: string
  commentContent: string
  recipientEmail: string
}) {
  const subject = `New comment on your forum: ${forumTitle}`

  // Create a preview of the comment content (first 100 characters)
  const contentPreview = commentContent.length > 100 ? `${commentContent.substring(0, 100)}...` : commentContent

  const text = `
    ${commentAuthor} commented on your forum "${forumTitle}":
    
    "${contentPreview}"
    
    View the full comment here: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/forums/${forumId}
    
    You're receiving this email because you created this forum. You can manage your notification settings in your profile.
  `

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Comment on Your Forum</h2>
      <p><strong>${commentAuthor}</strong> commented on your forum "<strong>${forumTitle}</strong>":</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p style="margin: 0; color: #555;">"${contentPreview}"</p>
      </div>
      
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/forums/${forumId}" 
           style="background-color: #0070f3; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Full Comment
        </a>
      </p>
      
      <p style="color: #777; font-size: 0.9em; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
        You're receiving this email because you created this forum. 
        You can manage your notification settings in your profile.
      </p>
    </div>
  `

  return sendEmail({
    to: recipientEmail,
    subject,
    text,
    html,
  })
}
