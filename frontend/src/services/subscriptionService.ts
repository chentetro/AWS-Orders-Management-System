import axios from "axios";
import type { SubscriptionResult } from "../types/subscription";
import { API_BASE_URL } from "./apiBaseUrl";

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
