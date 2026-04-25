import type { ReactNode } from "react";
import { useState } from "react";
import type { CampaignStatus } from "../../../document-models/relief-campaign/v1/gen/schema/types.js";
import {
  CAN_ARCHIVE,
  CAN_FAIL,
  CAN_RESOLVE,
  CAN_START,
} from "./constants.js";

interface Props {
  status: CampaignStatus;
  onStart: () => void;
  onResolve: () => void;
  onFail: (reason: string) => void;
  onArchive: () => void;
}

export function LifecycleActions({
  status,
  onStart,
  onResolve,
  onFail,
  onArchive,
}: Props) {
  const [showFailReason, setShowFailReason] = useState(false);
  const [reason, setReason] = useState("");

  const canStart = CAN_START.includes(status);
  const canResolve = CAN_RESOLVE.includes(status);
  const canFail = CAN_FAIL.includes(status);
  const canArchive = CAN_ARCHIVE.includes(status);

  function submitFail() {
    onFail(reason.trim());
    setShowFailReason(false);
    setReason("");
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        Lifecycle
      </h2>

      <div className="flex flex-wrap gap-2">
        <LifecycleButton
          enabled={canStart}
          tone="primary"
          onClick={onStart}
          tooltip={canStart ? undefined : "Only available from DRAFT"}
        >
          Start campaign
        </LifecycleButton>
        <LifecycleButton
          enabled={canResolve}
          tone="success"
          onClick={onResolve}
          tooltip={
            canResolve ? undefined : "Only available from ACTIVE / EXECUTING"
          }
        >
          Mark resolved
        </LifecycleButton>
        <LifecycleButton
          enabled={canFail}
          tone="danger"
          onClick={() => setShowFailReason(true)}
          tooltip={canFail ? undefined : "Already terminal"}
        >
          Mark failed
        </LifecycleButton>
        <LifecycleButton
          enabled={canArchive}
          tone="neutral"
          onClick={onArchive}
          tooltip={
            canArchive ? undefined : "Only after RESOLVED / FAILED"
          }
        >
          Archive
        </LifecycleButton>
      </div>

      {showFailReason ? (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3">
          <label className="block text-xs font-medium text-rose-900">
            Reason (optional)
          </label>
          <input
            className="mt-1 w-full rounded-md border border-rose-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-rose-500 focus:outline-none"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why did this campaign fail?"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowFailReason(false);
                setReason("");
              }}
              className="rounded-md px-3 py-1.5 text-xs text-neutral-600 hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitFail}
              className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
            >
              Confirm fail
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

type LifecycleTone = "primary" | "success" | "danger" | "neutral";

const TONE_CLASSES: Record<LifecycleTone, string> = {
  primary: "bg-neutral-900 text-white hover:bg-neutral-800",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
  danger: "border border-rose-300 bg-white text-rose-700 hover:bg-rose-50",
  neutral:
    "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50",
};

function LifecycleButton({
  enabled,
  tone,
  onClick,
  tooltip,
  children,
}: {
  enabled: boolean;
  tone: LifecycleTone;
  onClick: () => void;
  tooltip?: string;
  children: ReactNode;
}) {

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!enabled}
      title={tooltip}
      className={`rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${TONE_CLASSES[tone]}`}
    >
      {children}
    </button>
  );
}
