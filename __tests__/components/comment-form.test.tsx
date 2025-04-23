import { render, screen, fireEvent } from "@testing-library/react"
import { CommentForm } from "@/components/comment-form"

// Mock the comment actions
jest.mock("@/app/actions/comment-actions", () => ({
  createComment: jest.fn(),
}))

// Mock the toast hook
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock the auth context with a logged-in user
jest.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    user: { id: "user1", email: "test@example.com" },
    session: { user: { id: "user1", email: "test@example.com" } },
    isLoading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  }),
}))

describe("CommentForm", () => {
  it("renders the comment form when user is logged in", () => {
    render(<CommentForm forumId="forum1" />)

    expect(screen.getByPlaceholderText(/write your comment/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /post comment/i })).toBeInTheDocument()
  })

  it("disables the submit button when comment is empty", () => {
    render(<CommentForm forumId="forum1" />)

    const submitButton = screen.getByRole("button", { name: /post comment/i })
    expect(submitButton).toBeDisabled()
  })

  it("enables the submit button when comment is not empty", () => {
    render(<CommentForm forumId="forum1" />)

    const commentInput = screen.getByPlaceholderText(/write your comment/i)
    fireEvent.change(commentInput, { target: { value: "This is a test comment" } })

    const submitButton = screen.getByRole("button", { name: /post comment/i })
    expect(submitButton).not.toBeDisabled()
  })

  it("shows validation error when comment is too short", () => {
    render(<CommentForm forumId="forum1" />)

    const commentInput = screen.getByPlaceholderText(/write your comment/i)
    fireEvent.change(commentInput, { target: { value: "Hi" } })

    const submitButton = screen.getByRole("button", { name: /post comment/i })
    fireEvent.click(submitButton)

    expect(screen.getByText(/comment must be at least 3 characters/i)).toBeInTheDocument()
  })

  it("shows character count", () => {
    render(<CommentForm forumId="forum1" />)

    const commentInput = screen.getByPlaceholderText(/write your comment/i)
    fireEvent.change(commentInput, { target: { value: "This is a test comment" } })

    expect(screen.getByText(/22\/1000 characters/i)).toBeInTheDocument()
  })
})
