import { useState } from "react";
import type { PledgeState } from "../../../document-models/pledge/v1/gen/types.js";

export interface ProposeHandlers {
  proposePledge: (input: {
    contributorProfileId: string;
    pledgedAmount: number;
    asset: { symbol: string; address: string | null; chainId: number };
    publicNotes: string | null;
    internalNotes: string | null;
  }) => void;
}

/**
 * Shown when the pledge has not yet been "proposed" with full details
 * (i.e. core fields like contributorProfileId / pledgedAmount / asset are
 * still empty, even though the default status is PROPOSED).
 */
export function ProposeForm({
  state,
  on,
}: {
  state: PledgeState;
  on: ProposeHandlers;
}) {
  const [contributorProfileId, setContributorProfileId] = useState("");
  const [pledgedAmount, setPledgedAmount] = useState("");
  const [symbol, setSymbol] = useState("rsETH");
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("1");
  const [publicNotes, setPublicNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const ready =
    contributorProfileId.trim().length > 0 &&
    pledgedAmount.length > 0 &&
    Number.isFinite(Number(pledgedAmount)) &&
    symbol.trim().length > 0 &&
    chainId.length > 0 &&
    Number.isFinite(Number(chainId));

  // Hide if the pledge already has details (treat presence of contributorProfileId as "proposed").
  if (state.contributorProfileId) return null;

  return (
    <section className="pledge-card">
      <h2 className="pledge-card__title">Propose pledge</h2>
      <p className="pledge-meta">
        This pledge has no contributor or amount set yet. Fill in the core
        details to formally propose it.
      </p>

      <div className="pledge-form-row">
        <div className="pledge-form-group pledge-form-group--grow">
          <label className="pledge-label" htmlFor="propose-contributor">
            Contributor profile (PHID)
          </label>
          <input
            id="propose-contributor"
            type="text"
            className="pledge-input"
            value={contributorProfileId}
            onChange={(e) => setContributorProfileId(e.target.value)}
            placeholder="phid:contributor-profile:..."
          />
        </div>
        <div className="pledge-form-group">
          <label className="pledge-label" htmlFor="propose-amount">
            Pledged amount
          </label>
          <input
            id="propose-amount"
            type="number"
            step="any"
            className="pledge-input"
            value={pledgedAmount}
            onChange={(e) => setPledgedAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="pledge-form-row">
        <div className="pledge-form-group">
          <label className="pledge-label" htmlFor="propose-symbol">
            Asset symbol
          </label>
          <input
            id="propose-symbol"
            type="text"
            className="pledge-input"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
        </div>
        <div className="pledge-form-group">
          <label className="pledge-label" htmlFor="propose-chain">
            Chain ID
          </label>
          <input
            id="propose-chain"
            type="number"
            className="pledge-input"
            value={chainId}
            onChange={(e) => setChainId(e.target.value)}
          />
        </div>
        <div className="pledge-form-group pledge-form-group--grow">
          <label className="pledge-label" htmlFor="propose-address">
            Asset address (optional, native ETH = blank)
          </label>
          <input
            id="propose-address"
            type="text"
            className="pledge-input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
          />
        </div>
      </div>

      <div className="pledge-form-group">
        <label className="pledge-label" htmlFor="propose-public-notes">
          Public notes (optional)
        </label>
        <textarea
          id="propose-public-notes"
          className="pledge-textarea"
          rows={2}
          value={publicNotes}
          onChange={(e) => setPublicNotes(e.target.value)}
        />
      </div>

      <div className="pledge-form-group">
        <label className="pledge-label" htmlFor="propose-internal-notes">
          Internal notes (optional)
        </label>
        <textarea
          id="propose-internal-notes"
          className="pledge-textarea"
          rows={2}
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
        />
      </div>

      <div className="pledge-form-row">
        <button
          type="button"
          className="pledge-btn pledge-btn--primary"
          disabled={!ready}
          onClick={() =>
            on.proposePledge({
              contributorProfileId: contributorProfileId.trim(),
              pledgedAmount: Number(pledgedAmount),
              asset: {
                symbol: symbol.trim(),
                address: address.trim() ? address.trim() : null,
                chainId: Number(chainId),
              },
              publicNotes: publicNotes.trim() || null,
              internalNotes: internalNotes.trim() || null,
            })
          }
        >
          Propose pledge
        </button>
      </div>
    </section>
  );
}
