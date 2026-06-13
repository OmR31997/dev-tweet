import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders label", () => {
    render(<Button>Sign in</Button>);
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole("button", { name: "Outline" });
    expect(button.className).toMatch(/border/);
  });

  it("can render as child slot", () => {
    render(
      <Button asChild>
        <a href="/login">Login link</a>
      </Button>
    );
    expect(screen.getByRole("link", { name: "Login link" })).toBeInTheDocument();
  });
});
