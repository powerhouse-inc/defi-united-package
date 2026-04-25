import { useState } from "react";
import type { RecordReceiptInput } from "../../../document-models/onchain-receipt/v1/gen/schema/types.js";

type Props = {
  onSubmit: (input: RecordReceiptInput) => void;
};

const inputClass =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500";
const monoInputClass = `${inputClass} font-mono`;
const labelClass =
  "block text-xs font-semibold uppercase tracking-wide text-neutral-600 mb-1";

type FormState = {
  chainId: string;
  txHash: string;
  blockNumber: string;
  blockTimestamp: string;
  fromAddress: string;
  toAddress: string;
  assetSymbol: string;
  contractAddress: string;
  amount: string;
  rawLog: string;
};

const initialState: FormState = {
  chainId: "1",
  txHash: "",
  blockNumber: "",
  blockTimestamp: "",
  fromAddress: "",
  toAddress: "",
  assetSymbol: "",
  contractAddress: "",
  amount: "",
  rawLog: "",
};

export function RecordReceiptForm({ onSubmit }: Props) {
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const chainId = Number(form.chainId);
    const blockNumber = Number(form.blockNumber);
    const amount = Number(form.amount);

    if (!form.txHash.trim()) return setError("Tx hash is required");
    if (!Number.isFinite(chainId) || chainId <= 0)
      return setError("Chain ID must be a positive integer");
    if (!Number.isFinite(blockNumber) || blockNumber < 0)
      return setError("Block number must be a non-negative integer");
    if (!form.blockTimestamp) return setError("Block timestamp is required");
    if (!form.fromAddress.trim()) return setError("From address is required");
    if (!form.toAddress.trim()) return setError("To address is required");
    if (!form.assetSymbol.trim()) return setError("Asset symbol is required");
    if (!Number.isFinite(amount)) return setError("Amount must be a number");

    const timestampISO = new Date(form.blockTimestamp).toISOString();

    onSubmit({
      chainId,
      txHash: form.txHash.trim(),
      blockNumber,
      blockTimestamp: timestampISO,
      fromAddress: form.fromAddress.trim(),
      toAddress: form.toAddress.trim(),
      asset: {
        symbol: form.assetSymbol.trim(),
        contractAddress: form.contractAddress.trim() || null,
      },
      amount,
      rawLog: form.rawLog.trim() || null,
    });
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">
        Record receipt
      </h2>
      <p className="mt-1 text-xs text-neutral-500">
        Manually create an on-chain receipt. Normally the
        onchain-receipt-watcher processor populates this automatically.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Chain ID</label>
          <input
            className={inputClass}
            type="number"
            value={form.chainId}
            onChange={(e) => update("chainId", e.target.value)}
            placeholder="1"
          />
        </div>
        <div>
          <label className={labelClass}>Block number</label>
          <input
            className={inputClass}
            type="number"
            value={form.blockNumber}
            onChange={(e) => update("blockNumber", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Tx hash</label>
          <input
            className={monoInputClass}
            value={form.txHash}
            onChange={(e) => update("txHash", e.target.value)}
            placeholder="0x…"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Block timestamp</label>
          <input
            className={inputClass}
            type="datetime-local"
            value={form.blockTimestamp}
            onChange={(e) => update("blockTimestamp", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>From address</label>
          <input
            className={monoInputClass}
            value={form.fromAddress}
            onChange={(e) => update("fromAddress", e.target.value)}
            placeholder="0x…"
          />
        </div>
        <div>
          <label className={labelClass}>To address</label>
          <input
            className={monoInputClass}
            value={form.toAddress}
            onChange={(e) => update("toAddress", e.target.value)}
            placeholder="0x… (one of the campaign's contribution addresses)"
          />
        </div>
        <div>
          <label className={labelClass}>Asset symbol</label>
          <input
            className={inputClass}
            value={form.assetSymbol}
            onChange={(e) => update("assetSymbol", e.target.value)}
            placeholder="rsETH"
          />
        </div>
        <div>
          <label className={labelClass}>Contract address (optional)</label>
          <input
            className={monoInputClass}
            value={form.contractAddress}
            onChange={(e) => update("contractAddress", e.target.value)}
            placeholder="0x… (leave empty for native ETH)"
          />
        </div>
        <div>
          <label className={labelClass}>Amount</label>
          <input
            className={inputClass}
            type="number"
            step="any"
            value={form.amount}
            onChange={(e) => update("amount", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Raw log (optional, JSON-encoded)</label>
          <textarea
            className={`${monoInputClass} min-h-[96px]`}
            value={form.rawLog}
            onChange={(e) => update("rawLog", e.target.value)}
            placeholder='{"topics":[…],"data":"0x…"}'
          />
        </div>

        {error ? (
          <div className="sm:col-span-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md border border-sky-600 bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            Record receipt
          </button>
        </div>
      </form>
    </section>
  );
}
