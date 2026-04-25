import type { ReconciliationStatus } from "../../../document-models/onchain-receipt/v1/gen/schema/types.js";
import { STATUS_BADGE, STATUS_LABEL } from "./constants.js";

export function StatusBadge({ status }: { status: ReconciliationStatus }) {
  const badge = STATUS_BADGE[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ring-1 ring-inset ${badge.bg} ${badge.fg} ${badge.ring}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
