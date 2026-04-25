import type { StatusUpdateState } from "../../../document-models/status-update/v1/gen/schema/types.js";

interface ActionsCallbacks {
  saveDraft: () => void;
  publish: () => void;
  retract: () => void;
}

export function PublishActions({
  state,
  on,
}: {
  state: StatusUpdateState;
  on: ActionsCallbacks;
}) {
  const isPublished = Boolean(state.publishedAt);
  const canPublish = Boolean(state.title?.trim() && state.body?.trim());

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-neutral-500">
          {isPublished
            ? "This update is published. Changes will edit the published copy."
            : "Draft mode — Save to persist, Publish when ready."}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isPublished ? (
            <button
              type="button"
              onClick={on.saveDraft}
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50"
            >
              Save draft
            </button>
          ) : null}

          {!isPublished ? (
            <button
              type="button"
              onClick={on.publish}
              disabled={!canPublish}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
              title={
                canPublish
                  ? undefined
                  : "Title and body are required to publish"
              }
            >
              Publish
            </button>
          ) : null}

          {isPublished ? (
            <button
              type="button"
              onClick={on.retract}
              className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100"
            >
              Retract
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
