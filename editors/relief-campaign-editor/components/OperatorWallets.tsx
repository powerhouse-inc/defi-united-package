import { useState } from "react";

interface Props {
  wallets: string[];
  onAdd: (address: string) => void;
  onRemove: (address: string) => void;
}

export function OperatorWallets({ wallets, onAdd, onRemove }: Props) {
  const [address, setAddress] = useState("");

  function handleAdd() {
    if (!address.trim()) return;
    onAdd(address.trim());
    setAddress("");
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Operator wallets
        </h2>
        <span className="text-xs text-neutral-500">
          {wallets.length} authorized
        </span>
      </div>

      <p className="mb-3 text-xs text-neutral-500">
        Wallets in this list are authorized to write via the operations subgraph
        (Renown DID bearer auth).
      </p>

      {wallets.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2 text-xs italic text-neutral-500">
          No operator wallets configured.
        </p>
      ) : (
        <ul className="divide-y divide-neutral-100 overflow-hidden rounded-md border border-neutral-200">
          {wallets.map((address) => (
            <li
              key={address}
              className="flex items-center justify-between px-3 py-2"
            >
              <span className="font-mono text-xs text-neutral-900">
                {address}
              </span>
              <button
                type="button"
                onClick={() => onRemove(address)}
                className="rounded-md px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
        <input
          className="rfc-input font-mono text-xs"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x…"
          aria-label="Operator wallet address"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!address.trim()}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          Authorize wallet
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
