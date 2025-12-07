// store/useAppStore.ts
import { fetchCategorias, fetchProductosDestacados } from "@/services/api";
import { create } from "zustand";

export interface Category {
  id_categoria: number;
  nombre_categoria: string;
  activa: boolean;
  icono?: string;
}

export interface Product {
  id: number;
  slug: string;
  title: string;
  price: number;
  images: string[];
  brand?: string;
  id_categoria: number;  // necesario para filtrar
  qty: number;           // 👈 NUEVO: stock del producto
}

interface AppStore {
  categories: Category[];
  loadingCategories: boolean;
  products: Product[];
  loadingProducts: boolean;

  loadCategories: () => Promise<void>;
  loadProducts: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set) => ({
  categories: [],
  loadingCategories: false,
  products: [],
  loadingProducts: false,

  // 🚀 Cargar categorías desde la API
  loadCategories: async () => {
    try {
      set({ loadingCategories: true });
      const data = await fetchCategorias(); // ← ya devuelve el shape correcto
      set({ categories: data, loadingCategories: false });
    } catch (error) {
      console.error("Error cargando categorías:", error);
      set({ loadingCategories: false });
    }
  },

  // 🚀 Cargar productos destacados desde la API
  loadProducts: async () => {
    try {
      set({ loadingProducts: true });
      const data = await fetchProductosDestacados();

      const mapped: Product[] = data.map((prod: any) => ({
        id: Number(prod.id_producto), // o prod.id si tu API lo usa
        slug: String(prod.slug ?? prod.id_producto),
        title: String(prod.nombre_producto),
        price: Number(prod.precio),
        images: Array.isArray(prod.imagenes)
          ? prod.imagenes
              .map((img: any) => img?.url_imagen)
              .filter((u: any) => typeof u === "string" && u.length > 0)
          : [],
        brand: prod.nombre_marca || undefined,

        // id de categoría (ajusta alias si tu API usa otro nombre)
        id_categoria:
          Number(
            prod.id_categoria ??
              prod.categoria_id ??
              prod.categoryId ??
              prod.category_id
          ) || 0,

        // 👇 NUEVO: traemos la columna qty como stock
        qty: Number(
          prod.qty ??
          prod.existencia ??
          prod.stock ??
          prod.availableQty ??
          0
        ),
      }));

      set({ products: mapped, loadingProducts: false });
    } catch (error) {
      console.error("Error cargando productos destacados:", error);
      set({ loadingProducts: false });
    }
  },
}));
