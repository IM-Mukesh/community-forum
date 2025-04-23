import { render, screen, fireEvent } from "@testing-library/react"
import { ForumForm } from "@/components/forum-form"

// Mock the forum actions
jest.mock("@/app/actions/forum-actions", () => ({
  createForum: jest.fn(),
  updateForum: jest.fn(),
}))

// Mock the toast hook
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe("ForumForm", () => {
  it("renders the form fields", () => {
    render(<ForumForm />)

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /create forum/i })).toBeInTheDocument()
  })

  it("shows validation errors when submitting an empty form", () => {
    render(<ForumForm />)

    const submitButton = screen.getByRole("button", { name: /create forum/i })
    fireEvent.click(submitButton)

    expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    expect(screen.getByText(/description is required/i)).toBeInTheDocument()
  })

  it("shows validation errors when title is too short", () => {
    render(<ForumForm />)

    const titleInput = screen.getByLabelText(/title/i)
    fireEvent.change(titleInput, { target: { value: "ab" } })

    const submitButton = screen.getByRole("button", { name: /create forum/i })
    fireEvent.click(submitButton)

    expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument()
  })

  it("shows validation errors when description is too short", () => {
    render(<ForumForm />)

    const titleInput = screen.getByLabelText(/title/i)
    fireEvent.change(titleInput, { target: { value: "Valid Title" } })

    const descriptionInput = screen.getByLabelText(/description/i)
    fireEvent.change(descriptionInput, { target: { value: "Short" } })

    const submitButton = screen.getByRole("button", { name: /create forum/i })
    fireEvent.click(submitButton)

    expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument()
  })

  it("renders with existing forum data when provided", () => {
    const forum = {
      id: "1",
      title: "Test Forum",
      description: "This is a test forum description",
      tags: ["test", "forum"],
      user_id: "user1",
      created_at: new Date().toISOString(),
      author: null,
      _count: { comments: 0, likes: 0 },
    }

    render(<ForumForm forum={forum} />)

    expect(screen.getByLabelText(/title/i)).toHaveValue("Test Forum")
    expect(screen.getByLabelText(/description/i)).toHaveValue("This is a test forum description")
    expect(screen.getByLabelText(/tags/i)).toHaveValue("test, forum")
    expect(screen.getByRole("button", { name: /update forum/i })).toBeInTheDocument()
  })
})
