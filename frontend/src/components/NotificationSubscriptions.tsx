import { isAxiosError } from "axios";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  subscribeToTopic,
  unsubscribeFromTopic,
} from "../services/subscriptionService";
import Button from "./Button";
import Input from "./Input";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubscriptionAction = "subscribe" | "unsubscribe";

function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data: unknown = error.response?.data;

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;//הודעת שגיאה מהשרת שאני כתבתי , נמצא בשדה MESSAGE
    }

    return error.message;//הודעת שגיאה מובנית של AXIOS, אם לא כתבתי MESSAGE
  }

  if (error instanceof Error) {
    return error.message;//שגיאה שנזרקת מהפרונט, לא קיים כרגע בקוד
  }

  return "Something went wrong";
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9a6 6 0 1 1 12 0c0 3.5 1.5 5 2.5 6H3.5C4.5 14 6 12.5 6 9Z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  );
}

export default function NotificationSubscriptions() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
    setError(undefined);
  }

  function validateEmail(value: string): string | undefined {
    const trimmed = value.trim();

    if (!trimmed) {
      return "Email address is required";
    }

    if (!EMAIL_PATTERN.test(trimmed)) {
      return "Enter a valid email address";
    }

    return undefined;
  }

  async function handleAction(action: SubscriptionAction) {
    const validationError = validateEmail(email);

    if (validationError) {
      setSuccessMessage(undefined);
      setError(validationError);
      return;
    }

    const trimmedEmail = email.trim();

    setIsLoading(true);
    setError(undefined);
    setSuccessMessage(undefined);

    try {
      if (action === "subscribe") {
        await subscribeToTopic(trimmedEmail);
        setSuccessMessage(
          "Subscription started. Check your inbox to confirm the SNS email.",
        );
      } else {
        await unsubscribeFromTopic(trimmedEmail);
        setSuccessMessage("Unsubscribed successfully.");
      }

      setEmail("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleAction("subscribe");
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
          <BellIcon />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Notification subscriptions
          </h2>
          <p className="mt-0.5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Amazon SNS
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-600">
        Get notified whenever an order is created or changed.
      </p>

      {successMessage && (
        <p
          className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          role="status"
        >
          {successMessage}
        </p>
      )}

      <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          id="subscription-email"
          label="Email address"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={handleEmailChange}
          error={error}
          disabled={isLoading}
          autoComplete="email"
        />

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isLoading}>
            + Subscribe
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isLoading}
            onClick={() => void handleAction("unsubscribe")}
          >
            - Unsubscribe
          </Button>
        </div>
      </form>
    </section>
  );
}
