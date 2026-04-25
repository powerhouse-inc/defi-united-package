import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the "defi-united/onchain-receipt" document type */
export const OnchainReceiptEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["defi-united/onchain-receipt"],
  config: {
    id: "onchain-receipt-editor",
    name: "On-chain Receipt",
  },
};
