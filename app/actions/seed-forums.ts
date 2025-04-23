"use server"

import { getServerClient } from "@/lib/supabase"

export async function seedForums() {
  const supabase = getServerClient()

  // Check if there are any forums already
  const { data: existingForums, error: checkError } = await supabase.from("forums").select("id").limit(1)

  if (checkError) {
    console.error("Error checking existing forums:", checkError)
    return { success: false, error: checkError.message }
  }

  // If forums already exist, don't seed
  if (existingForums && existingForums.length > 0) {
    return { success: true, message: "Forums already exist, no seeding needed" }
  }

  // Create a test user if needed
  const { data: existingUsers, error: userCheckError } = await supabase.from("profiles").select("id").limit(1)

  if (userCheckError) {
    console.error("Error checking existing users:", userCheckError)
    return { success: false, error: userCheckError.message }
  }

  let userId = existingUsers?.[0]?.id

  if (!userId) {
    // Create a test user
    const { data: newUser, error: signUpError } = await supabase.auth.signUp({
      email: "test@example.com",
      password: "password123",
      options: {
        data: {
          username: "TestUser",
        },
      },
    })

    if (signUpError) {
      console.error("Error creating test user:", signUpError)
      return { success: false, error: signUpError.message }
    }

    userId = newUser.user?.id

    // Create profile
    if (userId) {
      await supabase.from("profiles").insert({
        id: userId,
        username: "TestUser",
        avatar_url: `https://ui-avatars.com/api/?name=TestUser&background=random`,
      })
    }
  }

  if (!userId) {
    return { success: false, error: "Could not get or create a user ID for seeding" }
  }

  // Sample forums to seed
  const sampleForums = [
    {
      title: "Welcome to Forum App",
      description:
        "This is the first forum post in our application. Feel free to explore the features and start discussions!",
      tags: ["welcome", "introduction", "getting-started"],
      user_id: userId,
    },
    {
      title: "How to use Markdown in comments",
      description:
        "Did you know you can use Markdown formatting in your comments? This post explains the basics of Markdown syntax.",
      tags: ["markdown", "formatting", "tips"],
      user_id: userId,
    },
    {
      title: "Feature Request: Dark Mode",
      description:
        "I think it would be great if the app had a dark mode option. What do you think? Would you use dark mode if it was available?",
      tags: ["feature-request", "dark-mode", "ui"],
      user_id: userId,
    },
    {
      title: "Introducing yourself",
      description:
        "Use this thread to introduce yourself to the community. Tell us about your interests and background!",
      tags: ["introductions", "community"],
      user_id: userId,
    },
    {
      title: "Bug Report: Mobile Navigation",
      description:
        "I've noticed some issues with the mobile navigation menu. Sometimes it doesn't close properly after selecting an option.",
      tags: ["bug", "mobile", "navigation"],
      user_id: userId,
    },
  ]

  // Insert the sample forums
  const { error: insertError } = await supabase.from("forums").insert(sampleForums)

  if (insertError) {
    console.error("Error seeding forums:", insertError)
    return { success: false, error: insertError.message }
  }

  return { success: true, message: "Forums seeded successfully" }
}
