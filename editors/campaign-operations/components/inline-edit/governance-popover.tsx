import { useState } from "react";
import { dispatchActions } from "@powerhousedao/reactor-browser";
import type { Action } from "document-model";
import { attachGovernance } from "../../../../document-models/pledge/v1/gen/lifecycle/creators.js";

interface GovernancePopoverProps {
  pledgeId: string;
  current?: {
    platform?: string | null;
    proposalUrl?: string | null;
    voteEndDate?: string | null;
  } | null;
}

export function GovernancePopover({
  pledgeId,
  current,
}: GovernancePopoverProps) {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState(current?.platform ?? "SNAPSHOT");
  const [proposalUrl, setProposalUrl] = useState(current?.proposalUrl ?? "");
  const [voteEndDate, setVoteEndDate] = useState(
    current?.voteEndDate ? current.voteEndDate.slice(0, 10) : "",
  );
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!proposalUrl.trim()) return;
    setBusy(true);
    try {
      await dispatchActions(
        attachGovernance({
          platform: platform as
            | "SNAPSHOT"
            | "TALLY"
            | "AGORA"
            | "FORUM"
            | "OTHER",
          proposalUrl: proposalUrl.trim(),
          voteEndDate: voteEndDate
            ? new Date(voteEndDate).toISOString()
            : undefined,
        }) as Action,
        pledgeId,
      );
      setOpen(false);
    } catch (e) {
      console.error("attachGovernance failed:", e);
    } finally {
      setBusy(false);
    }
  }

  const summary = current?.proposalUrl
    ? `↗ ${new URL(current.proposalUrl, "http://x").host}`
    : "+ Add governance link";

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        style={{
          background: "none",
          border: "none",
          color: "#1a4dd6",
          fontSize: 11,
          cursor: "pointer",
          padding: 0,
          textDecoration: "none",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.textDecoration = "underline")
        }
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
      >
        {summary}
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 4,
            background: "#fff",
            border: "1px solid #e6e8ec",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(15,17,21,0.10)",
            padding: 12,
            zIndex: 10,
            minWidth: 280,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            style={{
              padding: "4px 6px",
              fontSize: 12,
              border: "1px solid #d4d7e0",
              borderRadius: 4,
            }}
          >
            <option>SNAPSHOT</option>
            <option>TALLY</option>
            <option>AGORA</option>
            <option>FORUM</option>
            <option>OTHER</option>
          </select>
          <input
            type="url"
            value={proposalUrl}
            onChange={(e) => setProposalUrl(e.target.value)}
            placeholder="https://snapshot.org/..."
            style={{
              padding: "4px 6px",
              fontSize: 12,
              border: "1px solid #d4d7e0",
              borderRadius: 4,
            }}
          />
          <input
            type="date"
            value={voteEndDate}
            onChange={(e) => setVoteEndDate(e.target.value)}
            style={{
              padding: "4px 6px",
              fontSize: 12,
              border: "1px solid #d4d7e0",
              borderRadius: 4,
            }}
          />
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                flex: 1,
                padding: "5px 10px",
                border: "1px solid #d4d7e0",
                borderRadius: 4,
                background: "#fff",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={busy || !proposalUrl.trim()}
              style={{
                flex: 1,
                padding: "5px 10px",
                border: "none",
                borderRadius: 4,
                background: "#1a4dd6",
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {busy ? "…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </span>
  );
}
