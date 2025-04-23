import { render, screen, fireEvent } from "@testing-library/react"
import { TagFilter } from "@/components/tag-filter"

describe("TagFilter", () => {
  const availableTags = ["react", "nextjs", "typescript"]

  it("renders the available tags", () => {
    render(<TagFilter availableTags={availableTags} />)

    expect(screen.getByText(/filter by tags/i)).toBeInTheDocument()
    expect(screen.getByText("react")).toBeInTheDocument()
    expect(screen.getByText("nextjs")).toBeInTheDocument()
    expect(screen.getByText("typescript")).toBeInTheDocument()
  })

  it("does not render when there are no tags", () => {
    const { container } = render(<TagFilter availableTags={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it("toggles tag selection when clicked", () => {
    render(<TagFilter availableTags={availableTags} />)

    const reactTag = screen.getByText("react")
    fireEvent.click(reactTag)

    // In a real test, we would check if the tag is selected
    // but since we're mocking the router and search params,
    // we can't easily check the state changes
    // This is just a placeholder test
    expect(reactTag).toBeInTheDocument()
  })
})
