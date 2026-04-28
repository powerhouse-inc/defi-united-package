import { useMemo, useState } from "react";
import type { ContributorProfileDocument } from "../../../../../document-models/contributor-profile/v1/gen/types.js";

export interface ContributorSelection {
  // Either an existing profile id, OR a new-profile spec
  existingId?: string;
  newProfile?: {
    displayName: string;
    trustLevel: "VERIFIED" | "ANNOUNCED" | "ANONYMOUS";
    websiteUrl?: string;
    twitterHandle?: string;
    kind: "DAO" | "FOUNDATION" | "COMPANY" | "INDIVIDUAL";
  };
}

interface Props {
  profiles: ContributorProfileDocument[];
  value: ContributorSelection | null;
  onChange: (sel: ContributorSelection | null) => void;
}

export function ContributorPicker({ profiles, value, onChange }: Props) {
  const [query, setQuery] = useState(value?.newProfile?.displayName ?? "");
  const [showCreate, setShowCreate] = useState(!!value?.newProfile);

  const matches = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return profiles.slice(0, 8);
    return profiles
      .filter((p) => p.state.global.displayName?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [profiles, query]);

  const exactMatch = matches.find(
    (p) => p.state.global.displayName?.toLowerCase() === query.toLowerCase(),
  );

  return (
    <div className="defi-united-ops__cp">
      <input
        type="text"
        className="defi-united-ops__cp-input"
        placeholder="Search or type new name…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (showCreate) {
            onChange({
              ...value,
              newProfile: {
                displayName: e.target.value,
                trustLevel: value?.newProfile?.trustLevel ?? "ANNOUNCED",
                kind: value?.newProfile?.kind ?? "DAO",
                websiteUrl: value?.newProfile?.websiteUrl,
                twitterHandle: value?.newProfile?.twitterHandle,
              },
            });
          } else if (exactMatch) {
            onChange({ existingId: exactMatch.header.id });
          } else {
            onChange(null);
          }
        }}
      />

      {!showCreate && query && (
        <ul className="defi-united-ops__cp-list">
          {matches.map((p) => (
            <li
              key={p.header.id}
              className="defi-united-ops__cp-item"
              onClick={() => {
                onChange({ existingId: p.header.id });
                setQuery(p.state.global.displayName ?? "");
              }}
            >
              <span>{p.state.global.displayName}</span>
              <span className="defi-united-ops__cp-meta">
                {p.state.global.trustLevel ?? "—"}
                {p.state.global.twitterHandle
                  ? ` · @${p.state.global.twitterHandle}`
                  : ""}
              </span>
            </li>
          ))}
          {!exactMatch && query.trim().length >= 2 ? (
            <li
              className="defi-united-ops__cp-item defi-united-ops__cp-item--create"
              onClick={() => {
                setShowCreate(true);
                onChange({
                  newProfile: {
                    displayName: query,
                    trustLevel: "ANNOUNCED",
                    kind: "DAO",
                  },
                });
              }}
            >
              + Create new contributor &ldquo;{query}&rdquo;{" "}
              <kbd>⌘N</kbd>
            </li>
          ) : null}
        </ul>
      )}

      {showCreate && value?.newProfile ? (
        <div className="defi-united-ops__cp-subform">
          <small className="defi-united-ops__cp-subform-eyebrow">
            New contributor
          </small>
          <div className="defi-united-ops__cp-row">
            <label>Trust level</label>
            <select
              value={value.newProfile.trustLevel}
              onChange={(e) =>
                onChange({
                  newProfile: {
                    ...value.newProfile!,
                    trustLevel: e.target.value as
                      | "VERIFIED"
                      | "ANNOUNCED"
                      | "ANONYMOUS",
                  },
                })
              }
            >
              <option value="VERIFIED">VERIFIED</option>
              <option value="ANNOUNCED">ANNOUNCED</option>
              <option value="ANONYMOUS">ANONYMOUS</option>
            </select>
          </div>
          <div className="defi-united-ops__cp-row">
            <label>Kind</label>
            <select
              value={value.newProfile.kind}
              onChange={(e) =>
                onChange({
                  newProfile: {
                    ...value.newProfile!,
                    kind: e.target.value as
                      | "DAO"
                      | "FOUNDATION"
                      | "COMPANY"
                      | "INDIVIDUAL",
                  },
                })
              }
            >
              <option value="DAO">DAO</option>
              <option value="FOUNDATION">Foundation</option>
              <option value="COMPANY">Company</option>
              <option value="INDIVIDUAL">Individual</option>
            </select>
          </div>
          <div className="defi-united-ops__cp-row">
            <label>Website</label>
            <input
              type="url"
              value={value.newProfile.websiteUrl ?? ""}
              onChange={(e) =>
                onChange({
                  newProfile: {
                    ...value.newProfile!,
                    websiteUrl: e.target.value || undefined,
                  },
                })
              }
              placeholder="https://example.com"
            />
          </div>
          <div className="defi-united-ops__cp-row">
            <label>Twitter</label>
            <input
              type="text"
              value={value.newProfile.twitterHandle ?? ""}
              onChange={(e) =>
                onChange({
                  newProfile: {
                    ...value.newProfile!,
                    twitterHandle: e.target.value || undefined,
                  },
                })
              }
              placeholder="@handle"
            />
          </div>
          <button
            type="button"
            className="defi-united-ops__cp-cancel"
            onClick={() => {
              setShowCreate(false);
              onChange(null);
              setQuery("");
            }}
          >
            ← Pick existing instead
          </button>
        </div>
      ) : null}

      <style>{`
        .defi-united-ops__cp { position: relative; }
        .defi-united-ops__cp-input {
          width: 100%; padding: 8px 12px; font-size: 14px;
          border: 1px solid #d4d7e0; border-radius: 6px; box-sizing: border-box;
        }
        .defi-united-ops__cp-list {
          list-style: none; margin: 4px 0 0; padding: 4px;
          background: #fff; border: 1px solid #d4d7e0; border-radius: 6px;
          max-height: 280px; overflow-y: auto;
        }
        .defi-united-ops__cp-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 6px 8px; border-radius: 4px; cursor: pointer; font-size: 13px;
        }
        .defi-united-ops__cp-item:hover { background: #f1f3f7; }
        .defi-united-ops__cp-meta { color: #9aa1ad; font-size: 11px; }
        .defi-united-ops__cp-item--create {
          color: #1a4dd6; font-weight: 500;
          border-top: 1px dashed #e6e8ec; margin-top: 4px; padding-top: 8px;
        }
        .defi-united-ops__cp-item--create kbd {
          background: #f7f8fa; border: 1px solid #e6e8ec; border-radius: 4px;
          padding: 0 5px; font-family: ui-monospace, monospace; font-size: 10px; color: #525a6b;
        }
        .defi-united-ops__cp-subform {
          margin-top: 10px; padding: 12px;
          background: #f7f8fa; border-radius: 8px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .defi-united-ops__cp-subform-eyebrow {
          font-size: 10px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; color: #1a4dd6;
        }
        .defi-united-ops__cp-row {
          display: grid; grid-template-columns: 100px 1fr; align-items: center; gap: 8px;
        }
        .defi-united-ops__cp-row label { font-size: 12px; color: #525a6b; }
        .defi-united-ops__cp-row input,
        .defi-united-ops__cp-row select {
          padding: 6px 8px; font-size: 13px; border: 1px solid #d4d7e0; border-radius: 5px;
        }
        .defi-united-ops__cp-cancel {
          background: none; border: none; color: #6b7280; cursor: pointer;
          font-size: 12px; align-self: flex-start;
        }
        .defi-united-ops__cp-cancel:hover { color: #0f1115; text-decoration: underline; }
      `}</style>
    </div>
  );
}
