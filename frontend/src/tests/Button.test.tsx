import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MouseEventHandler } from "react";
import Button from "../components/Button";

describe("Button", () => {
  it("renders text and element children", () => {
    render(
      <Button>
        Save <span>order</span>
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save order" });

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Save order");
    expect(screen.getByText("order").tagName).toBe("SPAN");
  });

  it("applies the primary variant when no variant is passed", () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole("button", { name: "Click me" })).toHaveClass(
      "bg-orange-500",
      "text-white",
    );
  });

  it("applies the secondary variant when it is specified", () => {
    render(<Button variant="secondary">Click me</Button>);

    const button = screen.getByRole("button", { name: "Click me" });

    expect(button).toHaveClass(
      "border-slate-300",
      "bg-white",
      "text-slate-700",
    );
    expect(button).not.toHaveClass("bg-orange-500");
  });

  it("calls onClick when the user clicks", async () => {
    const user = userEvent.setup();
    const handleClick: MouseEventHandler<HTMLButtonElement> = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole("button", { name: "Click me" }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when the button is disabled", async () => {
    const user = userEvent.setup();
    const handleClick: MouseEventHandler<HTMLButtonElement> = vi.fn();

    render(
      <Button disabled onClick={handleClick}>
        Click me
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Click me" });

    expect(button).toBeDisabled();
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
