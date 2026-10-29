import axios from "axios";
import type { DeletedOrdersSummary } from "../types/report";
import { API_BASE_URL } from "./apiBaseUrl";

export async function getDeletedOrdersSummary(): Promise<DeletedOrdersSummary> {
  const { data } = await axios.get<DeletedOrdersSummary>(
    `${API_BASE_URL}/deleted-orders/summary`,
  );
  return data;
}
