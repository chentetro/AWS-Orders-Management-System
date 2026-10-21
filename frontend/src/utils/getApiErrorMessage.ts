import { isAxiosError } from "axios";

export function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data: unknown = error.response?.data;

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}
