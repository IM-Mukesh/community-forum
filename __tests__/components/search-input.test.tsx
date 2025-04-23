import { render, screen, fireEvent } from "@testing-library/react"
import { SearchInput } from "@/components/search-input"

describe("SearchInput", () => {
  it("renders the search input", () => {
    render(<SearchInput />)

    const searchInput = screen.getByPlaceholderText("Search forums...")
    expect(searchInput).toBeInTheDocument()
  })

  it("updates the search query when typing", () => {
    render(<SearchInput />)

    const searchInput = screen.getByPlaceholderText("Search forums...")
    fireEvent.change(searchInput, { target: { value: "test query" } })

    expect(searchInput).toHaveValue("test query")
  })

  it("shows the clear button when there is a search query", () => {
    render(<SearchInput />)

    const searchInput = screen.getByPlaceholderText("Search forums...")
    fireEvent.change(searchInput, { target: { value: "test query" } })

    const clearButton = screen.getByRole("button", { name: /clear search/i })
    expect(clearButton).toBeInTheDocument()
  })

  it("clears the search query when the clear button is clicked", () => {
    render(<SearchInput />)

    const searchInput = screen.getByPlaceholderText("Search forums...")
    fireEvent.change(searchInput, { target: { value: "test query" } })

    const clearButton = screen.getByRole("button", { name: /clear search/i })
    fireEvent.click(clearButton)

    expect(searchInput).toHaveValue("")
  })
})
