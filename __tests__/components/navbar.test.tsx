import { render, screen } from "@testing-library/react"
import { Navbar } from "@/components/navbar"

describe("Navbar", () => {
  it("renders the logo and navigation links", () => {
    render(<Navbar />)

    expect(screen.getByText(/forum app/i)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument()
  })

  it("renders login and signup buttons when user is not logged in", () => {
    // The default mock for useAuth returns a null user
    render(<Navbar />)

    expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument()
  })

  it("renders user menu and new forum button when user is logged in", () => {
    // Override the mock to return a logged-in user
    jest.spyOn(require("@/contexts/auth-context"), "useAuth").mockImplementation(() => ({
      user: { id: "user1", email: "test@example.com" },
      session: { user: { id: "user1", email: "test@example.com" } },
      isLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    }))

    render(<Navbar />)

    expect(screen.getByRole("link", { name: /new forum/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /profile/i })).toBeInTheDocument()
  })
})
