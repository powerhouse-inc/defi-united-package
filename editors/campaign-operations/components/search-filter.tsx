import { useEffect, useRef } from "react";

import type { PledgeDocument } from "../../../document-models/pledge/v1/gen/types.js";
import type { ExternalDependencyDocument } from "../../../document-models/external-dependency/v1/gen/types.js";
import type { OnchainReceiptDocument } from "../../../document-models/onchain-receipt/v1/gen/types.js";
import type { StatusUpdateDocument } from "../../../document-models/status-update/v1/gen/types.js";
import type { ContributorProfileDocument } from "../../../document-models/contributor-profile/v1/gen/types.js";

export interface SearchFilterState {
  searchQuery: string;
  statusFilter: string | null;
}

export interface SearchFilterProps {
  value: SearchFilterState;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: string | null) => void;
  onClear: () => void;
}

const STATUS_OPTIONS = [
  { label: "All statuses", value: null },
  { label: "Proposed", value: "PROPOSED" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
  { label: "Cancelled", value: "CANCELLED" },
] as const;

const PLEDGE_STATUS_MAP: Record<string, string[]> = {
  PROPOSED: ["PROPOSED"],
  CONFIRMED: ["CONFIRMED"],
  IN_PROGRESS: ["GOVERNANCE_PENDING", "CONFIRMED"],
  COMPLETED: ["RECEIVED"],
  FAILED: ["FAILED"],
  CANCELLED: ["CANCELLED"],
};

const DEPENDENCY_STATUS_MAP: Record<string, string[]> = {
  PROPOSED: ["OPEN"],
  CONFIRMED: ["IN_PROGRESS"],
  IN_PROGRESS: ["IN_PROGRESS"],
  COMPLETED: ["RESOLVED"],
  FAILED: ["BLOCKED"],
  CANCELLED: ["ABANDONED"],
};

const RECEIPT_STATUS_MAP: Record<string, string[]> = {
  CONFIRMED: ["MATCHED", "MANUALLY_OVERRIDDEN"],
  IN_PROGRESS: ["UNMATCHED", "AMBIGUOUS"],
  COMPLETED: ["MATCHED"],
};

function matchesStatusFilter(
  status: string,
  filter: string | null,
  statusMap: Record<string, string[]>,
): boolean {
  if (!filter) return true;
  return statusMap[filter].includes(status);
}

function matchesSearch(
  query: string,
  pledges: PledgeDocument[],
  _profiles: ContributorProfileDocument[],
): (profile: ContributorProfileDocument) => boolean {
  if (!query) return () => true;
  const q = query.toLowerCase();

  const matchedPledgeIds = new Set<string>();
  for (const p of pledges) {
    const state = p.state.global;
    const profileId = state.contributorProfileId;
    if (profileId && p.header.id.toLowerCase().includes(q)) {
      matchedPledgeIds.add(profileId);
    }
    if (state.publicNotes?.toLowerCase().includes(q)) {
      if (profileId) matchedPledgeIds.add(profileId);
    }
  }

  return (profile) => {
    const state = profile.state.global;
    return (
      state.displayName.toLowerCase().includes(q) ||
      state.legalName?.toLowerCase().includes(q) ||
      state.twitterHandle?.toLowerCase().includes(q) ||
      state.farcasterHandle?.toLowerCase().includes(q) ||
      matchedPledgeIds.has(profile.header.id)
    );
  };
}

export function filterPledges(
  pledges: PledgeDocument[],
  searchQuery: string,
  statusFilter: string | null,
  profiles: ContributorProfileDocument[],
): PledgeDocument[] {
  const q = searchQuery.toLowerCase();
  const profileMap = new Map<string, ContributorProfileDocument>();
  for (const p of profiles) {
    profileMap.set(p.header.id, p);
  }

  return pledges.filter((pledge) => {
    const state = pledge.state.global;

    if (statusFilter) {
      if (!matchesStatusFilter(state.status, statusFilter, PLEDGE_STATUS_MAP)) {
        return false;
      }
    }

    if (q) {
      const profile = profileMap.get(state.contributorProfileId ?? "");
      const profileName = profile?.state.global.displayName ?? "";
      const profileLegal = profile?.state.global.legalName ?? "";
      const profileTwitter = profile?.state.global.twitterHandle ?? "";

      const searchable = [
        profileName,
        profileLegal,
        profileTwitter,
        state.publicNotes ?? "",
        state.internalNotes ?? "",
        state.asset?.symbol ?? "",
      ]
        .join(" ")
        .toLowerCase();

      if (!searchable.includes(q)) {
        return false;
      }
    }

    return true;
  });
}

export function filterDependencies(
  dependencies: ExternalDependencyDocument[],
  searchQuery: string,
  statusFilter: string | null,
): ExternalDependencyDocument[] {
  const q = searchQuery.toLowerCase();
  return dependencies.filter((dep) => {
    const state = dep.state.global;

    if (statusFilter) {
      if (
        !matchesStatusFilter(state.status, statusFilter, DEPENDENCY_STATUS_MAP)
      ) {
        return false;
      }
    }

    if (q) {
      const searchable = [
        state.title,
        state.description ?? "",
        state.assignee ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) {
        return false;
      }
    }

    return true;
  });
}

export function filterReceipts(
  receipts: OnchainReceiptDocument[],
  searchQuery: string,
  statusFilter: string | null,
): OnchainReceiptDocument[] {
  const q = searchQuery.toLowerCase();
  return receipts.filter((receipt) => {
    const state = receipt.state.global;

    if (statusFilter) {
      if (
        !matchesStatusFilter(
          state.reconciliationStatus,
          statusFilter,
          RECEIPT_STATUS_MAP,
        )
      ) {
        return false;
      }
    }

    if (q) {
      const searchable = [
        state.fromAddress ?? "",
        state.toAddress ?? "",
        state.txHash ?? "",
        state.rawLog ?? "",
        state.asset?.symbol ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) {
        return false;
      }
    }

    return true;
  });
}

export function filterStatusUpdates(
  updates: StatusUpdateDocument[],
  searchQuery: string,
  _statusFilter: string | null,
): StatusUpdateDocument[] {
  const q = searchQuery.toLowerCase();
  if (!q) return updates;
  return updates.filter((update) => {
    const state = update.state.global;
    const searchable = [state.title, state.body].join(" ").toLowerCase();
    return searchable.includes(q);
  });
}

export function filterContributorProfiles(
  profiles: ContributorProfileDocument[],
  searchQuery: string,
  _statusFilter: string | null,
  pledges: PledgeDocument[],
): ContributorProfileDocument[] {
  if (!searchQuery) return profiles;
  const predicate = matchesSearch(searchQuery, pledges, profiles);
  return profiles.filter(predicate);
}

export function SearchFilter({
  value,
  onSearchChange,
  onStatusChange,
  onClear,
}: SearchFilterProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => {
      inputRef.current?.focus();
    };
    window.addEventListener("defi-united-focus-search", handler);
    return () => {
      window.removeEventListener("defi-united-focus-search", handler);
    };
  }, []);

  const hasActiveFilters = value.searchQuery || value.statusFilter;

  return (
    <div className="defi-united-ops__search-filter">
      <div className="defi-united-ops__search-filter-row">
        <div className="defi-united-ops__search-input-wrap">
          <span className="defi-united-ops__search-icon" aria-hidden="true">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            className="defi-united-ops__search-input"
            placeholder="Search pledges, receipts, updates... (/)"
            value={value.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search across all panels"
          />
        </div>

        <select
          className="defi-united-ops__status-select"
          value={value.statusFilter ?? ""}
          onChange={(e) =>
            onStatusChange(e.target.value === "" ? null : e.target.value)
          }
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value ?? "all"} value={opt.value ?? ""}>
              {opt.label}
            </option>
          ))}
        </select>

        {hasActiveFilters ? (
          <button
            type="button"
            className="defi-united-ops__clear-btn"
            onClick={onClear}
            aria-label="Clear all filters"
          >
            Clear
          </button>
        ) : null}
      </div>

      <style>{`
        .defi-united-ops__search-filter {
        }
        .defi-united-ops__search-filter-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .defi-united-ops__search-input-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #e6e8ec;
          border-radius: 8px;
          padding: 0 12px;
          min-height: 36px;
          transition: border-color 120ms ease;
        }
        .defi-united-ops__search-input-wrap:focus-within {
          border-color: #1a4dd6;
          box-shadow: 0 0 0 2px rgba(26, 77, 214, 0.12);
        }
        .defi-united-ops__search-icon {
          color: #9aa1ad;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .defi-united-ops__search-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 13px;
          color: #0f1115;
          width: 100%;
          font-family: inherit;
        }
        .defi-united-ops__search-input::placeholder {
          color: #9aa1ad;
        }
        .defi-united-ops__status-select {
          background: #ffffff;
          border: 1px solid #e6e8ec;
          border-radius: 8px;
          padding: 6px 32px 6px 12px;
          font-size: 13px;
          color: #0f1115;
          font-family: inherit;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%239aa1ad' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          min-width: 150px;
          transition: border-color 120ms ease;
        }
        .defi-united-ops__status-select:focus {
          outline: none;
          border-color: #1a4dd6;
          box-shadow: 0 0 0 2px rgba(26, 77, 214, 0.12);
        }
        .defi-united-ops__clear-btn {
          background: none;
          border: 1px solid #e6e8ec;
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #525a6b;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.02em;
          transition: background-color 120ms ease, color 120ms ease;
          flex-shrink: 0;
        }
        .defi-united-ops__clear-btn:hover {
          background-color: #f1f3f7;
          color: #0f1115;
        }
        .defi-united-ops__clear-btn:focus {
          outline: 2px solid #1a4dd6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
