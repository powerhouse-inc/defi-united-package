import { useEffect, useState } from "react";
import type {
  GovernancePlatform,
  PledgeState,
} from "../../../document-models/pledge/v1/gen/types.js";
import { allowedActions } from "./constants.js";

const PLATFORMS: GovernancePlatform[] = [
  "SNAPSHOT",
  "TALLY",
  "FORUM",
  "AGORA",
  "OTHER",
];

export interface GovernanceHandlers {
  attachGovernance: (input: {
    platform: GovernancePlatform;
    proposalUrl: string;
    voteEndDate: string | null;
    quorumStatus: string | null;
  }) => void;
}

export function GovernanceSubform({
  state,
  on,
}: {
  state: PledgeState;
  on: GovernanceHandlers;
}) {
  const [open, setOpen] = useState<boolean>(Boolean(state.governance));

  const initial = state.governance;
  const [platform, setPlatform] = useState<GovernancePlatform>(
    initial?.platform ?? "SNAPSHOT",
  );
  const [proposalUrl, setProposalUrl] = useState<string>(
    initial?.proposalUrl ?? "",
  );
  const [voteEndDate, setVoteEndDate] = useState<string>(
    initial?.voteEndDate
      ? new Date(initial.voteEndDate).toISOString().slice(0, 16)
      : "",
  );
  const [quorumStatus, setQuorumStatus] = useState<string>(
    initial?.quorumStatus ?? "",
  );

  // Refresh local fields if doc state changes (e.g. another operator edits).
  useEffect(() => {
    if (!initial) return;
    setPlatform(initial.platform);
    setProposalUrl(initial.proposalUrl);
    setVoteEndDate(
      initial.voteEndDate
        ? new Date(initial.voteEndDate).toISOString().slice(0, 16)
        : "",
    );
    setQuorumStatus(initial.quorumStatus ?? "");
  }, [initial]);

  const canEdit = allowedActions(state.status).has("attachGovernance");

  return (
    <section className="pledge-card">
      <button
        type="button"
        className="pledge-card__collapse-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="pledge-card__title">
          Governance {state.governance ? "" : "(not attached)"}
        </span>
        <span className="pledge-card__chevron" aria-hidden>
          {open ? "▾" : "▸"}
        </span>
      </button>

      {open ? (
        <div className="pledge-form">
          <div className="pledge-form-row">
            <div className="pledge-form-group">
              <label className="pledge-label" htmlFor="pledge-gov-platform">
                Platform
              </label>
              <select
                id="pledge-gov-platform"
                className="pledge-input"
                value={platform}
                disabled={!canEdit}
                onChange={(e) =>
                  setPlatform(e.target.value as GovernancePlatform)
                }
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="pledge-form-group pledge-form-group--grow">
              <label className="pledge-label" htmlFor="pledge-gov-url">
                Proposal URL
              </label>
              <input
                id="pledge-gov-url"
                type="url"
                className="pledge-input"
                value={proposalUrl}
                disabled={!canEdit}
                onChange={(e) => setProposalUrl(e.target.value)}
                placeholder="https://snapshot.org/#/..."
              />
            </div>
          </div>

          <div className="pledge-form-row">
            <div className="pledge-form-group">
              <label className="pledge-label" htmlFor="pledge-gov-end">
                Vote end (UTC)
              </label>
              <input
                id="pledge-gov-end"
                type="datetime-local"
                className="pledge-input"
                value={voteEndDate}
                disabled={!canEdit}
                onChange={(e) => setVoteEndDate(e.target.value)}
              />
            </div>
            <div className="pledge-form-group pledge-form-group--grow">
              <label className="pledge-label" htmlFor="pledge-gov-quorum">
                Quorum status
              </label>
              <input
                id="pledge-gov-quorum"
                type="text"
                className="pledge-input"
                value={quorumStatus}
                disabled={!canEdit}
                onChange={(e) => setQuorumStatus(e.target.value)}
                placeholder="e.g. 12.4% / 4% required"
              />
            </div>
          </div>

          <div className="pledge-form-row">
            <button
              type="button"
              className="pledge-btn pledge-btn--primary"
              disabled={!canEdit || !proposalUrl.trim()}
              onClick={() =>
                on.attachGovernance({
                  platform,
                  proposalUrl: proposalUrl.trim(),
                  voteEndDate: voteEndDate
                    ? new Date(voteEndDate).toISOString()
                    : null,
                  quorumStatus: quorumStatus.trim() || null,
                })
              }
            >
              {state.governance ? "Update governance" : "Attach governance"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
