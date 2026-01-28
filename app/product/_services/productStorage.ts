import { supabase } from "@/lib/supabase";
import type { EditableImage } from "../_types";
import { buildStoragePath, guessMimeFromUri, guessNameFromUri } from "../_utils/imageUtils";

const BUCKET = "imagenes_productos";

async function uriToBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  if (!res.ok) throw new Error(`No se pudo leer archivo local: ${res.status}`);
  return await res.blob();
}

export async function uploadLocalImagesToSupabase(
  productId: number,
  locals: EditableImage[]
): Promise<string[]> {
  const newUrls: string[] = [];

  for (let i = 0; i < locals.length; i++) {
    const img = locals[i];

    const uri = img.uri;
    const name = img.name ?? guessNameFromUri(uri);
    const mime = img.type ?? guessMimeFromUri(uri);

    const path = buildStoragePath(productId, i, name);
    const blob = await uriToBlob(uri);

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, {
      upsert: true,
      contentType: mime,
      cacheControl: "3600",
    });

    if (upErr) throw new Error(`Error subiendo imagen: ${upErr.message}`);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error("No se pudo obtener publicUrl.");
    newUrls.push(data.publicUrl);
  }

  return newUrls;
}
