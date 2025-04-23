"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    username?: string
    general?: string
  }>({})
  const { signUp } = useAuth()
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: {
      email?: string
      password?: string
      username?: string
    } = {}

    if (!username.trim()) {
      newErrors.username = "Username is required"
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await signUp(email, password, username)
      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
      })
      // Force navigation to home page after successful sign up
      window.location.href = "/"
    } catch (error) {
      console.error("Signup error:", error)
      setErrors({
        ...errors,
        general: "Failed to create account. Email may already be in use.",
      })
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create an account to start using Forum App</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errors.general && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                <span>{errors.general}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center justify-between">
                Username
                {errors.username && (
                  <span className="text-xs text-destructive flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.username}
                  </span>
                )}
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  if (errors.username) {
                    setErrors({ ...errors, username: undefined })
                  }
                }}
                className={errors.username ? "border-destructive" : ""}
                aria-invalid={errors.username ? "true" : "false"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center justify-between">
                Email
                {errors.email && (
                  <span className="text-xs text-destructive flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.email}
                  </span>
                )}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined })
                  }
                }}
                className={errors.email ? "border-destructive" : ""}
                aria-invalid={errors.email ? "true" : "false"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center justify-between">
                Password
                {errors.password && (
                  <span className="text-xs text-destructive flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.password}
                  </span>
                )}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) {
                    setErrors({ ...errors, password: undefined })
                  }
                }}
                className={errors.password ? "border-destructive" : ""}
                aria-invalid={errors.password ? "true" : "false"}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
