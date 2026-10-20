import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ChangeEventHandler } from "react";
import Input from "../components/Input";

describe("Input", () => {
  it("renders the label linked to the input", () => {
    render(<Input id="price" label="Price" />);

    const input = screen.getByLabelText("Price");

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "price");
  });

  it("uses the default border and hides error text when no error is passed", () => {
    render(<Input id="price" label="Price" />);

    expect(screen.getByLabelText("Price")).toHaveClass("border-slate-300");
    expect(screen.queryByText("Field required")).not.toBeInTheDocument();
  });

  it("shows the error message and error border when error is passed", () => {
    render(<Input id="price" label="Price" error="Field required" />);

    const input = screen.getByLabelText("Price");
    const error = screen.getByText("Field required");

    expect(error).toHaveClass("text-red-600");
    expect(input).toHaveClass("border-red-400");
    expect(input).not.toHaveClass("border-slate-300");
  });

  it("calls onChange and updates the value when the user types", async () => {
    const user = userEvent.setup();
    const handleChange: ChangeEventHandler<HTMLInputElement> = vi.fn();

    render(<Input id="price" label="Price" onChange={handleChange} />);

    const input = screen.getByLabelText("Price");
    await user.type(input, "19.90");

    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue("19.90");
  });

  it("forwards native attributes to the input element", () => {
    render(
      <Input
        id="password"
        label="Password"
        disabled
        placeholder="Enter password"
        type="password"
      />,
    );

    const input = screen.getByLabelText("Password");

    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("placeholder", "Enter password");
    expect(input).toHaveAttribute("type", "password");
  });

  it("renders a ReactNode label", () => {
    render(
      <Input
        id="price"
        label={
          <>
            Price <span>*</span>
          </>
        }
      />,
    );

    expect(screen.getByLabelText(/Price/)).toBeInTheDocument();
    expect(screen.getByText("*").tagName).toBe("SPAN");
  });
});
