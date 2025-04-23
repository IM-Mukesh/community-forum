"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import { MessageSquare, Plus, User, Menu, X } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const closeSheet = () => setIsOpen(false)

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="font-bold text-xl flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Forum App
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
            >
              Home
            </Link>
            {user && (
              <Link
                href="/profile"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/profile" ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                Profile
              </Link>
            )}
          </nav>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />

          {user ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/forums/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Forum
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || "")}&background=random`}
                        alt={user.email || ""}
                      />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between py-4">
                  <Link href="/" className="font-bold text-xl flex items-center" onClick={closeSheet}>
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Forum App
                  </Link>
                  <Button variant="ghost" size="icon" onClick={closeSheet}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>

                <nav className="flex flex-col space-y-4 py-4">
                  <Link
                    href="/"
                    className={`text-sm font-medium transition-colors ${
                      pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-primary"
                    }`}
                    onClick={closeSheet}
                  >
                    Home
                  </Link>
                  {user && (
                    <Link
                      href="/profile"
                      className={`text-sm font-medium transition-colors ${
                        pathname === "/profile" ? "text-primary" : "text-muted-foreground hover:text-primary"
                      }`}
                      onClick={closeSheet}
                    >
                      Profile
                    </Link>
                  )}
                </nav>

                <div className="mt-auto py-4">
                  {user ? (
                    <div className="space-y-4">
                      <Button asChild className="w-full" variant="outline">
                        <Link href="/forums/new" onClick={closeSheet}>
                          <Plus className="mr-2 h-4 w-4" />
                          New Forum
                        </Link>
                      </Button>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || "")}&background=random`}
                              alt={user.email || ""}
                            />
                            <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{user.email}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            signOut()
                            closeSheet()
                          }}
                        >
                          Log out
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Button asChild variant="outline">
                        <Link href="/login" onClick={closeSheet}>
                          Log in
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href="/signup" onClick={closeSheet}>
                          Sign up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
