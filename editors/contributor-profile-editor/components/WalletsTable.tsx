import { useState } from "react";
import type { ContributorWallet } from "../../../document-models/contributor-profile/v1/gen/schema/types.js";

type Draft = {
  chainId: string;
  address: string;
  label: string;
};

const EMPTY_DRAFT: Draft = { chainId: "1", address: "", label: "" };

export function WalletsTable({
  wallets,
  onAdd,
  onRemove,
}: {
  wallets: ContributorWallet[];
  onAdd: (chainId: number, address: string, label: string | null) => void;
  onRemove: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const chainId = Number.parseInt(draft.chainId, 10);
    if (Number.isNaN(chainId) || chainId <= 0) {
      setError("Chain ID must be a positive integer.");
      return;
    }
    const address = draft.address.trim();
    if (!address) {
      setError("Address is required.");
      return;
    }

    onAdd(chainId, address, draft.label.trim() || null);
    setDraft(EMPTY_DRAFT);
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.06em] text-neutral-700">
            Wallet addresses
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Used by reconciliation to attribute on-chain receipts to this
            contributor.
          </p>
        </div>
        <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-400">
          {wallets.length} {wallets.length === 1 ? "wallet" : "wallets"}
        </span>
      </div>

      {wallets.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm italic text-neutral-500">
          No wallets registered yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-[11px] uppercase tracking-[0.06em] text-neutral-500">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Chain</th>
                <th className="px-3 py-2 text-left font-semibold">Address</th>
                <th className="px-3 py-2 text-left font-semibold">Label</th>
                <th className="px-3 py-2 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {wallets.map((w) => (
                <tr key={w.id} className="text-neutral-800">
                  <td className="px-3 py-2 font-mono text-xs text-neutral-600">
                    {w.chainId}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    <span className="break-all">{w.address}</span>
                  </td>
                  <td className="px-3 py-2 text-neutral-600">
                    {w.label ?? <span className="text-neutral-400">—</span>}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onRemove(w.id)}
                      className="cp-btn cp-btn-danger-ghost"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[100px_minmax(0,1fr)_minmax(0,1fr)_auto]"
      >
        <input
          type="number"
          min={1}
          value={draft.chainId}
          onChange={(e) => setDraft({ ...draft, chainId: e.target.value })}
          className="cp-input"
          placeholder="Chain ID"
          aria-label="Chain ID"
        />
        <input
          type="text"
          value={draft.address}
          onChange={(e) => setDraft({ ...draft, address: e.target.value })}
          className="cp-input font-mono text-xs"
          placeholder="0x…"
          aria-label="Wallet address"
        />
        <input
          type="text"
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          className="cp-input"
          placeholder="Label (optional)"
          aria-label="Wallet label"
        />
        <button type="submit" className="cp-btn cp-btn-primary">
          Add wallet
        </button>
      </form>
      {error ? (
        <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>
      ) : null}
    </section>
  );
}
