export function formatAmount(
  value: number | undefined | null,
  _locale?: string,
): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value === 0) return "0";
  if (value >= 100) return value.toFixed(0);
  if (value >= 1) return value.toFixed(2);
  return value.toFixed(4);
}

export function truncateAddress(addr: string | null | undefined): string {
  if (!addr) return "—";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function truncateHash(hash: string | null | undefined): string {
  if (!hash) return "—";
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-4)}`;
}

export function truncatePhid(phid: string | null | undefined): string {
  if (!phid) return "—";
  if (phid.length <= 14) return phid;
  return `${phid.slice(0, 8)}…${phid.slice(-4)}`;
}

export function formatRelativeTime(iso: string | undefined | null): string {
  if (!iso) return "—";
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return "—";
  const now = Date.now();
  const diff = now - target;
  const absDiff = Math.abs(diff);

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const suffix = diff > 0 ? "ago" : "from now";

  if (seconds < 60)
    return `${seconds} second${seconds !== 1 ? "s" : ""} ${suffix}`;
  if (minutes < 60)
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ${suffix}`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ${suffix}`;
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ${suffix}`;

  return new Date(iso).toLocaleDateString();
}
