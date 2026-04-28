import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import {
  dispatchActions,
  showCreateDocumentModal,
  useDocumentsInSelectedDrive,
  useSelectedDrive,
  useSetPHAppConfig,
} from "@powerhousedao/reactor-browser";
import type { Action, EditorProps, PHDocument } from "document-model";
import { useCallback, useEffect, useMemo, useState } from "react";

import { reliefCampaignDocumentType } from "../../document-models/relief-campaign/v1/gen/document-type.js";
import { pledgeDocumentType } from "../../document-models/pledge/v1/gen/document-type.js";
import { externalDependencyDocumentType } from "../../document-models/external-dependency/v1/gen/document-type.js";
import { onchainReceiptDocumentType } from "../../document-models/onchain-receipt/v1/gen/document-type.js";
import { distributionPlanDocumentType } from "../../document-models/distribution-plan/v1/gen/document-type.js";
import { statusUpdateDocumentType } from "../../document-models/status-update/v1/gen/document-type.js";
import { contributorProfileDocumentType } from "../../document-models/contributor-profile/v1/gen/document-type.js";

import type { ReliefCampaignDocument } from "../../document-models/relief-campaign/v1/gen/types.js";
import type { PledgeDocument } from "../../document-models/pledge/v1/gen/types.js";
import type { ExternalDependencyDocument } from "../../document-models/external-dependency/v1/gen/types.js";
import type { OnchainReceiptDocument } from "../../document-models/onchain-receipt/v1/gen/types.js";
import type { DistributionPlanDocument } from "../../document-models/distribution-plan/v1/gen/types.js";
import type { StatusUpdateDocument } from "../../document-models/status-update/v1/gen/types.js";
import type { ContributorProfileDocument } from "../../document-models/contributor-profile/v1/gen/types.js";

import { useRightPane } from "./state/use-right-pane.js";
import { deriveTasks, type Task } from "./state/derive-tasks.js";
import { deriveActivity } from "./state/derive-activity.js";
import { DefaultView } from "./components/right-pane/default-view.js";
import { PledgeForm } from "./components/right-pane/forms/pledge-form.js";
import { ContributorForm } from "./components/right-pane/forms/contributor-form.js";
import { DependencyForm } from "./components/right-pane/forms/dependency-form.js";
import { StatusUpdateForm } from "./components/right-pane/forms/status-update-form.js";
import { TwoPaneShell } from "./components/two-pane-shell.js";
import { editorConfig } from "./config.js";
import { HeaderStrip } from "./components/header-strip.js";
import { PledgeBoard } from "./components/pledge-board.js";
import { DependencyGrid } from "./components/dependency-grid.js";
import { ReceiptsFeed } from "./components/receipts-feed.js";
import { CommsTimeline } from "./components/comms-timeline.js";
import { DistributionPanel } from "./components/distribution-panel.js";
import {
  SearchFilter,
  filterPledges,
  filterDependencies,
  filterReceipts,
  filterStatusUpdates,
  filterContributorProfiles,
} from "./components/search-filter.js";
import { CollapsibleSection } from "./components/collapsible-section.js";
import {
  LifecycleBanner,
  CampaignSetupForm,
  CampaignQuickActions,
} from "./components/lifecycle.js";

function isType(doc: PHDocument, type: string): boolean {
  return doc.header.documentType === type;
}

