import { useState } from "react";

import type {
  DistributionRecipient,
  DistributionStatus,
} from "../../../document-models/distribution-plan/v1/gen/schema/types.js";
import {
  CAN_EDIT_RECIPIENTS,
  CAN_MUTATE_RECIPIENT_STATUS,
  RECIPIENT_STATUS_BADGE,
  RECIPIENT_STATUS_LABEL,
  formatTokens,
  truncateAddress,
  truncateId,
} from "./constants.js";

interface RecipientsTableProps {
  planStatus: DistributionStatus;
  recipients: DistributionRecipient[];
  onAdd: (input: {
    address: string;
    chainId: number;
    allocatedAmount: number;
    rationale: string | null;
  }) => void;
  onUpdate: (input: {
    id: string;
    allocatedAmount: number | null;
    rationale: string | null;
  }) => void;
  onRemove: (id: string) => void;
  onMarkSent: (input: { id: string; txHash: string }) => void;
  onMarkFailed: (id: string) => void;
  onMarkRefunded: (id: string) => void;
}

export function RecipientsTable(props: RecipientsTableProps) {
  const {
    planStatus,
    recipients,
    onAdd,
    onUpdate,
    onRemove,
    onMarkSent,
    onMarkFailed,
    onMarkRefunded,
  } = props;

  const canEdit = CAN_EDIT_RECIPIENTS.includes(planStatus);
  const canMutateStatus = CAN_MUTATE_RECIPIENT_STATUS.includes(planStatus);

  const totalAllocated = recipients.reduce<number>(
    (sum, r) => sum + (r.allocatedAmount || 0),
    0,
  );
  const sentCount = recipients.filter((r) => r.status === "SENT").length;

  return (
    <section className="rounded-xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Recipients
        </h2>
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span>
            <span className="font-semibold text-neutral-900 tabular-nums">
              {recipients.length}
            </span>{" "}
            total
          </span>
          <span>
            <span className="font-semibold text-neutral-900 tabular-nums">
              {formatTokens(totalAllocated)}
            </span>{" "}
            allocated
          </span>
          <span>
            <span className="font-semibold text-neutral-900 tabular-nums">
              {sentCount}/{recipients.length}
            </span>{" "}
            sent
          </span>
        </div>
      </div>

      {recipients.length === 0 ? (
        <p className="mt-4 text-sm italic text-neutral-500">
          No recipients yet.
          {canEdit ? " Add the first allocation below." : ""}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-neutral-500">
                <th className="px-2 py-2">ID</th>
                <th className="px-2 py-2">Address</th>
                <th className="px-2 py-2">Chain</th>
                <th className="px-2 py-2 text-right">Allocated</th>
                <th className="px-2 py-2">Rationale</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Tx</th>
                <th className="px-2 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recipients.map((r) => (
                <RecipientRow
                  key={r.id}
                  recipient={r}
                  canEdit={canEdit}
                  canMutateStatus={canMutateStatus}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                  onMarkSent={onMarkSent}
                  onMarkFailed={onMarkFailed}
                  onMarkRefunded={onMarkRefunded}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canEdit ? <AddRecipientForm onAdd={onAdd} /> : null}
    </section>
  );
}

interface RecipientRowProps {
  recipient: DistributionRecipient;
  canEdit: boolean;
  canMutateStatus: boolean;
  onUpdate: (input: {
    id: string;
    allocatedAmount: number | null;
    rationale: string | null;
  }) => void;
  onRemove: (id: string) => void;
  onMarkSent: (input: { id: string; txHash: string }) => void;
  onMarkFailed: (id: string) => void;
  onMarkRefunded: (id: string) => void;
}

function RecipientRow(props: RecipientRowProps) {
  const {
    recipient,
    canEdit,
    canMutateStatus,
    onUpdate,
    onRemove,
    onMarkSent,
    onMarkFailed,
    onMarkRefunded,
  } = props;

  const [editing, setEditing] = useState(false);
  const [allocInput, setAllocInput] = useState<string>(
    String(recipient.allocatedAmount ?? ""),
  );
  const [rationaleInput, setRationaleInput] = useState<string>(
    recipient.rationale ?? "",
  );

  const [showSentForm, setShowSentForm] = useState(false);
  const [txHashInput, setTxHashInput] = useState<string>("");

  const badge = RECIPIENT_STATUS_BADGE[recipient.status];

  const handleSaveEdit = () => {
    const trimmedAlloc = allocInput.trim();
    let allocatedAmount: number | null = null;
    if (trimmedAlloc !== "") {
      const parsed = Number(trimmedAlloc);
      if (Number.isFinite(parsed)) allocatedAmount = parsed;
    }
    const rationale = rationaleInput.trim() === "" ? null : rationaleInput;
    onUpdate({ id: recipient.id, allocatedAmount, rationale });
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setAllocInput(String(recipient.allocatedAmount ?? ""));
    setRationaleInput(recipient.rationale ?? "");
    setEditing(false);
  };

  const handleSubmitSent = () => {
    const trimmed = txHashInput.trim();
    if (!trimmed) return;
    onMarkSent({ id: recipient.id, txHash: trimmed });
    setShowSentForm(false);
    setTxHashInput("");
  };

  return (
    <tr className="text-sm text-neutral-800">
      <td className="px-2 py-2 font-mono text-xs text-neutral-500">
        {truncateId(recipient.id)}
      </td>
      <td className="px-2 py-2 font-mono text-xs text-neutral-700">
        {truncateAddress(recipient.address)}
      </td>
      <td className="px-2 py-2 tabular-nums text-neutral-700">
        {recipient.chainId}
      </td>
      <td className="px-2 py-2 text-right tabular-nums">
        {editing ? (
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={allocInput}
            onChange={(e) => setAllocInput(e.target.value)}
            className="w-28 rounded-md border border-neutral-200 px-2 py-1 text-right text-sm tabular-nums focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        ) : (
          formatTokens(recipient.allocatedAmount)
        )}
      </td>
      <td className="px-2 py-2 max-w-[260px]">
        {editing ? (
          <input
            type="text"
            value={rationaleInput}
            onChange={(e) => setRationaleInput(e.target.value)}
            placeholder="optional"
            className="w-full rounded-md border border-neutral-200 px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        ) : (
          <span className="text-neutral-700">
            {recipient.rationale ?? "—"}
          </span>
        )}
      </td>
      <td className="px-2 py-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] ${badge.bg} ${badge.fg}`}
        >
          {RECIPIENT_STATUS_LABEL[recipient.status]}
        </span>
      </td>
      <td className="px-2 py-2 font-mono text-[11px] text-neutral-600">
        {recipient.txHash ? truncateAddress(recipient.txHash) : "—"}
      </td>
      <td className="px-2 py-2 text-right">
        <div className="flex flex-wrap justify-end gap-2">
          {canEdit ? (
            editing ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white hover:bg-neutral-800"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-md border border-neutral-200 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-md border border-neutral-200 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(recipient.id)}
                  className="rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                >
                  Remove
                </button>
              </>
            )
          ) : null}

          {canMutateStatus ? (
            showSentForm ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={txHashInput}
                  onChange={(e) => setTxHashInput(e.target.value)}
                  placeholder="0x…"
                  className="w-44 rounded-md border border-neutral-200 px-2 py-1 font-mono text-[11px] focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={handleSubmitSent}
                  disabled={!txHashInput.trim()}
                  className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSentForm(false);
                    setTxHashInput("");
                  }}
                  className="rounded-md border border-neutral-200 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowSentForm(true)}
                  className="rounded-md border border-emerald-200 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Mark sent
                </button>
                <button
                  type="button"
                  onClick={() => onMarkFailed(recipient.id)}
                  className="rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                >
                  Mark failed
                </button>
                <button
                  type="button"
                  onClick={() => onMarkRefunded(recipient.id)}
                  className="rounded-md border border-amber-200 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
                >
                  Mark refunded
                </button>
              </>
            )
          ) : null}
        </div>
      </td>
    </tr>
  );
}

