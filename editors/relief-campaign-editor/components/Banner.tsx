interface BannerProps {
  tone: "info" | "success" | "error";
  message: string;
  onDismiss?: () => void;
}

const TONE_CLASSES: Record<BannerProps["tone"], string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
};

export function Banner({ tone, message, onDismiss }: BannerProps) {
  return (
    <div
      role="status"
      className={`flex items-center justify-between gap-3 rounded-md border px-4 py-2 text-sm ${TONE_CLASSES[tone]}`}
    >
      <span>{message}</span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md px-2 py-1 text-xs font-medium opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
