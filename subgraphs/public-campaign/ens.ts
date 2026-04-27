/**
 * ENS reverse-resolution helper for the public-campaign subgraph.
 *
 * For each Ethereum address we encounter on a recent transfer, look up
 * the canonical ENS name via the Universal Resolver contract and cache
 * the result in-process. ENS reverse records change rarely, so a 24h
 * TTL is plenty.
 *
 * Universal Resolver `reverse(bytes node)` does the full dance in a
 * single call:
 *   - looks up the reverse record for the address
 *   - resolves the resulting name to its canonical name
 *   - forward-verifies the name actually resolves back to the same
 *     address (avoids spoofed reverse records)
 * Returns ABI-encoded `(string name, address resolver, address reverseResolver)`.
 *
 * Mainnet Universal Resolver: 0xeEeEEEeeeEeEeeEeEEEEeeEEeEeeeeeEeeeeeeEE
 *   (deployed 2024 by ENS Labs; latest stable is 0xce01... — but
 *   reverse() ABI is consistent across versions)
 */

// Mainnet Universal Resolver (deployment ce01... has stable reverse() ABI)
const UNIVERSAL_RESOLVER = "0xce01f8eee7E479C928F8919abD53E553a36CeF67";

// `reverse(bytes)` selector + the reverse-name encoding helper
const REVERSE_SELECTOR = "0x55ea6c47";

interface JsonRpcResponse<T> {
  jsonrpc: "2.0";
  result?: T;
  error?: { code: number; message: string };
  id: number;
}

const cache = new Map<string, { name: string | null; at: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
let _reqId = 0;

/**
 * Encode the byte-length-prefixed DNS-style name for `<addr>.addr.reverse`.
 * Each label is `len-byte || ascii-bytes`, terminated by 0x00.
 */
function encodeReverseName(addr: string): string {
  const lower = addr.replace(/^0x/, "").toLowerCase();
  const label = lower; // 40 hex chars
  const labels = [label, "addr", "reverse"];
  let bytes = "";
  for (const l of labels) {
    const len = l.length.toString(16).padStart(2, "0");
    bytes += len;
    for (const ch of l) bytes += ch.charCodeAt(0).toString(16).padStart(2, "0");
  }
  return "0x" + bytes + "00";
}

/** ABI-encode `reverse(bytes)` — selector + dynamic bytes parameter. */
function encodeCalldata(addr: string): string {
  const reverseName = encodeReverseName(addr).replace(/^0x/, "");
  // ABI: offset (32 bytes) || length (32 bytes) || data padded to 32 bytes
  const offset = "20".padStart(64, "0"); // 0x20
  const lengthBytes = reverseName.length / 2;
  const length = lengthBytes.toString(16).padStart(64, "0");
  const padded =
    reverseName + "0".repeat((64 - (reverseName.length % 64)) % 64);
  return REVERSE_SELECTOR + offset + length + padded;
}

/**
 * Decode the first ABI-encoded string from `reverse()`'s return data.
 * The return is `(string, address, address)` — we only care about the name.
 */
function decodeFirstString(hex: string): string {
  const data = hex.replace(/^0x/, "");
  if (data.length === 0) return "";
  // First 32 bytes = offset to first dynamic param (string)
  const offsetHex = data.slice(0, 64);
  const offset = parseInt(offsetHex, 16) * 2; // bytes → hex chars
  if (Number.isNaN(offset) || offset + 64 > data.length) return "";
  const lengthHex = data.slice(offset, offset + 64);
  const len = parseInt(lengthHex, 16) * 2;
  if (Number.isNaN(len) || len === 0) return "";
  const stringHex = data.slice(offset + 64, offset + 64 + len);
  let out = "";
  for (let i = 0; i < stringHex.length; i += 2) {
    out += String.fromCharCode(parseInt(stringHex.slice(i, i + 2), 16));
  }
  return out;
}

async function ethCall(
  url: string,
  to: string,
  data: string,
): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [{ to, data }, "latest"],
        id: ++_reqId,
      }),
    });
    const body = (await res.json()) as JsonRpcResponse<string>;
    if (body.error || !body.result) return null;
    return body.result;
  } catch {
    return null;
  }
}

/**
 * Resolve a single address to its primary ENS name (or null if no
 * reverse record / forward verification fails). Cached 24h.
 */
export async function resolveEns(
  alchemyUrl: string,
  address: string,
): Promise<string | null> {
  const key = address.toLowerCase();
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.at < CACHE_TTL_MS) return hit.name;

  const calldata = encodeCalldata(key);
  const result = await ethCall(alchemyUrl, UNIVERSAL_RESOLVER, calldata);
  let name: string | null = null;
  if (result && result !== "0x") {
    try {
      const decoded = decodeFirstString(result);
      name = decoded || null;
    } catch {
      name = null;
    }
  }
  cache.set(key, { name, at: now });
  return name;
}

/** Batch-resolve a list of addresses. Returns a Map keyed by lowercase address. */
export async function resolveEnsBatch(
  alchemyUrl: string | undefined,
  addresses: string[],
): Promise<Map<string, string | null>> {
  const out = new Map<string, string | null>();
  if (!alchemyUrl) return out;
  const unique = [...new Set(addresses.map((a) => a.toLowerCase()))];
  await Promise.all(
    unique.map(async (a) => {
      const name = await resolveEns(alchemyUrl, a);
      out.set(a, name);
    }),
  );
  return out;
}