interface AddRecipientFormProps {
  onAdd: (input: {
    address: string;
    chainId: number;
    allocatedAmount: number;
    rationale: string | null;
  }) => void;
}

function AddRecipientForm({ onAdd }: AddRecipientFormProps) {
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("1");
  const [allocatedAmount, setAllocatedAmount] = useState("");
  const [rationale, setRationale] = useState("");

  const valid =
    address.trim() !== "" &&
    chainId.trim() !== "" &&
    allocatedAmount.trim() !== "";

  const handleSubmit = () => {
    if (!valid) return;
    const parsedChain = Number(chainId);
    const parsedAlloc = Number(allocatedAmount);
    if (!Number.isFinite(parsedChain) || !Number.isFinite(parsedAlloc)) return;
    onAdd({
      address: address.trim(),
      chainId: parsedChain,
      allocatedAmount: parsedAlloc,
      rationale: rationale.trim() === "" ? null : rationale.trim(),
    });
    setAddress("");
    setChainId("1");
    setAllocatedAmount("");
    setRationale("");
  };

  return (
    <div className="mt-5 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-neutral-600">
        Add recipient
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-12">
        <input
          type="text"
          placeholder="0x… address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="md:col-span-4 rounded-md border border-neutral-200 px-3 py-1.5 font-mono text-xs focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder="chainId"
          value={chainId}
          onChange={(e) => setChainId(e.target.value)}
          className="md:col-span-1 rounded-md border border-neutral-200 px-3 py-1.5 text-sm tabular-nums focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <input
          type="number"
          inputMode="decimal"
          step="any"
          placeholder="amount"
          value={allocatedAmount}
          onChange={(e) => setAllocatedAmount(e.target.value)}
          className="md:col-span-2 rounded-md border border-neutral-200 px-3 py-1.5 text-sm tabular-nums focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <input
          type="text"
          placeholder="rationale (optional)"
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          className="md:col-span-4 rounded-md border border-neutral-200 px-3 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <button
          type="button"
          disabled={!valid}
          onClick={handleSubmit}
          className="md:col-span-1 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          Add
        </button>
      </div>
    </div>
  );
}
