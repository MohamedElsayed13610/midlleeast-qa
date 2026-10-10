import { cmsClient, cmsConfigured } from "@/lib/cms-server";
import type { DocumentMime } from "@/lib/consultation";

// Temporary document links: /consultation-files/{token}. Only the SHA-256 hash is stored in the database.
export const shareTokenPattern = /^[A-Za-z0-9_-]{43}$/;
const toHex = (bytes: ArrayBuffer) => Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");

export function generateShareToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32)); // 256 bits
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export async function hashShareToken(token: string) {
  return toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)));
}

export type SharedDocument = { id: string; name: string; type: DocumentMime; size: number; path: string };
export type ResolvedShare = { reference: string; expiresAt: string; hash: string; documents: SharedDocument[] };
type Row = { reference_number: string; expires_at: string; doc_id: string; original_name: string; mime_type: DocumentMime; size_bytes: number; storage_path: string };

/** Returns null for anything invalid, expired, revoked or unknown: callers must not distinguish these cases. */
export async function resolveShare(token: string): Promise<ResolvedShare | null> {
  if (!cmsConfigured() || !shareTokenPattern.test(token)) return null;
  const hash = await hashShareToken(token);
  const result = await cmsClient().rpc("resolve_consultation_share", { p_hash: hash });
  const rows = (result.data ?? []) as Row[];
  if (result.error || !rows.length) return null;
  return { reference: rows[0].reference_number, expiresAt: rows[0].expires_at, hash, documents: rows.map(row => ({ id: row.doc_id, name: row.original_name, type: row.mime_type, size: Number(row.size_bytes), path: row.storage_path })) };
}
