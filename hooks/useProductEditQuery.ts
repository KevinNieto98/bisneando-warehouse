import { useEffect, useMemo, useState } from "react";
import type { Category, MarcaRow, Option, ProductAPI } from "../types/product";

import { mapProductToInitialForm } from "@/utils/mappers";
import { apiFetchCategorias, apiFetchMarcas, apiFetchProductoById } from "../services/product/productApi";

export function useProductEditQuery(idProducto: number) {
  const [producto, setProducto] = useState<ProductAPI | null>(null);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [marcas, setMarcas] = useState<MarcaRow[]>([]);
  const [loadingMarcas, setLoadingMarcas] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingCategories(true);
        const data = await apiFetchCategorias();
        if (!mounted) return;
        setCategories(Array.isArray(data) ? (data as Category[]) : []);
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingMarcas(true);
        const data = await apiFetchMarcas();
        if (!mounted) return;
        setMarcas(Array.isArray(data) ? (data as MarcaRow[]) : []);
      } finally {
        if (mounted) setLoadingMarcas(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

 useEffect(() => {
    if (!idProducto || Number.isNaN(idProducto)) return;

    let mounted = true;

    (async () => {
      try {
        const data = await apiFetchProductoById(idProducto);
        if (!mounted) return;
        setProducto(data ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [idProducto]);

  const categoriaOptions: Option[] = useMemo(() => {
    return (categories ?? [])
      .filter((c) => c.activa)
      .slice()
      .sort((a, b) => String(a.nombre_categoria).localeCompare(String(b.nombre_categoria)))
      .map((c) => ({ id: c.id_categoria, label: c.nombre_categoria }));
  }, [categories]);

  const marcaOptions: Option[] = useMemo(() => {
    return (marcas ?? [])
      .filter((m) => m.is_active)
      .slice()
      .sort((a, b) => String(a.nombre_marca).localeCompare(String(b.nombre_marca)))
      .map((m) => ({ id: m.id_marca, label: m.nombre_marca }));
  }, [marcas]);

  const initialForm = useMemo(() => {
    if (!producto) return null;
    return mapProductToInitialForm(producto);
  }, [producto]);

  return {
    loading,
    producto,
    setProducto,

    categories,
    loadingCategories,
    categoriaOptions,

    marcas,
    loadingMarcas,
    marcaOptions,

    initialForm,
  };
}
