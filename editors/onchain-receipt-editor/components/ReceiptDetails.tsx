import type { OnchainReceiptState } from "../../../document-models/onchain-receipt/v1/gen/schema/types.js";
import {
  etherscanUrl,
  formatTimestamp,
  formatTokens,
  truncate,
} from "./constants.js";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[160px_minmax(0,1fr)] items-baseline gap-3 border-b border-neutral-100 py-2 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm text-neutral-800">
        {children}
      </dd>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[13px] text-neutral-800">{children}</span>
  );
}

export function ReceiptDetails({ state }: { state: OnchainReceiptState }) {
  const txUrl = etherscanUrl(state.txHash);
  const symbol = state.asset?.symbol ?? "—";
  const contract = state.asset?.contractAddress;

  return (
    <section className="rounded-xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">
        Receipt
      </h2>
      <dl className="mt-3">
        <Row label="Chain ID">
          <Mono>{state.chainId ?? "—"}</Mono>
        </Row>
        <Row label="Tx hash">
          {txUrl ? (
            <a
              href={txUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-[13px] text-sky-700 underline-offset-2 hover:underline"
            >
              {state.txHash}
            </a>
          ) : (
            <Mono>—</Mono>
          )}
        </Row>
        <Row label="Block number">
          <Mono>{state.blockNumber ?? "—"}</Mono>
        </Row>
        <Row label="Block timestamp">
          <span>{formatTimestamp(state.blockTimestamp)}</span>
        </Row>
        <Row label="From">
          <Mono>{state.fromAddress ?? "—"}</Mono>
        </Row>
        <Row label="To">
          <Mono>{state.toAddress ?? "—"}</Mono>
        </Row>
        <Row label="Asset">
          <span className="text-sm text-neutral-800">
            <span className="font-semibold">{symbol}</span>
            {contract ? (
              <>
                <span className="mx-2 text-neutral-300">·</span>
                <Mono>{contract}</Mono>
              </>
            ) : (
              <>
                <span className="mx-2 text-neutral-300">·</span>
                <span className="text-xs text-neutral-500">native</span>
              </>
            )}
          </span>
        </Row>
        <Row label="Amount">
          <span className="text-sm text-neutral-800">
            <span className="font-semibold">{formatTokens(state.amount)}</span>{" "}
            <span className="text-neutral-500">{symbol}</span>
          </span>
        </Row>
        <Row label="Matched pledge">
          {state.matchedPledgeId ? (
            <span title={state.matchedPledgeId}>
              <Mono>{truncate(state.matchedPledgeId, 8, 6)}</Mono>
            </span>
          ) : (
            <span className="text-neutral-400">—</span>
          )}
        </Row>
      </dl>
    </section>
  );
}
