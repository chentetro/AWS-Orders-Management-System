import axios from "axios";
import { API_BASE_URL } from "./apiBaseUrl";

export async function subscribeToTopic(email: string): Promise<void> {
  await axios.post(`${API_BASE_URL}/subscriptions/subscribe`, { email });
}

export async function unsubscribeFromTopic(email: string): Promise<void> {
  await axios.post(`${API_BASE_URL}/subscriptions/unsubscribe`, { email });
}
