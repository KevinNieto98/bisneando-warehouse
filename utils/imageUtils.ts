
export function normalizeImageUri(item: unknown): string | null {
  if (!item) return null;

  if (typeof item === "string") {
    const s = item.trim();
    return s.length ? s : null;
  }

  if (typeof item === "object") {
    const obj = item as Record<string, unknown>;
    const candidate =
      (obj.url_imagen as any) ??
      (obj.url as any) ??
      (obj.uri as any) ??
      (obj.src as any) ??
      (obj.path as any) ??
      (obj.location as any) ??
      null;

    if (typeof candidate === "string") {
      const s = candidate.trim();
      return s.length ? s : null;
    }
  }

  return null;
}

export function guessMimeFromUri(uri: string) {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".heic")) return "image/heic";
  return "image/jpeg";
}

export function guessNameFromUri(uri: string) {
  const clean = uri.split("?")[0];
  const last = clean.split("/").pop();
  if (last && last.includes(".")) return last;
  return `img-${Date.now()}.jpg`;
}

export function toSlug(s: string) {
  return (s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");
}

export function buildStoragePath(productId: number, index: number, name: string) {
  const clean = (name || "img")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "");
  return `${productId}/${Date.now()}-${index + 1}-${clean}`;
}
