import { useState } from "react";
import type { ContributionAddress } from "../../../document-models/relief-campaign/v1/gen/schema/types.js";

interface Props {
  addresses: ContributionAddress[];
  onAdd: (input: {
    chainId: number;
    address: string;
    label: string | null;
  }) => void;
  onRemove: (id: string) => void;
}

export function ContributionAddresses({ addresses, onAdd, onRemove }: Props) {
  const [chainId, setChainId] = useState<string>("1");
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");

  function handleAdd() {
    const cid = Number(chainId);
    if (!Number.isFinite(cid) || !address.trim()) return;
    onAdd({
      chainId: cid,
      address: address.trim(),
      label: label.trim() || null,
    });
    setAddress("");
    setLabel("");
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Contribution addresses
        </h2>
        <span className="text-xs text-neutral-500">
          {addresses.length} configured
        </span>
      </div>

      {addresses.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2 text-xs italic text-neutral-500">
          No contribution addresses configured. Add at least one before starting
          the campaign.
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-[11px] uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-3 py-2 font-medium">Chain</th>
                <th className="px-3 py-2 font-medium">Address</th>
                <th className="px-3 py-2 font-medium">Label</th>
                <th className="w-12 px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {addresses.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-neutral-100 align-middle"
                >
                  <td className="px-3 py-2 font-mono text-xs text-neutral-700">
                    {a.chainId}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-neutral-900">
                    {a.address}
                  </td>
                  <td className="px-3 py-2 text-neutral-700">
                    {a.label ?? <span className="text-neutral-400">—</span>}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onRemove(a.id)}
                      className="rounded-md px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                      aria-label="Remove contribution address"
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

      <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-[80px_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <input
          className="rfc-input"
          inputMode="numeric"
          value={chainId}
          onChange={(e) => setChainId(e.target.value)}
          placeholder="Chain"
          aria-label="Chain ID"
        />
        <input
          className="rfc-input font-mono text-xs"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x…"
          aria-label="Address"
        />
        <input
          className="rfc-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (optional)"
          aria-label="Address label"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!address.trim()}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          Add address
        </button>
      </div>

      <style>{`
        .rfc-input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          color: #111827;
          background-color: #fff;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .rfc-input:focus {
          outline: none;
          border-color: #1a4dd6;
          box-shadow: 0 0 0 3px rgba(26, 77, 214, 0.12);
        }
      `}</style>
    </section>
  );
}
