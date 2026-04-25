import type { EditorModule } from "document-model";
import { CampaignOperations } from "./campaign-operations/module.js";
import { ContributorProfileEditor } from "./contributor-profile-editor/module.js";
import { DistributionPlanEditor } from "./distribution-plan-editor/module.js";
import { ExternalDependencyEditor } from "./external-dependency-editor/module.js";
import { OnchainReceiptEditor } from "./onchain-receipt-editor/module.js";
import { PledgeEditor } from "./pledge-editor/module.js";
import { ReliefCampaignEditor } from "./relief-campaign-editor/module.js";
import { StatusUpdateEditor } from "./status-update-editor/module.js";

export const editors: EditorModule[] = [
  CampaignOperations,
  ReliefCampaignEditor,
  ContributorProfileEditor,
  PledgeEditor,
  ExternalDependencyEditor,
  OnchainReceiptEditor,
  DistributionPlanEditor,
  StatusUpdateEditor,
];
