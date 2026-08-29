/**
 * Storage helpers — uploads to Supabase Storage buckets ("product-images", "comunity-design" / "community-designs").
 * Returns public URLs for direct CDN access.
 */
import { supabaseAdmin } from "./supabase";

const PRODUCT_BUCKETS = ["product-images", "product_images", "products"];
const COMMUNITY_BUCKETS = [
  "comunity-design",
  "community-designs",
  "community-design",
  "comunity-designs",
];

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

/**
 * Uploads a file trying primary and fallback bucket names.
 * Ensures compatibility with whatever bucket name exists in Supabase.
 */
async function uploadWithFallback(
  candidateBuckets: string[],
  key: string,
  fileBody: Buffer | Uint8Array,
  contentType: string,
): Promise<{ key: string; url: string }> {
  let lastError: any = null;

  for (const bucketName of candidateBuckets) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(key, fileBody, {
          contentType,
          upsert: true,
        });

      if (!error) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from(bucketName)
          .getPublicUrl(key);

        console.log(`[Storage] Successfully uploaded to bucket "${bucketName}" (path: ${key})`);
        return { key, url: publicUrlData.publicUrl };
      }

      lastError = error;
      console.warn(`[Storage] Upload to "${bucketName}" failed:`, error.message);

      // If error is not "not found", stop and throw immediately
      if (!error.message?.toLowerCase().includes("not found")) {
        throw new Error(`Supabase Storage upload failed: ${error.message}`);
      }
    } catch (err: any) {
      lastError = err;
      if (err.message && !err.message.toLowerCase().includes("not found")) {
        throw err;
      }
    }
  }

  throw new Error(
    `Supabase Storage upload failed: Bucket not found. Tried [${candidateBuckets.join(", ")}]. Please make sure a public bucket named "comunity-design" or "community-designs" exists in Supabase Storage.`
  );
}

/**
 * Initializes and verifies storage buckets on startup.
 */
export async function initStorageBuckets(): Promise<void> {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (buckets) {
      console.log(
        "[Storage] Supabase buckets available:",
        buckets.map((b) => b.name).join(", ") || "(none)",
      );
    }
  } catch (err) {
    console.warn("[Storage] Startup bucket listing notice:", err);
  }
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  const fileBody = typeof data === "string" ? Buffer.from(data, "base64") : data;
  return uploadWithFallback(PRODUCT_BUCKETS, key, fileBody, contentType);
}

export async function storageDelete(key: string): Promise<void> {
  for (const b of PRODUCT_BUCKETS) {
    try {
      const { error } = await supabaseAdmin.storage
        .from(b)
        .remove([normalizeKey(key)]);
      if (!error) break;
    } catch {
      // try next bucket
    }
  }
}

export async function communityStoragePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  const fileBody = typeof data === "string" ? Buffer.from(data, "base64") : data;
  return uploadWithFallback(COMMUNITY_BUCKETS, key, fileBody, contentType);
}

export async function communityStorageDelete(key: string): Promise<void> {
  for (const b of COMMUNITY_BUCKETS) {
    try {
      const { error } = await supabaseAdmin.storage
        .from(b)
        .remove([normalizeKey(key)]);
      if (!error) break;
    } catch {
      // try next bucket
    }
  }
}
