import axios from "axios";
import { API_BASE_URL } from "../services/apiBaseUrl";
import {
  subscribeToTopic,
  unsubscribeFromTopic,
} from "../services/subscriptionService";

vi.mock("axios");

describe("subscriptionService", () => {
  const mockedPost = vi.mocked(axios.post);

  beforeEach(() => {
    mockedPost.mockReset();
  });

  it("posts the email to the subscribe endpoint and returns the result", async () => {
    const response = {
      email: "user@example.com",
      message:
        "Confirmation email sent. The address receives delete notices only after it is confirmed.",
    };
    mockedPost.mockResolvedValue({ data: response });

    await expect(subscribeToTopic("user@example.com")).resolves.toEqual(
      response,
    );
    expect(mockedPost).toHaveBeenCalledWith(
      `${API_BASE_URL}/subscriptions/subscribe`,
      { email: "user@example.com" },
    );
  });

  it("posts the email to the unsubscribe endpoint and returns the result", async () => {
    const response = {
      email: "user@example.com",
      message: "Unsubscribed",
    };
    mockedPost.mockResolvedValue({ data: response });

    await expect(unsubscribeFromTopic("user@example.com")).resolves.toEqual(
      response,
    );
    expect(mockedPost).toHaveBeenCalledWith(
      `${API_BASE_URL}/subscriptions/unsubscribe`,
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
