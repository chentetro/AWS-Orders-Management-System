import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, type AxiosResponse } from "axios";
import NotificationSubscriptions from "../components/NotificationSubscriptions";
import {
  subscribeToTopic,
  unsubscribeFromTopic,
} from "../services/subscriptionService";

vi.mock("../services/subscriptionService", () => ({
  subscribeToTopic: vi.fn(),
  unsubscribeFromTopic: vi.fn(),
}));

const mockSubscribeToTopic = vi.mocked(subscribeToTopic);
const mockUnsubscribeFromTopic = vi.mocked(unsubscribeFromTopic);

function createAxiosError(message: string): AxiosError<{ message: string }> {
  return new AxiosError(
    "Request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status: 400,
      statusText: "Bad Request",
      data: { message },
      headers: {},
      config: {} as AxiosResponse["config"],
    },
  );
}

describe("NotificationSubscriptions", () => {
  beforeEach(() => {
    mockSubscribeToTopic.mockReset();
    mockUnsubscribeFromTopic.mockReset();
  });

  it("renders the subscription card", () => {
    render(<NotificationSubscriptions />);

    expect(
      screen.getByRole("heading", { name: "Notification subscriptions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Get notified by email whenever an order is deleted."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "+ Subscribe" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "- Unsubscribe" }),
    ).toBeInTheDocument();
  });

  it("shows a required-email error and does not call the API", async () => {
    const user = userEvent.setup();

    render(<NotificationSubscriptions />);

    await user.click(screen.getByRole("button", { name: "+ Subscribe" }));

    expect(screen.getByText("Email address is required")).toBeInTheDocument();
    expect(mockSubscribeToTopic).not.toHaveBeenCalled();
    expect(mockUnsubscribeFromTopic).not.toHaveBeenCalled();
  });

  it("shows an invalid-email error and does not call the API", async () => {
    const user = userEvent.setup();

    render(<NotificationSubscriptions />);

    await user.type(screen.getByLabelText("Email address"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "- Unsubscribe" }));

    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
    expect(mockSubscribeToTopic).not.toHaveBeenCalled();
    expect(mockUnsubscribeFromTopic).not.toHaveBeenCalled();
  });

  it("clears the validation error as the user types", async () => {
    const user = userEvent.setup();

    render(<NotificationSubscriptions />);

    await user.click(screen.getByRole("button", { name: "+ Subscribe" }));
    expect(screen.getByText("Email address is required")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Email address"), "a");

    expect(
      screen.queryByText("Email address is required"),
    ).not.toBeInTheDocument();
  });

  it("subscribes successfully, shows a banner, and clears the email", async () => {
    const user = userEvent.setup();
    mockSubscribeToTopic.mockResolvedValue({
      email: "user@example.com",
      message:
        "Confirmation email sent. The address receives delete notices only after it is confirmed.",
    });

    render(<NotificationSubscriptions />);

    const input = screen.getByLabelText("Email address");
    await user.type(input, "  user@example.com  ");
    await user.click(screen.getByRole("button", { name: "+ Subscribe" }));

    await waitFor(() => {
      expect(mockSubscribeToTopic).toHaveBeenCalledWith("user@example.com");
    });
    expect(
      screen.getByText(
        "Confirmation email sent. The address receives delete notices only after it is confirmed.",
      ),
    ).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("unsubscribes successfully, shows a banner, and clears the email", async () => {
    const user = userEvent.setup();
    mockUnsubscribeFromTopic.mockResolvedValue({
      email: "user@example.com",
      message: "Unsubscribed",
    });

    render(<NotificationSubscriptions />);

    const input = screen.getByLabelText("Email address");
    await user.type(input, "user@example.com");
    await user.click(screen.getByRole("button", { name: "- Unsubscribe" }));

    await waitFor(() => {
      expect(mockUnsubscribeFromTopic).toHaveBeenCalledWith("user@example.com");
    });
    expect(screen.getByText("Unsubscribed")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("shows the API error message on the input when subscribe fails", async () => {
    const user = userEvent.setup();
    mockSubscribeToTopic.mockRejectedValue(
      createAxiosError("email must be a valid email address"),
    );

    render(<NotificationSubscriptions />);

    await user.type(screen.getByLabelText("Email address"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "+ Subscribe" }));

    expect(
      await screen.findByText("email must be a valid email address"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("disables the input and buttons while a request is in progress", async () => {
    const user = userEvent.setup();
    let resolveSubscribe:
      ((value: { email: string; message: string }) => void) | undefined;
    mockSubscribeToTopic.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubscribe = resolve;
        }),
    );

    render(<NotificationSubscriptions />);

    const input = screen.getByLabelText("Email address");
    const subscribeButton = screen.getByRole("button", { name: "+ Subscribe" });
    const unsubscribeButton = screen.getByRole("button", {
      name: "- Unsubscribe",
    });

    await user.type(input, "user@example.com");
    await user.click(subscribeButton);

    expect(input).toBeDisabled();
    expect(subscribeButton).toBeDisabled();
    expect(unsubscribeButton).toBeDisabled();

    resolveSubscribe?.({
      email: "user@example.com",
      message: "Confirmation email sent.",
    });

    await waitFor(() => {
      expect(input).not.toBeDisabled();
      expect(subscribeButton).not.toBeDisabled();
      expect(unsubscribeButton).not.toBeDisabled();
    });
  });
});
