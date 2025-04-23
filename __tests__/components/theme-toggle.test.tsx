import { render, screen, fireEvent } from "@testing-library/react"
import { ThemeToggle } from "@/components/theme-toggle"

describe("ThemeToggle", () => {
  it("renders the theme toggle button", () => {
    render(<ThemeToggle />)

    const toggleButton = screen.getByRole("button", { name: /toggle theme/i })
    expect(toggleButton).toBeInTheDocument()
  })

  it("opens the dropdown menu when clicked", () => {
    render(<ThemeToggle />)

    const toggleButton = screen.getByRole("button", { name: /toggle theme/i })
    fireEvent.click(toggleButton)

    expect(screen.getByRole("menuitem", { name: /light/i })).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: /dark/i })).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: /system/i })).toBeInTheDocument()
  })
})
