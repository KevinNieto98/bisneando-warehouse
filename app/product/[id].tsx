import { ProductSkeleton } from "@/components";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { ProductDescription } from "@/components/product/ProductDescription";
import { ProductGridSimilares } from "@/components/product/ProductGridSimilares";
import { ProductHeader } from "@/components/product/ProductHeader";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductPriceBox } from "@/components/product/ProductPriceBox";
import SuccessToast from "@/components/ui/SuccessToast";
import { fetchProductoById } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ProductAPI = {
  id_producto: number | string;
  slug?: string;
  nombre_producto: string;
  nombre_marca?: string;
  precio: number | string;
  qty?: number | string;          // stock
  imagenes?: string[];            // urls
  descripcion?: string;
};

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = id ? Number(id) : undefined;

  // ---- STATE
  const [producto, setProducto] = useState<ProductAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, _setCantidad] = useState(1);

  // ---- STORES (hooks siempre arriba)
  const addToCart = useCartStore((s) => s.add);
  const setQtyStore = useCartStore((s) => s.setQty);
  const itemsMap = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems());
  const cartLine = useCartStore((s) =>
    routeId != null ? s.items[String(routeId)] : undefined
  );

  const products = useAppStore((state) => state.products);

  // ---- UI helpers
  const [addedVisible, setAddedVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerAddedToast = () => {
    try { Haptics.selectionAsync(); } catch {}
    setAddedVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setAddedVisible(false), 1400);
  };

  // ---- Utils
  const clampByStock = (val: number, stk: number) =>
    Math.max(1, Math.min(stk || 1, val));

  // ---- EFFECT: cargar producto
  useEffect(() => {
    if (!id) return;
    const loadProduct = async () => {
      try {
        const data = await fetchProductoById(Number(id));
        setProducto(data);
        const stock = Number(data?.qty ?? 0);

        // sincroniza cantidad con el carrito si ya está
        const inCartQty = cartLine?.quantity ?? 0;
        const base = inCartQty > 0 ? inCartQty : 1;
        _setCantidad(stock > 0 ? Math.min(base, stock) : 1);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---- Datos derivados (no hooks)
  const stock = Number(producto?.qty ?? 0);
  const idNum = Number(producto?.id_producto ?? 0);
  const existsInCart = !!itemsMap[String(idNum)];
  const currentInCart = cartLine?.quantity ?? 0;

  // ---- EFFECT: reflejar cambios externos del carrito -> SOLO si cambia de verdad
  useEffect(() => {
    if (!producto) return;
    if (currentInCart <= 0) return;
    const next = clampByStock(currentInCart, stock);
    if (next !== cantidad) {
      _setCantidad(next);
    }
  }, [currentInCart, producto, stock, cantidad]);

  // ⚠️ IMPORTANTE: NO hay efecto de "autosync".
  // La sincronización automática se hace DIRECTO en el handler setCantidad,
  // para evitar ciclos de: setQtyStore -> cambia cartLine -> efecto -> setCantidad -> ...

  // ---- Handler: usuario mueve el contador
  const setCantidad = (next: number) => {
    const clamped = clampByStock(next, stock);
    // 1) actualiza UI local
    _setCantidad(clamped);

    // 2) si ya existe en carrito, sincroniza store solo si realmente cambia
    if (existsInCart && stock > 0 && clamped !== currentInCart) {
      setQtyStore(idNum, clamped);
    }
  };

  // ---- UI
  if (loading) return <ProductSkeleton />;

  if (!producto) {
    return (
      <View style={styles.centered}>
        <Text>No se encontró el producto</Text>
      </View>
    );
  }

  // Helper para mapear al carrito
  const mapProductoToCart = (p: ProductAPI) => ({
    id: Number(p.id_producto),
    title: p.nombre_producto,
    price: Number(p.precio),
    images: p.imagenes ?? [],
    inStock: Number(p.qty ?? 0) || undefined,
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />
      <ProductHeader totalItems={totalItems} />

      <FlatList
        data={[]}
        keyExtractor={() => "dummy"}
        renderItem={() => null}
        ListHeaderComponent={
          <View style={styles.content}>
            <SuccessToast
              visible={addedVisible}
              text="Agregado al carrito"
              iconName="checkmark-circle-outline"
            />

            <ProductCarousel imagenes={producto.imagenes ?? []} />

            <ProductInfo
              marca={producto.nombre_marca?.toUpperCase?.() || ""}
              nombre={producto.nombre_producto}
            />

            <ProductActions
              cantidad={cantidad}
              setCantidad={setCantidad}
              maxQty={stock}
              onWhatsApp={() => {}}
              onShare={() => {}}
            />

            <ProductPriceBox
              precio={Number(producto.precio)}
              qty={stock}
              onAdd={() => {
                if (cantidad > stock || stock <= 0) return;

                if (!existsInCart) {
                  addToCart(mapProductoToCart(producto), cantidad);
                }
                triggerAddedToast();
              }}
              onBuy={() => {
                if (cantidad > stock || stock <= 0) return;

                if (!existsInCart) {
                  addToCart(mapProductoToCart(producto), cantidad);
                } else {
                  // Por seguridad, al comprar fija exacto lo que está en el contador
                  setQtyStore(idNum, clampByStock(cantidad, stock));
                }
                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
                router.push("/cart");
              }}
            />

            <ProductDescription descripcion={producto.descripcion ?? ""} />

            {products && products.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <Text style={styles.similaresTitle}>Productos Similares</Text>
                <ProductGridSimilares products={products} />
              </View>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD600" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  similaresTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111",
  },
});
