/**
 * Storage helpers — uploads to Supabase Storage bucket "product-images".
 * Returns public URLs for direct CDN access.
 */
import { supabaseAdmin } from "./supabase";

const BUCKET = "product-images";
const COMMUNITY_BUCKET = "community-designs";

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));

  const fileBody = typeof data === "string"
    ? Buffer.from(data, "base64")
    : data;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(key, fileBody, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(key);

  return { key, url: publicUrlData.publicUrl };
}

export async function storageDelete(key: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .remove([normalizeKey(key)]);

  if (error) {
    console.warn(`[Storage] Failed to delete ${key}:`, error.message);
  }
}

export async function communityStoragePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));

  const fileBody = typeof data === "string"
    ? Buffer.from(data, "base64")
    : data;

  const { error } = await supabaseAdmin.storage
    .from(COMMUNITY_BUCKET)
    .upload(key, fileBody, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(COMMUNITY_BUCKET)
    .getPublicUrl(key);

  return { key, url: publicUrlData.publicUrl };
}

export async function communityStorageDelete(key: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(COMMUNITY_BUCKET)
    .remove([normalizeKey(key)]);

  if (error) {
    console.warn(`[Storage] Failed to delete community file ${key}:`, error.message);
  }
}