export default function Editor(_props: EditorProps) {
  useSetPHAppConfig(editorConfig);
  const documents = useDocumentsInSelectedDrive();
  const [selectedDrive] = useSelectedDrive();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleStatusChange = useCallback((status: string | null) => {
    setStatusFilter(status);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter(null);
  }, []);

  const [showShortcuts, setShowShortcuts] = useState(false);

  const rightPaneState = useRightPane();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      const isInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement;

      if (isInput) return;

      if (e.key === "?") {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
        return;
      }

      if (e.key === "Escape") {
        if (rightPaneState.selectedItem) {
          rightPaneState.close();
        } else {
          setShowShortcuts(false);
          handleClearFilters();
        }
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("defi-united-focus-search"));
        return;
      }

      // new create-form shortcuts
      if (e.key === "n") {
        e.preventDefault();
        rightPaneState.open({ type: "pledge", mode: "create" });
        return;
      }
      if (e.key === "c") {
        e.preventDefault();
        rightPaneState.open({ type: "contributor", mode: "create" });
        return;
      }
      if (e.key === "d") {
        e.preventDefault();
        rightPaneState.open({ type: "dependency", mode: "create" });
        return;
      }
      if (e.key === "u") {
        e.preventDefault();
        rightPaneState.open({ type: "status-update", mode: "create" });
        return;
      }
      if (e.key === "b") {
        e.preventDefault();
        rightPaneState.open({ type: "bulk-add", mode: "wizard" });
        return;
      }

      const panelMap: Record<string, string> = {
        "1": "panel-pledges",
        "2": "panel-dependencies",
        "3": "panel-receipts",
        "4": "panel-distribution",
        "5": "panel-communications",
      };

      if (e.key === "6") {
        handleClearFilters();
        return;
      }

      const panelId = panelMap[e.key];
      if (panelId) {
        e.preventDefault();
        const el = document.querySelector(`[data-panel-id="${panelId}"]`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClearFilters, rightPaneState]);

  const dispatchPledges = useCallback((documentId: string, action: Action) => {
    void dispatchActions(action, documentId);
  }, []);

  const driveName = selectedDrive.header.name;

  const campaign = useMemo<ReliefCampaignDocument | undefined>(
    () =>
      (documents ?? []).find((d): d is ReliefCampaignDocument =>
        isType(d, reliefCampaignDocumentType),
      ),
    [documents],
  );

  const pledges = useMemo<PledgeDocument[]>(
    () =>
      (documents ?? []).filter((d): d is PledgeDocument =>
        isType(d, pledgeDocumentType),
      ),
    [documents],
  );

  const dependencies = useMemo<ExternalDependencyDocument[]>(
    () =>
      (documents ?? []).filter((d): d is ExternalDependencyDocument =>
        isType(d, externalDependencyDocumentType),
      ),
    [documents],
  );

  const receipts = useMemo<OnchainReceiptDocument[]>(
    () =>
      (documents ?? []).filter((d): d is OnchainReceiptDocument =>
        isType(d, onchainReceiptDocumentType),
      ),
    [documents],
  );

  const distribution = useMemo<DistributionPlanDocument | undefined>(
    () =>
      (documents ?? []).find((d): d is DistributionPlanDocument =>
        isType(d, distributionPlanDocumentType),
      ),
    [documents],
  );

  const statusUpdates = useMemo<StatusUpdateDocument[]>(
    () =>
      (documents ?? []).filter((d): d is StatusUpdateDocument =>
        isType(d, statusUpdateDocumentType),
      ),
    [documents],
  );

  const contributorProfiles = useMemo<ContributorProfileDocument[]>(
    () =>
      (documents ?? []).filter((d): d is ContributorProfileDocument =>
        isType(d, contributorProfileDocumentType),
      ),
    [documents],
  );

  const filteredPledges = useMemo(
    () =>
      filterPledges(pledges, searchQuery, statusFilter, contributorProfiles),
    [pledges, searchQuery, statusFilter, contributorProfiles],
  );

  const filteredDependencies = useMemo(
    () => filterDependencies(dependencies, searchQuery, statusFilter),
    [dependencies, searchQuery, statusFilter],
  );

  const filteredReceipts = useMemo(
    () => filterReceipts(receipts, searchQuery, statusFilter),
    [receipts, searchQuery, statusFilter],
  );

  const filteredStatusUpdates = useMemo(
    () => filterStatusUpdates(statusUpdates, searchQuery, statusFilter),
    [statusUpdates, searchQuery, statusFilter],
  );

  const filteredContributorProfiles = useMemo(
    () =>
      filterContributorProfiles(
        contributorProfiles,
        searchQuery,
        statusFilter,
        pledges,
      ),
    [contributorProfiles, searchQuery, statusFilter, pledges],
  );

  const tasks = useMemo(
    () =>
      deriveTasks({
        now: Date.now(),
        pledges,
        receipts,
        dependencies,
        statusUpdates,
        contributorProfiles,
        campaignStatus: campaign?.state.global.status ?? "DRAFT",
      }),
    [
      pledges,
      receipts,
      dependencies,
      statusUpdates,
      contributorProfiles,
      campaign,
    ],
  );

  const totalActivity = pledges.length + receipts.length + statusUpdates.length;
  const recentEvents = useMemo(
    () =>
      deriveActivity({
        pledges,
        receipts,
        statusUpdates,
        contributorProfiles,
        limit: 10,
      }),
    [pledges, receipts, statusUpdates, contributorProfiles],
  );

  // Chart inputs
  const totalPledged = useMemo(
    () =>
      pledges.reduce(
        (s, p) => s + (Number(p.state.global.pledgedAmount) || 0),
        0,
      ),
    [pledges],
  );
  const targetEth = Number(campaign?.state.global.targetAmount ?? 0) || 0;
  const totalReceived = useMemo(
    () =>
      receipts
        .filter((r) => r.state.global.reconciliationStatus !== "REORGED")
        .reduce(
          (s, r) => s + (Number(r.state.global.ethEquivalentAmount) || 0),
          0,
        ),
    [receipts],
  );
  const raisedEth = totalPledged + totalReceived;
  const usdLabel: string | null = null;
  const ethLabel = `${raisedEth.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETH`;

  const funnelSegments = useMemo(() => {
    const order = [
      { status: "PROPOSED", color: "#9aa1ad" },
      { status: "GOVERNANCE_PENDING", color: "#f59e0b" },
      { status: "CONFIRMED", color: "#1a4dd6" },
      { status: "RECEIVED", color: "#16a34a" },
      { status: "CANCELLED+FAILED", color: "#dc2626" },
    ];
    return order.map((o) => {
      const matches = pledges.filter((p) => {
        if (o.status === "CANCELLED+FAILED")
          return (
            p.state.global.status === "CANCELLED" ||
            p.state.global.status === "FAILED"
          );
        return p.state.global.status === o.status;
      });
      return {
        status: o.status,
        color: o.color,
        amount: matches.reduce(
          (s, p) => s + (Number(p.state.global.pledgedAmount) || 0),
          0,
        ),
        count: matches.length,
      };
    });
  }, [pledges]);

  const cumulativeSeries = useMemo(() => {
    const byDay: Record<string, number> = {};
    for (const p of pledges) {
      const day = (
        p.header.createdAtUtcIso ||
        p.header.lastModifiedAtUtcIso ||
        ""
      ).slice(0, 10);
      if (!day) continue;
      byDay[day] =
        (byDay[day] ?? 0) + (Number(p.state.global.pledgedAmount) || 0);
    }
    const sorted = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b));
    let acc = 0;
    return sorted.map(([date, eth]) => {
      acc += eth;
      return { date, eth: acc };
    });
  }, [pledges]);

  const topContribs = useMemo(() => {
    return pledges
      .filter((p) => Number(p.state.global.pledgedAmount) > 0)
      .map((p) => {
        const profile = contributorProfiles.find(
          (c) => c.header.id === p.state.global.contributorProfileId,
        );
        return {
          id: p.state.global.contributorProfileId ?? "",
          name: profile?.state.global.displayName ?? "Unknown",
          amount: Number(p.state.global.pledgedAmount) || 0,
        };
      })
      .filter((c) => c.id)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [pledges, contributorProfiles]);

  const onchainBuckets = useMemo(() => {
    const now = Date.now();
    const arr: { count: number; eth: number }[] = Array.from(
      { length: 24 },
      () => ({ count: 0, eth: 0 }),
    );
    for (const r of receipts) {
      if (r.state.global.reconciliationStatus === "REORGED") continue;
      const tsIso =
        r.state.global.blockTimestamp ?? r.header.lastModifiedAtUtcIso;
      if (!tsIso) continue;
      const ts = new Date(tsIso).getTime();
      if (Number.isNaN(ts)) continue;
      const hoursAgo = Math.floor((now - ts) / (3600 * 1000));
      if (hoursAgo >= 0 && hoursAgo < 24) {
        const idx = 23 - hoursAgo;
        arr[idx].count += 1;
        arr[idx].eth += Number(r.state.global.ethEquivalentAmount) || 0;
      }
    }
    return arr.map((b, i) => ({ hour: i, count: b.count, eth: b.eth }));
  }, [receipts]);

  const handlePrimaryAction = useCallback(
    (task: Task) => {
      if (task.pledgeId)
        rightPaneState.open({
          type: "pledge",
          id: task.pledgeId,
          mode: "edit",
        });
      else if (task.dependencyId)
        rightPaneState.open({
          type: "dependency",
          id: task.dependencyId,
          mode: "edit",
        });
      else if (task.kind === "NO_RECENT_UPDATE")
        rightPaneState.open({ type: "status-update", mode: "create" });
    },
    [rightPaneState],
  );

  const leftPaneContent = (
    <div className="defi-united-ops__inner">
      {campaign ? (
        <LifecycleBanner campaign={campaign} distribution={distribution} />
      ) : null}

      <HeaderStrip
        driveName={driveName}
        campaign={campaign}
        pledges={pledges}
        receipts={receipts}
      />

      {!campaign ? (
        <EmptyCampaignNotice />
      ) : campaign.state.global.status === "DRAFT" ? (
        <>
          <CampaignSetupForm campaign={campaign} />
          <CampaignQuickActions showCommunications={false} />
        </>
      ) : (
        <>
          <CampaignQuickActions showCommunications />
          <SearchFilter
            value={{ searchQuery, statusFilter }}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
            onClear={handleClearFilters}
          />

          <div data-panel-id="panel-pledges">
            <PledgeBoard
              pledges={filteredPledges}
              contributorProfiles={filteredContributorProfiles}
              dispatchPledges={dispatchPledges}
              campaignTarget={campaign.state.global.targetAmount}
              onOpen={(id) =>
                rightPaneState.open({ type: "pledge", id, mode: "edit" })
              }
            />
          </div>

          <div className="defi-united-ops__grid-2">
            <div data-panel-id="panel-dependencies">
              <CollapsibleSection
                title="External dependencies"
                isCollapsedByDefault={filteredDependencies.length === 0}
              >
                <DependencyGrid
                  dependencies={filteredDependencies}
                  pledges={pledges}
                />
              </CollapsibleSection>
            </div>
            <div data-panel-id="panel-receipts">
              <CollapsibleSection
                title="On-chain receipts"
                isCollapsedByDefault={filteredReceipts.length === 0}
              >
                <ReceiptsFeed
                  receipts={filteredReceipts}
                  pledges={pledges}
                  contributorProfiles={contributorProfiles}
                />
              </CollapsibleSection>
            </div>
          </div>

          <div className="defi-united-ops__grid-2">
            <div data-panel-id="panel-distribution">
              <CollapsibleSection
                title="Distribution plan"
                isCollapsedByDefault={!distribution}
              >
                <DistributionPanel plan={distribution} />
              </CollapsibleSection>
            </div>
            <div data-panel-id="panel-communications">
              <CollapsibleSection
                title="Public communications"
                isCollapsedByDefault={
                  filteredStatusUpdates.filter(
                    (u) =>
                      u.state.global.visibility === "PUBLIC" &&
                      !!u.state.global.publishedAt,
                  ).length === 0
                }
              >
                <CommsTimeline
                  filteredStatusUpdates={filteredStatusUpdates}
                  driveId={selectedDrive.header.id}
                  metricsTotalPledged={pledges.reduce(
                    (sum, p) => sum + (p.state.global.pledgedAmount ?? 0),
                    0,
                  )}
                  metricsTotalReceived={receipts.reduce(
                    (sum, r) => sum + (r.state.global.amount ?? 0),
                    0,
                  )}
                  metricsDependenciesResolved={
                    dependencies.filter(
                      (d) => d.state.global.status === "RESOLVED",
                    ).length
                  }
                />
              </CollapsibleSection>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const rightPaneContent = (() => {
    if (rightPaneState.selectedItem == null) {
      return (
        <DefaultView
          tasks={tasks}
          events={recentEvents}
          totalEventCount={totalActivity}
          rightPane={rightPaneState}
          onPrimaryAction={handlePrimaryAction}
          raisedEth={raisedEth}
          targetEth={targetEth}
          usdLabel={usdLabel}
          ethLabel={ethLabel}
          funnelSegments={funnelSegments}
          cumulativeSeries={cumulativeSeries}
          topContribs={topContribs}
          onchainBuckets={onchainBuckets}
        />
      );
    }
    if (rightPaneState.selectedItem.type === "pledge") {
      const item = rightPaneState.selectedItem;
      const pledge =
        item.mode === "edit"
          ? pledges.find((p) => p.header.id === (item as { id: string }).id)
          : undefined;
      return (
        <PledgeForm
          mode={item.mode}
          pledge={pledge}
          profiles={contributorProfiles}
          driveId={selectedDrive.header.id}
          onClose={rightPaneState.close}
        />
      );
    }
    if (rightPaneState.selectedItem.type === "contributor") {
      const item = rightPaneState.selectedItem;
      const profile =
        item.mode === "edit"
          ? contributorProfiles.find(
              (c) => c.header.id === (item as { id: string }).id,
            )
          : undefined;
      return (
        <ContributorForm
          mode={item.mode}
          profile={profile}
          driveId={selectedDrive.header.id}
          onClose={rightPaneState.close}
        />
      );
    }
    if (rightPaneState.selectedItem.type === "dependency") {
      const item = rightPaneState.selectedItem;
      const dep =
        item.mode === "edit"
          ? dependencies.find(
              (d) => d.header.id === (item as { id: string }).id,
            )
          : undefined;
      return (
        <DependencyForm
          mode={item.mode}
          dependency={dep}
          pledges={pledges}
          contributorProfiles={contributorProfiles}
          driveId={selectedDrive.header.id}
          onClose={rightPaneState.close}
        />
      );
    }
    if (rightPaneState.selectedItem.type === "status-update") {
      const item = rightPaneState.selectedItem;
      const statusUpdate =
        item.mode === "edit"
          ? statusUpdates.find(
              (u) => u.header.id === (item as { id: string }).id,
            )
          : undefined;
      const totalPledgedSum = pledges.reduce(
        (s, p) => s + (Number(p.state.global.pledgedAmount) || 0),
        0,
      );
      const totalReceivedSum = receipts
        .filter((r) => r.state.global.reconciliationStatus !== "REORGED")
        .reduce(
          (s, r) => s + (Number(r.state.global.ethEquivalentAmount) || 0),
          0,
        );
      const depsResolvedCount = dependencies.filter(
        (d) => d.state.global.status === "RESOLVED",
      ).length;
      return (
        <StatusUpdateForm
          mode={item.mode}
          update={statusUpdate}
          driveId={selectedDrive.header.id}
          totalPledged={totalPledgedSum}
          totalReceived={totalReceivedSum}
          dependenciesResolved={depsResolvedCount}
          onClose={rightPaneState.close}
        />
      );
    }
    return (
      <div style={{ padding: 16, color: "#6b7280", fontSize: 13 }}>
        Bulk add wizard coming.
      </div>
    );
  })();

  return (
    <div className="defi-united-ops" style={{ height: "100%" }}>
      <DocumentToolbar />
      <TwoPaneShell
        leftPane={leftPaneContent}
        rightPane={rightPaneContent}
        rightPaneState={rightPaneState}
      />
      {showShortcuts ? (
        <KeyboardShortcutsTooltip onClose={() => setShowShortcuts(false)} />
      ) : null}

      <style>{`
        .defi-united-ops {
          background-color: #f7f8fa;
          color: #0f1115;
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          overflow-y: auto;
        }
        .defi-united-ops__inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px 28px 64px 28px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .defi-united-ops__grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .defi-united-ops__grid-2 {
            grid-template-columns: 1fr;
          }
        }
        .defi-united-ops a {
          color: #1a4dd6;
          text-decoration: none;
        }
        .defi-united-ops a:hover {
          text-decoration: underline;
        }
        .defi-united-ops__card {
          background: #ffffff;
          border: 1px solid #e6e8ec;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 1px 2px rgba(15, 17, 21, 0.04);
        }
        .defi-united-ops__card-title {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #525a6b;
          margin: 0 0 14px 0;
        }
        .defi-united-ops__empty {
          color: #6b7280;
          font-size: 13px;
          font-style: italic;
        }
        .defi-united-ops__row-clickable {
          cursor: pointer;
          transition: background-color 120ms ease;
          border-radius: 8px;
        }
        .defi-united-ops__row-clickable:hover {
          background-color: #f1f3f7;
        }
        .defi-united-ops__row-clickable:focus {
          outline: 2px solid #1a4dd6;
          outline-offset: 2px;
        }

        /* Shared empty state */
        .defi-united-ops__empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 24px 16px;
          gap: 4px;
        }
        .defi-united-ops__empty-state-icon {
          font-size: 24px;
          opacity: 0.45;
          margin-bottom: 4px;
          line-height: 1;
        }
        .defi-united-ops__empty-state-label {
          font-size: 13px;
          font-weight: 600;
          color: #0f1115;
        }
        .defi-united-ops__empty-state-desc {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.5;
          margin-top: 2px;
        }
        .defi-united-ops__empty-state-desc code {
          background-color: #f1f3f7;
          color: #1a4dd6;
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 11px;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
          white-space: nowrap;
        }

        /* Keyboard shortcuts tooltip */
        .defi-united-ops__kbd-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 17, 21, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .defi-united-ops__kbd-tooltip {
          background: #ffffff;
          border: 1px solid #e6e8ec;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(15, 17, 21, 0.15);
          padding: 20px 24px;
          min-width: 300px;
          max-width: 400px;
        }
        .defi-united-ops__kbd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .defi-united-ops__kbd-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f1115;
        }
        .defi-united-ops__kbd-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #9aa1ad;
          font-size: 16px;
          line-height: 1;
          padding: 2px 4px;
          border-radius: 4px;
        }
        .defi-united-ops__kbd-close:hover {
          color: #0f1115;
          background: #f1f3f7;
        }
        .defi-united-ops__kbd-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .defi-united-ops__kbd-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #525a6b;
        }
        .defi-united-ops__kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 22px;
          padding: 0 6px;
          background: #f7f8fa;
          border: 1px solid #e6e8ec;
          border-radius: 5px;
          font-size: 11px;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
          color: #0f1115;
          line-height: 1;
        }
      `}</style>
    </div>
  );
}

interface KeyboardShortcutsTooltipProps {
  onClose: () => void;
}

function KeyboardShortcutsTooltip({ onClose }: KeyboardShortcutsTooltipProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="defi-united-ops__kbd-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="defi-united-ops__kbd-tooltip"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="defi-united-ops__kbd-header">
          <span className="defi-united-ops__kbd-title">Keyboard Shortcuts</span>
          <button
            type="button"
            className="defi-united-ops__kbd-close"
            onClick={onClose}
            aria-label="Close shortcuts"
          >
            ✕
          </button>
        </div>
        <div className="defi-united-ops__kbd-list">
          <div className="defi-united-ops__kbd-row">
            <kbd className="defi-united-ops__kbd">/</kbd>
            <span>Focus search</span>
          </div>
          <div className="defi-united-ops__kbd-row">
            <kbd className="defi-united-ops__kbd">1</kbd>
            <span>Pledge board</span>
          </div>
          <div className="defi-united-ops__kbd-row">
            <kbd className="defi-united-ops__kbd">2</kbd>
            <span>Dependencies</span>
          </div>
          <div className="defi-united-ops__kbd-row">
            <kbd className="defi-united-ops__kbd">3</kbd>
            <span>Receipts</span>
          </div>
          <div className="defi-united-ops__kbd-row">
            <kbd className="defi-united-ops__kbd">4</kbd>
            <span>Distribution plan</span>
          </div>
          <div className="defi-united-ops__kbd-row">
            <kbd className="defi-united-ops__kbd">5</kbd>
            <span>Communications</span>
          </div>
          <div className="defi-united-ops__kbd-row">
            <kbd className="defi-united-ops__kbd">6</kbd>
            <span>Clear filters</span>
          </div>
          <div className="defi-united-ops__kbd-row">
            <kbd className="defi-united-ops__kbd">n</kbd>
            <span>+ Pledge</span>
          </div>
          <div className="defi-united-ops__kbd-row">
            <kbd className="defi-united-ops__kbd">c</kbd>
            <span>+ Contributor</span>
          </div>
          <div className="defi-united-ops__kbd-row">
            <kbd className="defi-united-ops__kbd">d</kbd>
            <span>+ Dependency</span>
          </div>
          <div className="defi-united-ops__kbd-row">
            <kbd className="defi-united-ops__kbd">u</kbd>
            <span>+ Status update</span>
          </div>
          <div className="defi-united-ops__kbd-row">
            <kbd className="defi-united-ops__kbd">b</kbd>
            <span>Bulk add</span>
          </div>
          <div className="defi-united-ops__kbd-row">
            <kbd className="defi-united-ops__kbd">Esc</kbd>
            <span>Clear filters / Close</span>
          </div>
          <div className="defi-united-ops__kbd-row">
            <kbd className="defi-united-ops__kbd">?</kbd>
            <span>Show this help</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCampaignNotice() {
  return (
    <div className="defi-united-ops__empty-card">
      <div className="defi-united-ops__empty-eyebrow">
        Spin up a new incident
      </div>
      <h2 className="defi-united-ops__empty-title">
        Start a new relief campaign
      </h2>
      <p className="defi-united-ops__empty-body">
        One click creates the ReliefCampaign document and unlocks the entire
        operational dashboard — pledges, dependencies, on-chain receipts,
        distribution, and comms — all in this drive.
      </p>
      <div className="defi-united-ops__empty-actions">
        <button
          type="button"
          onClick={() => showCreateDocumentModal(reliefCampaignDocumentType)}
          className="defi-united-ops__empty-cta"
        >
          + New incident campaign
        </button>
        <button
          type="button"
          onClick={() =>
            showCreateDocumentModal(contributorProfileDocumentType)
          }
          className="defi-united-ops__empty-secondary"
        >
          Add contributor profile
        </button>
      </div>
      <ol className="defi-united-ops__empty-steps">
        <li>Create the campaign document and set name + target.</li>
        <li>Add contributor profiles for known protocols and individuals.</li>
        <li>
          Capture pledges as they come in; track DAO governance via
          dependencies.
        </li>
        <li>
          Reconcile on-chain receipts automatically via the campaign processor.
        </li>
      </ol>
      <style>{`
        .defi-united-ops__empty-card {
          padding: 28px 32px;
          border-radius: 16px;
          background: linear-gradient(180deg, rgba(142,92,255,0.06) 0%, rgba(255,255,255,0) 100%);
          border: 1px solid rgba(142,92,255,0.18);
          box-shadow: 0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 30px -12px rgba(142,92,255,0.18);
        }
        .defi-united-ops__empty-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #6936dc;
        }
        .defi-united-ops__empty-title {
          margin: 4px 0 0 0;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #0f1115;
        }
        .defi-united-ops__empty-body {
          margin: 8px 0 18px 0;
          color: #525a6b;
          font-size: 14px;
          max-width: 560px;
          line-height: 1.55;
        }
        .defi-united-ops__empty-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .defi-united-ops__empty-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          background: linear-gradient(135deg, #8e5cff 0%, #e63e9d 100%);
          border-radius: 999px;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 20px -6px rgba(142,92,255,0.45);
          transition: transform 120ms ease, box-shadow 200ms ease;
        }
        .defi-united-ops__empty-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px -6px rgba(230,62,157,0.55);
        }
        .defi-united-ops__empty-secondary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #525a6b;
          background: #ffffff;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: background 150ms ease, border-color 150ms ease;
        }
        .defi-united-ops__empty-secondary:hover {
          border-color: #8e5cff;
          color: #6936dc;
        }
        .defi-united-ops__empty-steps {
          margin: 12px 0 0 0;
          padding-left: 18px;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.7;
        }
      `}</style>
    </div>
  );
}
