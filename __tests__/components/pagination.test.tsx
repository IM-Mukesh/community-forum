import { render, screen } from "@testing-library/react"
import { Pagination } from "@/components/pagination"

describe("Pagination", () => {
  it("renders pagination controls when there are multiple pages", () => {
    render(<Pagination currentPage={2} pageSize={10} totalItems={30} />)

    expect(screen.getByText(/page 2 of 3/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /next page/i })).toBeInTheDocument()
  })

  it("disables the previous button on the first page", () => {
    render(<Pagination currentPage={1} pageSize={10} totalItems={30} />)

    const prevButton = screen.getByRole("button", { name: /previous page/i })
    expect(prevButton).toBeDisabled()
  })

  it("disables the next button on the last page", () => {
    render(<Pagination currentPage={3} pageSize={10} totalItems={30} />)

    const nextButton = screen.getByRole("button", { name: /next page/i })
    expect(nextButton).toBeDisabled()
  })

  it("does not render pagination when there is only one page", () => {
    const { container } = render(<Pagination currentPage={1} pageSize={10} totalItems={5} />)

    expect(container).toBeEmptyDOMElement()
  })
})
