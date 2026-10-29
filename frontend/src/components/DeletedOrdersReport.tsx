import { useState } from "react";
import { getDeletedOrdersSummary } from "../services/summaryService";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import Button from "./Button";

export default function DeletedOrdersReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [reportUrl, setReportUrl] = useState<string | undefined>();

  async function handleViewReport() {
    setIsLoading(true);
    setError(undefined);
    setReportUrl(undefined);

    try {
      const summary = await getDeletedOrdersSummary();

      if (!summary.url) {
        setError("Summary did not include a download URL");
        return;
      }

      setReportUrl(summary.url);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="mt-0.5 text-lg font-semibold text-slate-900">
            Deleted orders report
          </h2>
          <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Amazon S3
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          disabled={isLoading}
          onClick={() => void handleViewReport()}
        >
          {isLoading ? "Generating..." : "View report"}
        </Button>
      </div>

      {error && (
        <p
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      {reportUrl && (
        <p className="mt-4 text-sm text-slate-600" role="status">
          Report ready.{" "}
          <a
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-orange-600 underline-offset-2 hover:underline"
          >
            Open PDF
          </a>
        </p>
      )}
    </section>
  );
}
