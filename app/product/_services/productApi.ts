import {
    fetchCategorias,
    fetchMarcas,
    fetchProductoById,
    updateProductoById,
} from "@/services/api";

import type { UpdateProductoJsonPayload } from "../_types";

export async function apiFetchCategorias() {
  return fetchCategorias();
}

export async function apiFetchMarcas() {
  return fetchMarcas();
}

export async function apiFetchProductoById(id: number) {
  return fetchProductoById(id);
}

/**
 * Reusa tu updateProductoById pero SOLO en modo JSON.
 * Asegúrate de que updateProductoById NO fuerce multipart cuando hay keepUrls.
 */
export async function apiUpdateProductoJson(id: number, payload: UpdateProductoJsonPayload) {
  return updateProductoById(id, payload as any);
}
