import CartItem from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import EmptyCart from "@/components/cart/EmptyCart";
import SuccessBanner from "@/components/ui/SuccessBanner";
import { useAppStore } from "@/store/useAppStore";
import { useCartStore, type CartItem as CartItemType } from "@/store/useCartStore";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const toHNL = (n: number) =>
  new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
    maximumFractionDigits: 2,
  }).format(n);

const PLACEHOLDER =
  "https://via.placeholder.com/300x300.png?text=Sin+imagen";

const ensureUrls = (arr: unknown): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter((u) => u.length > 0);
};

// Para guardar detalles de problemas por producto
type ProblemInfo = {
  status: "insufficient_stock" | "price_mismatch" | "inactive" | "not_found";
  availableQty?: number;
  dbPrice?: number;
  nombre_producto?: string;
};

export default function CartScreen() {
  const navigation = useNavigation();

  const itemsRecord = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const products = useAppStore((s) => s.products);

  const [bannerMsg, setBannerMsg] = useState<string | undefined>(undefined);
  const [problemsById, setProblemsById] = useState<Map<number, ProblemInfo>>(
    new Map()
  );

  useEffect(() => {
    if (!bannerMsg) return;
    const t = setTimeout(() => setBannerMsg(undefined), 4000);
    return () => clearTimeout(t);
  }, [bannerMsg]);

  const itemsRaw: CartItemType[] = useMemo(
    () => Object.values(itemsRecord),
    [itemsRecord]
  );

  const items: CartItemType[] = useMemo(() => {
    const byId = new Map(products?.map((p) => [p.id, p]) ?? []);

    return itemsRaw.map((it) => {
      const cartImgs = ensureUrls(it.images);
      if (cartImgs.length > 0) return { ...it, images: cartImgs };

      const prod = byId.get(it.id);
      const prodImgs = ensureUrls(prod?.images);
      return {
        ...it,
        images: prodImgs.length > 0 ? prodImgs : [PLACEHOLDER],
      };
    });
  }, [itemsRaw, products]);

  const isEmpty = items.length === 0;

  const subtotal = totalPrice;
  const shipping = 0;
  const taxes = 0;
  const total = subtotal + shipping + taxes;

  const handleRemove = (id: number) => {
    remove(id);
    if (problemsById.size) {
      const next = new Map(problemsById);
      next.delete(id);
      setProblemsById(next);
    }
  };

  const handleChangeQty = (id: number, nextQty: number) => {
    setQty(id, Math.max(1, nextQty));
    // si el usuario ajusta cantidad, limpiamos el problema de ese ítem
    if (problemsById.has(id)) {
      const next = new Map(problemsById);
      next.delete(id);
      setProblemsById(next);
    }
  };

  // Recibe del CartSummary: mensaje + issues (con availableQty)
  const handleValidationFail = (payload: {
    message: string;
    issues: {
      id: number;
      status: ProblemInfo["status"];
      availableQty?: number;
      dbPrice?: number;
      nombre_producto?: string;
    }[];
  }) => {
    setBannerMsg(payload.message);
    const next = new Map<number, ProblemInfo>();
    payload.issues.forEach((iss) => {
      next.set(iss.id, {
        status: iss.status,
        availableQty: iss.availableQty,
        dbPrice: iss.dbPrice,
        nombre_producto: iss.nombre_producto,
      });
    });
    setProblemsById(next);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carrito</Text>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {/* Banner (absoluto) */}
        <SuccessBanner message={bannerMsg} variant="error" />

        <View style={styles.listContainer}>
          {isEmpty ? (
            <EmptyCart
              onPrimaryPress={() => router.push("/")}
              onSecondaryPress={() => router.push("/explore")}
            />
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => {
                const issue = problemsById.get(item.id);
                return (
                  <CartItem
                    item={item}
                    onChangeQty={handleChangeQty}
                    onRemove={handleRemove}
                    // ⬇️ resaltar en rojo
                    notAvailable={Boolean(issue)}
                    // ⬇️ mostrar disponibles ahora cuando sea stock insuficiente
                    qtyAvailable={
                      issue?.status === "insufficient_stock"
                        ? issue.availableQty
                        : undefined
                    }
                  />
                );
              }}
              contentContainerStyle={{ padding: 16 }}
            />
          )}
        </View>

        {/* Resumen fijo abajo (se oculta si está vacío) */}
        {!isEmpty && (
          <View style={styles.summaryContainer}>
            <CartSummary
              subtotal={subtotal}
              shipping={shipping}
              taxes={taxes}
              total={total}
              toHNL={toHNL}
              items={items}
              onValidationFail={handleValidationFail}
              // 👇 NUEVO: qué hace "Seguir comprando"
              onKeepShopping={() => router.push("/(tabs)/explore")}
              // si prefieres ir a otra pantalla:
              // onKeepShopping={() => router.push("/explore")}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD600" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD600",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  backButton: { marginRight: 8, padding: 6, borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#000" },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  listContainer: { flex: 1 },
  summaryContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
  },
});
