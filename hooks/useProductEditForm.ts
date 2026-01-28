import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useRef, useState } from "react";

import { guessMimeFromUri, guessNameFromUri } from "@/utils";
import { EditableImage } from "../types/product";

type InitialForm = {
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

export function useProductEditForm(initial?: InitialForm | null) {
  const [ready, setReady] = useState(false);

  // state
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [imagenes, setImagenes] = useState<EditableImage[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [slug, setSlug] = useState("");
  const [precioText, setPrecioText] = useState("0");
  const [marcaId, setMarcaId] = useState<number | null>(null);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);

  // init only once per product load
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!initial || hydratedRef.current) return;

    hydratedRef.current = true;

    setNombre(initial.nombre ?? "");
    setDescripcion(initial.descripcion ?? "");
    setCantidad(Number(initial.cantidad ?? 1));
    setIsActive(Boolean(initial.isActive ?? true));
    setSlug(String(initial.slug ?? ""));
    setPrecioText(String(initial.precioText ?? "0"));
    setMarcaId(initial.marcaId ?? null);
    setCategoriaId(initial.categoriaId ?? null);
    setImagenes(Array.isArray(initial.imagenes) ? initial.imagenes : []);

    setReady(true);
  }, [initial]);

  // sanitizar precio
  const onChangePrecio = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) cleaned = parts[0] + "." + parts.slice(1).join("");
    if (cleaned.includes(".")) {
      const [i, d] = cleaned.split(".");
      cleaned = i + "." + d.slice(0, 2);
    }
    setPrecioText(cleaned);
  };

  const removeImage = (imageId: string) => {
    setImagenes((prev) => prev.filter((img) => img.id !== imageId));
  };

  const addImagesFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsMultipleSelection: true,
      selectionLimit: 0,
    });

    if (result.canceled) return;
    const assets = result.assets ?? [];
    if (!assets.length) return;

    const newImgs: EditableImage[] = assets
      .filter((a) => typeof a.uri === "string" && a.uri.length > 0)
      .map((a, idx) => ({
        id: `local-${Date.now()}-${idx}-${a.uri}`,
        uri: a.uri,
        isLocal: true,
        name: (a as any).fileName ?? guessNameFromUri(a.uri),
        type: (a as any).mimeType ?? guessMimeFromUri(a.uri),
      }));

    setImagenes((prev) => [...prev, ...newImgs]);
  };

  const state = useMemo(
    () => ({
      nombre,
      descripcion,
      cantidad,
      imagenes,
      isActive,
      slug,
      precioText,
      marcaId,
      categoriaId,
    }),
    [nombre, descripcion, cantidad, imagenes, isActive, slug, precioText, marcaId, categoriaId]
  );

  const actions = {
    setNombre,
    setDescripcion,
    setCantidad,
    setImagenes,
    setIsActive,
    setSlug,
    setPrecioText,
    setMarcaId,
    setCategoriaId,
    onChangePrecio,
    removeImage,
    addImagesFromGallery,
  };

  return { ready, state, actions };
}
