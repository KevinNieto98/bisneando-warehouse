import type { EditableImage, ProductAPI, ProductoImagenAPI } from "../_types";
import { normalizeImageUri } from "./imageUtils";

export function mapApiImagesToEditableImages(
  imagenes: (string | ProductoImagenAPI)[] | undefined
): EditableImage[] {
  const raw = Array.isArray(imagenes) ? imagenes : [];

  return raw
    .map((item, idx): EditableImage | null => {
      const uri = normalizeImageUri(item);
      if (!uri) return null;

      const meta =
        typeof item === "object" && item ? (item as ProductoImagenAPI) : undefined;

      return {
        id: meta?.orden != null ? `remote-orden-${meta.orden}-${uri}` : `remote-${idx}-${uri}`,
        uri,
        isLocal: false, // ✅ ok
        orden: meta?.orden,
        is_principal: meta?.is_principal,
      };
    })
    .filter((x): x is EditableImage => x !== null)
    .sort((a, b) => (a.orden ?? 9999) - (b.orden ?? 9999));
}

export function mapProductToInitialForm(p: ProductAPI) {
  return {
    nombre: p?.nombre_producto ?? "",
    descripcion: p?.descripcion ?? "",
    cantidad: Number(p?.qty ?? 1),
    isActive: Boolean(p?.is_active ?? true),
    slug: String(p?.slug ?? ""),
    precioText: String(Number(p?.precio ?? 0)),
    marcaId: typeof p?.id_marca === "number" ? p.id_marca : null,
    categoriaId: typeof p?.id_categoria === "number" ? p.id_categoria : null,
    imagenes: mapApiImagesToEditableImages(p?.imagenes),
  };
}
