import type { PHAppConfig } from "@powerhousedao/reactor-browser";

/** Editor config for the Campaign Operations drive editor */
export const editorConfig: PHAppConfig = {
  isDragAndDropEnabled: true,
  allowedDocumentTypes: [
    "defi-united/relief-campaign",
    "defi-united/pledge",
    "defi-united/contributor-profile",
    "defi-united/external-dependency",
    "defi-united/onchain-receipt",
    "defi-united/distribution-plan",
    "defi-united/status-update",
  ],
};
