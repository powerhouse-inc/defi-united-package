import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { generateId } from "document-model";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  actions,
  useSelectedReliefCampaignDocument,
} from "../../document-models/relief-campaign/v1/index.js";

import { Banner } from "./components/Banner.js";
import { CampaignDetails } from "./components/CampaignDetails.js";
import { CampaignHeader } from "./components/CampaignHeader.js";
import { ContributionAddresses } from "./components/ContributionAddresses.js";
import { ExternalLinks } from "./components/ExternalLinks.js";
import { LifecycleActions } from "./components/LifecycleActions.js";
import { OperatorWallets } from "./components/OperatorWallets.js";

interface ToastState {
  tone: "info" | "success" | "error";
  message: string;
  key: number;
}

export default function Editor() {
  const [document, dispatch] = useSelectedReliefCampaignDocument();
  const [toast, setToast] = useState<ToastState | null>(null);
  const lastOpCountRef = useRef<number>(0);
  const [lastOpError, setLastOpError] = useState<string | null>(null);

  const state = document.state.global;
  const ops = document.operations.global;

  // Surface the most recent operation error as an inline banner.
  useEffect(() => {
    if (ops.length === 0) {
      lastOpCountRef.current = 0;
      setLastOpError(null);
      return;
    }
    if (ops.length > lastOpCountRef.current) {
      const latest = ops[ops.length - 1];
      const err = latest?.error;
      setLastOpError(typeof err === "string" && err ? err : null);
      lastOpCountRef.current = ops.length;
    }
  }, [ops]);

  // Auto-dismiss toast.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  function showToast(tone: ToastState["tone"], message: string) {
    setToast({ tone, message, key: Date.now() });
  }

  // ---- Detail field setters ----
  const setName = useCallback(
    (name: string) => dispatch(actions.setCampaignDetails({ name })),
    [dispatch],
  );
  const setSlug = useCallback(
    (slug: string) => dispatch(actions.setCampaignDetails({ slug })),
    [dispatch],
  );
  const setSummary = useCallback(
    (summary: string) => dispatch(actions.setCampaignDetails({ summary })),
    [dispatch],
  );
  const setTargetAmount = useCallback(
    (targetAmount: number | null) =>
      dispatch(actions.setCampaignDetails({ targetAmount })),
    [dispatch],
  );
  const setRiskDisclaimer = useCallback(
    (riskDisclaimer: string) =>
      dispatch(actions.setCampaignDetails({ riskDisclaimer })),
    [dispatch],
  );

  // ---- Contribution addresses ----
  const addContribution = useCallback(
    (input: { chainId: number; address: string; label: string | null }) => {
      dispatch(
        actions.addContributionAddress({
          id: generateId(),
          chainId: input.chainId,
          address: input.address,
          label: input.label,
        }),
      );
    },
    [dispatch],
  );
  const removeContribution = useCallback(
    (id: string) => dispatch(actions.removeContributionAddress({ id })),
    [dispatch],
  );

  // ---- External links ----
  const addExternalLink = useCallback(
    (input: { label: string; url: string }) => {
      dispatch(
        actions.addExternalLink({
          id: generateId(),
          label: input.label,
          url: input.url,
        }),
      );
    },
    [dispatch],
  );

  // ---- Operator wallets ----
  const addOperatorWallet = useCallback(
    (address: string) => dispatch(actions.addOperatorWallet({ address })),
    [dispatch],
  );
  const removeOperatorWallet = useCallback(
    (address: string) => dispatch(actions.removeOperatorWallet({ address })),
    [dispatch],
  );

  // ---- Lifecycle ----
  const startCampaign = useCallback(() => {
    dispatch(actions.startCampaign({ _: null }));
    showToast("success", "Campaign started.");
  }, [dispatch]);

  const markResolved = useCallback(() => {
    dispatch(actions.markResolved({ _: null }));
    showToast("success", "Campaign marked resolved.");
  }, [dispatch]);

  const markFailed = useCallback(
    (reason: string) => {
      dispatch(actions.markFailed({ reason: reason || null }));
      showToast("info", "Campaign marked failed.");
    },
    [dispatch],
  );

  const archiveCampaign = useCallback(() => {
    dispatch(actions.archiveCampaign({ _: null }));
    showToast("info", "Campaign archived.");
  }, [dispatch]);

  const detailCallbacks = useMemo(
    () => ({
      setName,
      setSlug,
      setSummary,
      setTargetAmount,
      setRiskDisclaimer,
    }),
    [setName, setSlug, setSummary, setTargetAmount, setRiskDisclaimer],
  );

  return (
    <div className="relief-campaign-scope min-h-full bg-neutral-50 text-neutral-900">
      <DocumentToolbar />

      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-8">
        {toast ? (
          <Banner
            key={toast.key}
            tone={toast.tone}
            message={toast.message}
            onDismiss={() => setToast(null)}
          />
        ) : null}

        {lastOpError ? (
          <Banner
            tone="error"
            message={`Operation failed: ${lastOpError}`}
            onDismiss={() => setLastOpError(null)}
          />
        ) : null}

        <CampaignHeader state={state} />

        <CampaignDetails state={state} on={detailCallbacks} />

        <ContributionAddresses
          addresses={state.contributionAddresses}
          onAdd={addContribution}
          onRemove={removeContribution}
        />

        <ExternalLinks links={state.externalLinks} onAdd={addExternalLink} />

        <OperatorWallets
          wallets={state.operatorWallets}
          onAdd={addOperatorWallet}
          onRemove={removeOperatorWallet}
        />

        <LifecycleActions
          status={state.status}
          onStart={startCampaign}
          onResolve={markResolved}
          onFail={markFailed}
          onArchive={archiveCampaign}
        />
      </div>

      <style>{`
        .relief-campaign-scope {
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI",
            Roboto, "Helvetica Neue", Arial, sans-serif;
        }
      `}</style>
    </div>
  );
}
