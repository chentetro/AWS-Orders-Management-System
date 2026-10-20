import axios from "axios";
import {
  subscribeToTopic,
  unsubscribeFromTopic,
} from "../services/subscriptionService";

vi.mock("axios");

describe("subscriptionService", () => {
  const mockedPost = vi.mocked(axios.post);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  beforeEach(() => {
    mockedPost.mockReset();
  });

  it("posts the email to the subscribe endpoint", async () => {
    mockedPost.mockResolvedValue({ data: {} });

    await subscribeToTopic("user@example.com");

    expect(mockedPost).toHaveBeenCalledWith(
      `${apiBaseUrl}/subscriptions/subscribe`,
      { email: "user@example.com" },
    );
  });

  it("posts the email to the unsubscribe endpoint", async () => {
    mockedPost.mockResolvedValue({ data: {} });

    await unsubscribeFromTopic("user@example.com");

    expect(mockedPost).toHaveBeenCalledWith(
      `${apiBaseUrl}/subscriptions/unsubscribe`,
      { email: "user@example.com" },
    );
  });

  it("propagates a backend Axios error from subscribeToTopic", async () => {
    const backendError = Object.assign(
      new Error("Request failed with status code 400"),
      {
        isAxiosError: true,
        response: {
          status: 400,
          data: { message: "Email already subscribed" },
        },
      },
    );
    mockedPost.mockRejectedValue(backendError);

    await expect(subscribeToTopic("user@example.com")).rejects.toMatchObject({
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: "Email already subscribed" },
      },
    });
  });

  it("propagates a backend Axios error from unsubscribeFromTopic", async () => {
    const backendError = Object.assign(
      new Error("Request failed with status code 400"),
      {
        isAxiosError: true,
        response: {
          status: 400,
          data: { message: "Email already subscribed" },
        },
      },
    );
    mockedPost.mockRejectedValue(backendError);

    await expect(
      unsubscribeFromTopic("user@example.com"),
    ).rejects.toMatchObject({
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: "Email already subscribed" },
      },
    });
  });

  it("propagates a network error from subscribeToTopic", async () => {
    mockedPost.mockRejectedValue(new Error("Network Error"));

    await expect(subscribeToTopic("user@example.com")).rejects.toThrow(
      "Network Error",
    );
  });

  it("propagates a network error from unsubscribeFromTopic", async () => {
    mockedPost.mockRejectedValue(new Error("Network Error"));

    await expect(unsubscribeFromTopic("user@example.com")).rejects.toThrow(
      "Network Error",
    );
  });
});
