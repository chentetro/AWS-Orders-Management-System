import axios from "axios";
import { API_BASE_URL } from "./apiBaseUrl";

export type SubscriptionResult = {
  email: string;
  message: string;
};

export async function subscribeToTopic(
  email: string,
): Promise<SubscriptionResult> {
  const { data } = await axios.post<SubscriptionResult>(
    `${API_BASE_URL}/subscriptions/subscribe`,
    { email },
  );
  return data;
}

export async function unsubscribeFromTopic(
  email: string,
): Promise<SubscriptionResult> {
  const { data } = await axios.post<SubscriptionResult>(
    `${API_BASE_URL}/subscriptions/unsubscribe`,
    { email },
  );
  return data;
}
