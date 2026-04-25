/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { UpgradeManifest } from "document-model";
import { contributorProfileUpgradeManifest } from "document-models/contributor-profile/upgrades";
import { externalDependencyUpgradeManifest } from "document-models/external-dependency/upgrades";
import { onchainReceiptUpgradeManifest } from "document-models/onchain-receipt/upgrades";
import { pledgeUpgradeManifest } from "document-models/pledge/upgrades";
import { reliefCampaignUpgradeManifest } from "document-models/relief-campaign/upgrades";

export const upgradeManifests: UpgradeManifest<readonly number[]>[] = [
  contributorProfileUpgradeManifest,
  externalDependencyUpgradeManifest,
  onchainReceiptUpgradeManifest,
  pledgeUpgradeManifest,
  reliefCampaignUpgradeManifest,
];
