import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not set");
}

export async function subscribeToTopic(email: string): Promise<void> {
  await axios.post(`${API_BASE_URL}/subscriptions/subscribe`, { email });
}

export async function unsubscribeFromTopic(email: string): Promise<void> {
  await axios.post(`${API_BASE_URL}/subscriptions/unsubscribe`, { email });
}
