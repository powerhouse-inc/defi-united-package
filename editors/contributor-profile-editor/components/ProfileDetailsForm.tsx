import { useEffect, useState } from "react";
import type {
  ContributorKind,
  ContributorProfileState,
} from "../../../document-models/contributor-profile/v1/gen/schema/types.js";
import { KIND_LABEL, KIND_OPTIONS } from "./constants.js";

type FormValues = {
  legalName: string;
  displayName: string;
  kind: ContributorKind;
  websiteUrl: string;
  twitterHandle: string;
  farcasterHandle: string;
};

function toFormValues(state: ContributorProfileState): FormValues {
  return {
    legalName: state.legalName ?? "",
    displayName: state.displayName ?? "",
    kind: state.kind,
    websiteUrl: state.websiteUrl ?? "",
    twitterHandle: state.twitterHandle ?? "",
    farcasterHandle: state.farcasterHandle ?? "",
  };
}

export function ProfileDetailsForm({
  state,
  onSave,
}: {
  state: ContributorProfileState;
  onSave: (values: {
    legalName?: string | null;
    displayName?: string | null;
    kind?: ContributorKind | null;
    websiteUrl?: string | null;
    twitterHandle?: string | null;
    farcasterHandle?: string | null;
  }) => void;
}) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(state));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) {
      setValues(toFormValues(state));
    }
  }, [state, dirty]);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      legalName: values.legalName.trim() || null,
      displayName: values.displayName.trim() || null,
      kind: values.kind,
      websiteUrl: values.websiteUrl.trim() || null,
      twitterHandle: values.twitterHandle.trim() || null,
      farcasterHandle: values.farcasterHandle.trim() || null,
    });
    setDirty(false);
  }

  function handleReset() {
    setValues(toFormValues(state));
    setDirty(false);
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.06em] text-neutral-700">
          Profile details
        </h2>
        {dirty ? (
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-amber-600">
            Unsaved changes
          </span>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <Field label="Display name" htmlFor="cp-displayName">
          <input
            id="cp-displayName"
            type="text"
            value={values.displayName}
            onChange={(e) => update("displayName", e.target.value)}
            className="cp-input"
            placeholder="e.g. Aave DAO"
          />
        </Field>

        <Field label="Legal name" htmlFor="cp-legalName">
          <input
            id="cp-legalName"
            type="text"
            value={values.legalName}
            onChange={(e) => update("legalName", e.target.value)}
            className="cp-input"
            placeholder="e.g. Aave Companies Ltd."
          />
        </Field>

        <Field label="Kind" htmlFor="cp-kind">
          <select
            id="cp-kind"
            value={values.kind}
            onChange={(e) => update("kind", e.target.value as ContributorKind)}
            className="cp-input"
          >
            {KIND_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {KIND_LABEL[option]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Website URL" htmlFor="cp-website">
          <input
            id="cp-website"
            type="url"
            value={values.websiteUrl}
            onChange={(e) => update("websiteUrl", e.target.value)}
            className="cp-input"
            placeholder="https://example.org"
          />
        </Field>

        <Field label="Twitter handle" htmlFor="cp-twitter">
          <input
            id="cp-twitter"
            type="text"
            value={values.twitterHandle}
            onChange={(e) => update("twitterHandle", e.target.value)}
            className="cp-input"
            placeholder="@aave"
          />
        </Field>

        <Field label="Farcaster handle" htmlFor="cp-farcaster">
          <input
            id="cp-farcaster"
            type="text"
            value={values.farcasterHandle}
            onChange={(e) => update("farcasterHandle", e.target.value)}
            className="cp-input"
            placeholder="aave"
          />
        </Field>

        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={!dirty}
            className="cp-btn cp-btn-ghost"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={!dirty}
            className="cp-btn cp-btn-primary"
          >
            Save details
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}
