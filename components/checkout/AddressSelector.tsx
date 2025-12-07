// components/checkout/AddressSelector.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Addr = {
  id: number;
  tipo_direccion: number; // 1=Casa, 2=Trabajo, etc.
  nombre_direccion: string;
  referencia?: string;
  isPrincipal?: boolean;
};

type Props = {
  addresses: Addr[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  isLoading?: boolean;
  onAdd?: () => void;
  /** 'list' = filas con radio. 'grid' = 2 cards por fila */
  variant?: "list" | "grid";
};

const BRAND_YELLOW = "#facc15"; // mismo que CardAddress

function tipoMeta(tipo: number) {
  switch (tipo) {
    case 1:
      return { label: "Casa", icon: "home-outline" as const, tint: BRAND_YELLOW };
    case 2:
      return { label: "Trabajo", icon: "briefcase-outline" as const, tint: BRAND_YELLOW };
    default:
      return { label: "Otro", icon: "location-outline" as const, tint: BRAND_YELLOW };
  }
}

export const AddressSelector: React.FC<Props> = ({
  addresses,
  selectedId,
  onSelect,
  isLoading = false,
  onAdd,
  variant = "list",
}) => {
  const renderList = () => (
    <View style={styles.list}>
      {addresses.map((a, idx) => {
        const meta = tipoMeta(a.tipo_direccion);
        const selected = selectedId === a.id;

        return (
          <TouchableOpacity
            key={a.id}
            activeOpacity={0.8}
            onPress={() => onSelect(a.id)}
            style={[styles.row, idx === 0 && styles.rowFirst]}
          >
            <View style={[styles.iconCircle, { backgroundColor: meta.tint }]}>
              <Ionicons name={meta.icon} size={18} color="#111827" />
            </View>

            <View style={styles.texts}>
              <View style={styles.topLine}>
                <Text style={styles.name} numberOfLines={1}>
                  {a.nombre_direccion}
                </Text>

                {a.isPrincipal && (
                  <View style={styles.badge}>
                    <Ionicons name="star" size={10} color="#fff" />
                    <Text style={styles.badgeText}>Principal</Text>
                  </View>
                )}
              </View>

              {!!a.referencia && (
                <Text style={styles.ref} numberOfLines={1}>
                  {a.referencia}
                </Text>
              )}
            </View>

            <View style={styles.radioWrap}>
              {selected ? (
                <Ionicons name="radio-button-on" size={20} color="#f59e0b" />
              ) : (
                <Ionicons name="radio-button-off" size={20} color="#9ca3af" />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ---------- GRID (2 por fila) ----------
  const renderGridItem = ({ item }: { item: Addr }) => {
    const meta = tipoMeta(item.tipo_direccion);
    const selected = selectedId === item.id;

    // ✅ Solo resalta la tarjeta SELECCIONADA (no la principal)
    const cardStyles = [
      styles.card,
      selected && {
        backgroundColor: "#fef3c7", // amber-100
        borderColor: "#f59e0b",     // amber-500
        shadowColor: "#f59e0b",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        ...(Platform.OS === "android" ? { elevation: 2 } : {}),
      },
    ];

    return (
      <View style={styles.gridItem}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => onSelect(item.id)} style={cardStyles}>
          {/* badge DENTRO de la tarjeta, arriba derecha (informativo, no selección) */}
          {item.isPrincipal && (
            <View style={[styles.badge, styles.badgeInsideTop]}>
              <Ionicons name="star" size={10} color="#fff" />
              <Text style={styles.badgeText}>Principal</Text>
            </View>
          )}

          {/* contenido */}
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, styles.iconCircleTight, { backgroundColor: meta.tint }]}>
              <Ionicons name={meta.icon} size={18} color="#111827" />
            </View>

            <View style={styles.cardTextCol}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.nombre_direccion}
              </Text>
              {!!item.referencia && (
                <Text style={styles.cardRef} numberOfLines={1}>
                  {item.referencia}
                </Text>
              )}
            </View>

            {/* ✅ indicador visual claro de selección en grid */}
            <View style={{ marginLeft: 6 }}>
              {selected ? (
                <Ionicons name="checkmark-circle" size={18} color="#f59e0b" />
              ) : (
                <Ionicons name="ellipse-outline" size={18} color="#d1d5db" />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderGrid = () => (
    <FlatList
      data={addresses}
      key={"grid"}
      keyExtractor={(it) => String(it.id)}
      numColumns={2}
      columnWrapperStyle={styles.gridRow}
      renderItem={renderGridItem}
      scrollEnabled={false}
      ListEmptyComponent={null}
      extraData={selectedId} // 👈 forza re-render claro al cambiar selección
    />
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Dirección de entrega</Text>
        <TouchableOpacity onPress={onAdd} style={styles.addBtn}>
          <Ionicons name="add-circle-outline" size={18} color="#1e293b" />
          <Text style={styles.addText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Cargando direcciones…</Text>
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="location-outline" size={18} color="#6b7280" />
          <Text style={styles.emptyText}>No tienes direcciones. Agrega una para continuar.</Text>
          {!!onAdd && (
            <TouchableOpacity onPress={onAdd} style={styles.ctaAddInline}>
              <Text style={styles.ctaAddInlineText}>+ Agregar dirección</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : variant === "grid" ? (
        renderGrid()
      ) : (
        renderList()
      )}
    </View>
  );
};

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

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  addText: { fontSize: 12, fontWeight: "700", color: "#1e293b", marginLeft: 6 },

  loadingBox: { paddingVertical: 14, alignItems: "center" },
  loadingText: { color: "#6b7280", fontSize: 13, marginTop: 8 },

  emptyBox: { paddingVertical: 14, alignItems: "center" },
  emptyText: { color: "#6b7280", fontSize: 13, textAlign: "center", marginTop: 6 },
  ctaAddInline: {
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fef3c7",
  },
  ctaAddInlineText: { color: "#92400e", fontWeight: "800", fontSize: 12 },

  // ===== LISTA =====
  list: { borderRadius: 10, overflow: "hidden", backgroundColor: "#fff" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  rowFirst: { borderTopLeftRadius: 10, borderTopRightRadius: 10 },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    ...(Platform.OS === "android" ? { elevation: 0 } : {}),
  },

  texts: { flex: 1, minWidth: 0 },
  topLine: { flexDirection: "row", alignItems: "center", flexShrink: 1, gap: 6 },
  name: { fontSize: 14, fontWeight: "700", color: "#1f2937", flexShrink: 1 },
  ref: { fontSize: 12, color: "#6b7280", marginTop: 2 },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f59e0b",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: { color: "#fff", fontSize: 10, marginLeft: 4, fontWeight: "700" },

  radioWrap: { marginLeft: 8 },

  // ===== GRID =====
  gridRow: {
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    marginBottom: 12,
  },
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
  },
  badgeInsideTop: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircleTight: {
    marginRight: 6,
  },
  cardTextCol: {
    flex: 1,
    minWidth: 0,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    marginLeft: 4,
  },
  cardRef: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
    marginTop: 1,
  },
});
