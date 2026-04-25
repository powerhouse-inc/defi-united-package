import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import {
  useDocumentsInSelectedDrive,
  useSelectedDrive,
  useSetPHAppConfig,
} from "@powerhousedao/reactor-browser";
import type { EditorProps, PHDocument } from "document-model";
import { useMemo } from "react";

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

import { editorConfig } from "./config.js";
import { HeaderStrip } from "./components/header-strip.js";
import { PledgeBoard } from "./components/pledge-board.js";
import { DependencyGrid } from "./components/dependency-grid.js";
import { ReceiptsFeed } from "./components/receipts-feed.js";
import { CommsTimeline } from "./components/comms-timeline.js";
import { DistributionPanel } from "./components/distribution-panel.js";

function isType(doc: PHDocument, type: string): boolean {
  return doc.header.documentType === type;
}

export default function Editor(_props: EditorProps) {
  useSetPHAppConfig(editorConfig);
  const documents = useDocumentsInSelectedDrive();
  const [selectedDrive] = useSelectedDrive();

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

  return (
    <div className="defi-united-ops" style={{ height: "100%" }}>
      <DocumentToolbar />
      <div className="defi-united-ops__inner">
        <HeaderStrip
          driveName={driveName}
          campaign={campaign}
          pledges={pledges}
          receipts={receipts}
        />

        {!campaign ? (
          <EmptyCampaignNotice />
        ) : (
          <>
            <PledgeBoard
              pledges={pledges}
              contributorProfiles={contributorProfiles}
            />

            <div className="defi-united-ops__grid-2">
              <DependencyGrid dependencies={dependencies} />
              <ReceiptsFeed receipts={receipts} />
            </div>

            <div className="defi-united-ops__grid-2">
              <DistributionPanel plan={distribution} />
              <CommsTimeline updates={statusUpdates} />
            </div>
          </>
        )}
      </div>

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
      `}</style>
    </div>
  );
}

function EmptyCampaignNotice() {
  return (
    <div className="defi-united-ops__card">
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
        No Relief Campaign in this drive yet
      </h2>
      <p style={{ marginTop: 8, color: "#525a6b", fontSize: 14 }}>
        Add a <code>defi-united/relief-campaign</code> document to this drive to
        activate the operational dashboard.
      </p>
    </div>
  );
}
