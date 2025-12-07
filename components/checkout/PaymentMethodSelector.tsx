// components/checkout/PaymentMethodSelector.tsx
import { fetchMetodosActivos } from "@/services/api";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Icono from "../ui/Icon.native";

type MetodoApi = {
  id_metodo?: number;
  id?: number | string;
  nombre_metodo?: string | null;
  nombre?: string | null;
  name?: string | null;
  icono?: string | null;   // nombre Lucide opcional (ej: Banknote, CreditCard)
  is_active?: boolean;
};

type UiMetodo = {
  id: number;                // id_metodo
  code: "efectivo" | "tarjeta";
  label: string;             // nombre visible
  icon: string;              // Lucide name
};

const BRAND_YELLOW = "#facc15";
const AMBER_100 = "#fef3c7";
const AMBER_500 = "#f59e0b";

const toStr = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const toNum = (v: unknown) => (typeof v === "number" ? v : Number(v));

const iconNameByCode: Record<UiMetodo["code"], string> = {
  efectivo: "Wallet",
  tarjeta: "CreditCard",
};

// 🔐 regla: sólo id=2 es tarjeta; el resto es efectivo
export const codeFromId = (id: number): UiMetodo["code"] =>
  id === 2 ? "tarjeta" : "efectivo";

const normalizeMetodo = (m: MetodoApi): UiMetodo | null => {
  const id =
    Number.isFinite(m?.id_metodo) ? (m!.id_metodo as number) :
    Number.isFinite(toNum(m?.id)) ? (toNum(m?.id) as number) :
    Number.NaN;
  if (!Number.isFinite(id)) return null;

  const label =
    toStr(m?.nombre_metodo) ||
    toStr(m?.nombre) ||
    toStr(m?.name) ||
    `Método #${id}`;

  const code = codeFromId(id);
  const iconCandidate = toStr(m?.icono);
  const icon = iconCandidate || iconNameByCode[code] || "Tags";

  return { id, code, label, icon };
};

const isCardMethodById = (id?: number) => id === 2;

type Props = {
  /** ID del método seleccionado (controlado por el padre) */
  selectedMethodId: number | null;
  /** Callback cuando el usuario selecciona un método */
  onSelectMethod: (id: number, code: "efectivo" | "tarjeta") => void;

  /** Formulario de tarjeta (controlado por el padre) */
  cardForm: { holder: string; number: string; expiry: string; cvv: string };
  setCardForm: React.Dispatch<React.SetStateAction<{ holder: string; number: string; expiry: string; cvv: string }>>;

  /** Reporta el estado de carga al padre */
  onLoadingChange?: (loading: boolean) => void;
};

export function PaymentMethodSelector({
  selectedMethodId,
  onSelectMethod,
  cardForm,
  setCardForm,
  onLoadingChange,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [methods, setMethods] = useState<UiMetodo[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Carga métodos activos (solo API; sin fallbacks ni autoselección)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        onLoadingChange?.(true);
        setError(null);
        setMethods([]);

        const raw = await fetchMetodosActivos();
        const parsed = (Array.isArray(raw) ? raw : [])
          .map(normalizeMetodo)
          .filter((x): x is UiMetodo => Boolean(x));

        if (!mounted) return;

        if (parsed.length === 0) {
          setError("No hay métodos de pago activos por el momento.");
          setMethods([]);
          return;
        }

        setMethods(parsed);
      } catch (e) {
        console.error("PaymentMethodSelector: error cargando métodos:", e);
        if (mounted) {
          setError("No se pudieron mostrar los métodos de pago.");
          setMethods([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          onLoadingChange?.(false);
        }
      }
    })();
    return () => {
      mounted = false;
      onLoadingChange?.(false);
    };
  }, [onLoadingChange]);

  // Método seleccionado por ID (único)
  const selected = useMemo(
    () => methods.find((m) => m.id === selectedMethodId) ?? null,
    [methods, selectedMethodId]
  );

  // Grid item
  const renderGridItem = ({ item }: { item: UiMetodo }) => {
    const selectedNow = item.id === selectedMethodId; // 👈 selección por ID única
    const highlighted = selectedNow;
    const cardStyles = [
      styles.card,
      highlighted && {
        backgroundColor: AMBER_100,
        borderColor: AMBER_500,
        shadowColor: AMBER_500,
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        ...(Platform.OS === "android" ? { elevation: 2 } : {}),
      },
    ];

    return (
      <View style={styles.gridItem}>
        <Pressable
          onPress={() => onSelectMethod(item.id, item.code)}
          style={({ pressed }) => [
            cardStyles,
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Seleccionar ${item.label}`}
        >
          {selectedNow && (
            <View style={[styles.badge, styles.badgeInsideTop]}>
              <Text style={styles.badgeText}>Seleccionado</Text>
            </View>
          )}

          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconCircle,
                styles.iconCircleTight,
                { backgroundColor: BRAND_YELLOW },
              ]}
            >
              <Icono name={item.icon} size={18} color="#111827" />
            </View>
            <View style={styles.cardTextCol}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Método de pago</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Cargando métodos…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={methods}
          key={"grid"}
          keyExtractor={(it) => String(it.id)}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          renderItem={renderGridItem}
          scrollEnabled={false}
          ListEmptyComponent={null}
        />
      )}

      {/* Form solo si el seleccionado es id === 2 (tarjeta) */}
      {selected && isCardMethodById(selected.id) && (
        <View style={styles.cardForm}>
          <TextInput
            style={styles.input}
            placeholder="Titular de la tarjeta"
            value={cardForm.holder}
            onChangeText={(t) => setCardForm((f) => ({ ...f, holder: t }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Número de tarjeta"
            keyboardType="numeric"
            value={cardForm.number}
            onChangeText={(t) => setCardForm((f) => ({ ...f, number: t }))}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="MM/AA"
              keyboardType="numeric"
              value={cardForm.expiry}
              onChangeText={(t) => setCardForm((f) => ({ ...f, expiry: t }))}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="CVV"
              keyboardType="numeric"
              value={cardForm.cvv}
              onChangeText={(t) => setCardForm((f) => ({ ...f, cvv: t }))}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 8,
    marginBottom: 8,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: { fontSize: 16, fontWeight: "800", color: "#1f2937" },

  loadingBox: { paddingVertical: 14, alignItems: "center" },
  loadingText: { color: "#6b7280", fontSize: 13, marginTop: 8 },

  errorBox: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  errorText: { color: "#991b1b", fontSize: 13, fontWeight: "700" },

  // ===== GRID (2 por fila) =====
  gridRow: { justifyContent: "space-between" },
  gridItem: { width: "48%", marginBottom: 12 },
  card: {
    width: "100%",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minHeight: 88,
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  badge: {
    backgroundColor: AMBER_500,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  badgeInsideTop: { position: "absolute", top: 8, right: 8, zIndex: 1 },

  cardHeader: { flexDirection: "row", alignItems: "center" },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "android" ? { elevation: 0 } : {}),
  },
  iconCircleTight: { marginRight: 6 },
  cardTextCol: { flex: 1, minWidth: 0 },
  cardName: { fontSize: 14, fontWeight: "700", color: "#1f2937", marginLeft: 4 },

  // ===== Form tarjeta =====
  cardForm: { marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  row: { flexDirection: "row", gap: 10 },
});

export default PaymentMethodSelector;
