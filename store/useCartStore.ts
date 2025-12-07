// useCartStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  id: number;
  title: string;
  price: number;
  images: string[];
  quantity: number;
  inStock?: number;
};

type CartState = {
  // key = String(id)
  items: Record<string, CartItem>;

  // Selectores
  totalItems: () => number;
  totalLines: () => number;
  totalPrice: () => number;

  // Acciones
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQty: (idKey: number | string, qty: number) => void;
  remove: (idKey: number | string) => void;
  clear: () => void;

  // 👇 NUEVA ACCIÓN
  applyServerPrices: (server: Array<{ id: number; dbPrice?: number }>) => void;
};

const idKeyOf = (id: number | string) => String(id);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},

      totalItems: () =>
        Object.values(get().items).reduce((acc, it) => acc + it.quantity, 0),
      totalLines: () => Object.keys(get().items).length,
      totalPrice: () =>
        Object.values(get().items).reduce((acc, it) => acc + it.price * it.quantity, 0),

      add: (item, qty = 1) => {
        set((state) => {
          const key = idKeyOf(item.id);
          const current = state.items[key];
          const nextQtyRaw = (current?.quantity ?? 0) + qty;

          const max =
            typeof item.inStock === "number"
              ? item.inStock
              : typeof current?.inStock === "number"
              ? current.inStock
              : Infinity;

          const nextQty = Math.max(1, Math.min(nextQtyRaw, max));

          return {
            items: {
              ...state.items,
              [key]: {
                id: item.id,
                title: item.title,
                price: item.price,
                images: item.images?.length ? item.images : current?.images ?? [],
                inStock:
                  typeof item.inStock === "number" ? item.inStock : current?.inStock,
                quantity: nextQty,
              },
            },
          };
        });
      },

      setQty: (idKey, qty) => {
        set((state) => {
          const key = idKeyOf(idKey);
          const it = state.items[key];
          if (!it) return state;

          const max = typeof it.inStock === "number" ? it.inStock : Infinity;
          const nextQty = Math.max(1, Math.min(qty, max));

          return { items: { ...state.items, [key]: { ...it, quantity: nextQty } } };
        });
      },

      remove: (idKey) => {
        set((state) => {
          const key = idKeyOf(idKey);
          const copy = { ...state.items };
          delete copy[key];
          return { items: copy };
        });
      },

      clear: () => set({ items: {} }),

      // 🔥 Actualiza precios locales con los dbPrice del server
      applyServerPrices: (server) => {
        set((state) => {
          // Mapa id -> dbPrice (solo los válidos)
          const map = new Map(
            server
              .filter((s) => typeof s.dbPrice === "number")
              .map((s) => [idKeyOf(s.id), Number(s.dbPrice)])
          );

          if (map.size === 0) return state;

          const next: Record<string, CartItem> = {};
          for (const [key, it] of Object.entries(state.items)) {
            const newPrice = map.get(key);
            next[key] = newPrice != null ? { ...it, price: newPrice } : it;
          }
          return { items: next };
        });
      },
    }),
    {
      name: "bisneando-cart-v1",
      storage: createJSONStorage(() => AsyncStorage),
      version: 5,
      migrate: async (persisted: any, fromVersion: number) => {
        if (fromVersion < 5 && persisted?.state?.items) {
          const oldItems: Record<string, any> = persisted.state.items;
          const newItems: Record<string, CartItem> = {};
          for (const [, it] of Object.entries(oldItems)) {
            const id = Number(it.id);
            const key = idKeyOf(id);
            const images =
              Array.isArray(it.images) ? it.images : it.image ? [it.image] : [];
            const inStock =
              typeof it.inStock === "number"
                ? it.inStock
                : typeof it.maxQty === "number"
                ? it.maxQty
                : undefined;

            newItems[key] = {
              id,
              title: String(it.title),
              price: Number(it.price),
              images,
              quantity: Number(it.quantity ?? 1),
              inStock,
            };
          }
          return {
            ...persisted,
            state: { ...persisted.state, items: newItems },
            version: 5,
          };
        }
        return persisted;
      },
    }
  )
);
