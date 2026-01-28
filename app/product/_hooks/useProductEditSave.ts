import type { EditableImage } from "@/app/product/_types";
import { updateProductoById } from "@/services/api";
import { useState } from "react";
import { guessMimeFromUri, guessNameFromUri } from "../_utils/imageUtils";

type FormState = {
  nombre: string;
  descripcion: string;
  cantidad: number;
  isActive: boolean;
  slug: string;
  precioText: string;
  marcaId: number | null;
  categoriaId: number | null;
  imagenes: EditableImage[];
};

type Params = {
  idProducto: number;
  form: FormState;
  onSaved?: () => void; // ✅ FIX
};

export function useProductEditSave({ idProducto, form, onSaved }: Params) {
  const [saving, setSaving] = useState(false);

  const saveChanges = async () => {
    if (!Number.isFinite(idProducto) || idProducto <= 0) return;

    const safeSlug =
      (form.slug && form.slug.trim()) ||
      form.nombre
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "");

    const precioNum = Number(form.precioText);
    const safePrecio = Number.isFinite(precioNum) ? precioNum : 0;

    const keepUrls = (form.imagenes ?? [])
      .filter((img) => !img.isLocal)
      .map((img) => img.uri)
      .filter((u) => typeof u === "string" && u.trim().length > 0)
      .map((u) => u.trim());

    const files = (form.imagenes ?? [])
      .filter((img) => img.isLocal)
      .map((img) => {
        const type = img.type ?? guessMimeFromUri(img.uri);
        const name = img.name ?? guessNameFromUri(img.uri);
        return { uri: img.uri, name, type } as any;
      });

    setSaving(true);
    try {
      const payload: any = {
        nombre_producto: form.nombre.trim(),
        descripcion: form.descripcion ?? "",
        qty: Number(form.cantidad ?? 0),
        is_active: Boolean(form.isActive),
        id_categoria: Number(form.categoriaId),
        id_marca: form.marcaId ?? null,
        slug: safeSlug,
        precio: safePrecio,
        en_revision: true,
        keepUrls,
        files,
      };

      const updated = await updateProductoById(idProducto, payload);
      if (!updated) throw new Error("No se pudo actualizar (updateProductoById devolvió null)");

      onSaved?.(); // ✅ FIX: ya existe
      return updated;
    } finally {
      setSaving(false);
    }
  };

  return { saving, saveChanges };
}
