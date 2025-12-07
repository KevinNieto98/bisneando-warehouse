import { fetchOrderById } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type OrderHeadApi = {
  id_order: number;
  uid: string;
  total: number;
  status: string | null;
  nombre_colonia: string | null;
  metodo_pago: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string | null | undefined;
  id_status?: number | null; // 👈 importante para saber si es rechazada
};

type OrderDetailApi = {
  id_det: number;
  id_producto: number;
  qty: number;
  precio: number;
  sub_total: number;
  nombre_producto?: string | null;
  url_imagen?: string | null;
};

type OrderActivityApi = {
  id_act: number;
  id_status: number | null;
  status: string | null;
  fecha_actualizacion: string | null;
  usuario_actualiza: string | null;
  observacion: string | null;
};

type FullOrderByIdApi = {
  head: OrderHeadApi;
  det: OrderDetailApi[];
  activity: OrderActivityApi[];
};

/* =========================
   Helpers
   ========================= */

function formatOrderCode(id: number, width = 5, prefix = "ORD-") {
  if (!Number.isFinite(id) || id <= 0) return `${prefix}00000`;
  return `${prefix}${String(id).padStart(width, "0")}`;
}

function formatMoney(n: number) {
  return `L. ${Number(n ?? 0).toFixed(2)}`;
}

function formatDateTime(iso?: string | null) {
  if (!iso) return "--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function OrderDetailScreen() {
  const router = useRouter();

  const { id, fromSuccess } = useLocalSearchParams<{
    id?: string;
    fromSuccess?: string;
  }>();

  const numericId = Number(id);
  const cameFromSuccess = fromSuccess === "1";

  const [order, setOrder] = useState<FullOrderByIdApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!numericId || Number.isNaN(numericId)) {
      setLoading(false);
      setLoadError("ID de orden inválido.");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const data = await fetchOrderById(numericId);
        console.log("[ORDER_DETAIL] data", data);

        if (!data) {
          setLoadError("No se encontró información para esta orden.");
          setOrder(null);
        } else {
          setOrder(data as FullOrderByIdApi);
        }
      } catch (e: any) {
        console.error("Error al cargar detalle de orden:", e);
        setLoadError(e?.message ?? "Error al cargar el detalle de la orden.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [numericId]);

  const orderCode = formatOrderCode(numericId);

  // 👇 Derivados para la barra de estado
  const isRejected =
    !!order &&
    ((order.head.id_status ?? 0) === 6 ||
      (order.head.status ?? "").toLowerCase().includes("rechaz"));

  // última actividad (la más reciente, según tu acción ya viene ordenada desc)
  const lastActivity = order?.activity?.[0] ?? null;
  const lastObservation = lastActivity?.observacion ?? null;

  // 👇 Manejar back según de dónde vino (SOLO se usa en back del header y HW back)
  const handleBack = useCallback(() => {
    console.log("[ORDER_DETAIL] handleBack, cameFromSuccess:", cameFromSuccess);

    if (cameFromSuccess) {
      router.replace("/(tabs)/home");
    } else {
      // viene de orders (lista) → back normal
      router.back();
    }

    return true;
  }, [cameFromSuccess, router]);

  // 🔒 Interceptar botón físico / gesto back de Android SOLO si viene de success
  useFocusEffect(
    useCallback(() => {
      if (!cameFromSuccess) {
        return undefined;
      }

      const subHW = BackHandler.addEventListener("hardwareBackPress", () => {
        return handleBack();
      });

      return () => {
        subHW.remove();
      };
    }, [cameFromSuccess, handleBack])
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* Header amarillo con botón back */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{orderCode}</Text>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {loading ? (
          // 🔄 Loading
          <View style={styles.centerWrapper}>
            <ActivityIndicator size="small" color="#000" />
            <Text style={styles.helperText}>Cargando detalle de la orden…</Text>
          </View>
        ) : loadError ? (
          // ❌ Error
          <View style={styles.centerWrapper}>
            <Text style={styles.errorText}>{loadError}</Text>
          </View>
        ) : !order ? (
          // 😶 Sin datos
          <View style={styles.centerWrapper}>
            <Text style={styles.helperText}>
              No se encontró información para la orden #{numericId}.
            </Text>
          </View>
        ) : (
          // ✅ Detalle
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Banner especial si viene desde Success */}
            {cameFromSuccess && (
              <View style={styles.successBanner}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#166534"
                  style={{ marginRight: 6 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.successBannerTitle}>
                    ¡Gracias por tu compra! 🎉
                  </Text>
                  <Text style={styles.successBannerText}>
                    Aquí puedes dar seguimiento al estado de tu pedido en tiempo
                    real. Te avisaremos cuando avance a las siguientes etapas.
                  </Text>
                </View>
              </View>
            )}

            {/* =========================
                Barra de estado / “progress”
               ========================= */}
            {isRejected && (
              <View style={styles.statusBannerRejected}>
                <View style={styles.statusRow}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color="#DC2626"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.statusTextRejected}>Rechazada</Text>
                </View>

                {lastObservation ? (
                  <Text style={styles.statusObservation}>{lastObservation}</Text>
                ) : (
                  <Text style={styles.statusObservationMuted}>
                    Esta orden fue rechazada.
                  </Text>
                )}
              </View>
            )}

            {/* Resumen principal */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Resumen de la orden</Text>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>ID</Text>
                <Text style={styles.value}>{orderCode}</Text>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>Estado</Text>
                <Text style={styles.value}>
                  {order.head.status ?? "Sin estado"}
                </Text>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>Total</Text>
                <Text style={[styles.value, styles.valueStrong]}>
                  {formatMoney(order.head.total)}
                </Text>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>Colonia</Text>
                <Text style={styles.value}>
                  {order.head.nombre_colonia ?? "Sin colonia"}
                </Text>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>Método de pago</Text>
                <Text style={styles.value}>
                  {order.head.metodo_pago ?? "No especificado"}
                </Text>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>Fecha creación</Text>
                <Text style={styles.value}>
                  {formatDateTime(order.head.fecha_creacion)}
                </Text>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>Última actualización</Text>
                <Text style={styles.value}>
                  {formatDateTime(order.head.fecha_actualizacion)}
                </Text>
              </View>
            </View>

            {/* Productos */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Productos ({order.det.length})</Text>

              {order.det.length === 0 ? (
                <Text style={styles.helperText}>
                  Esta orden no tiene productos asociados.
                </Text>
              ) : (
                order.det.map((item) => (
                  <View key={item.id_det} style={styles.productRow}>
                    {/* Imagen del producto */}
                    {item.url_imagen ? (
                      <Image
                        source={{ uri: item.url_imagen }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.productImagePlaceholder}>
                        <Ionicons name="image" size={18} color="#9ca3af" />
                      </View>
                    )}

                    {/* Info del producto */}
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>
                        {item.nombre_producto ??
                          `Producto #${item.id_producto}`}
                      </Text>
                      <Text style={styles.productMeta}>
                        Cantidad: {item.qty} · Precio:{" "}
                        {formatMoney(item.precio)}
                      </Text>
                    </View>

                    <Text style={styles.productSubtotal}>
                      {formatMoney(item.sub_total ?? item.qty * item.precio)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const IMAGE_SIZE = 48;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD600",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  backButton: {
    padding: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centerWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  helperText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#dc2626",
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // 🔔 Banner especial cuando viene del success
  successBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF9C3",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FACC15",
  },
  successBannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#854D0E",
    marginBottom: 2,
  },
  successBannerText: {
    fontSize: 13,
    color: "#854D0E",
  },

  // Banner de estado rechazado
  statusBannerRejected: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statusTextRejected: {
    fontSize: 14,
    fontWeight: "700",
    color: "#B91C1C",
  },
  statusObservation: {
    fontSize: 13,
    color: "#7F1D1D",
  },
  statusObservationMuted: {
    fontSize: 13,
    color: "#9F1239",
  },

  card: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
  },
  value: {
    fontSize: 13,
    color: "#111827",
    textAlign: "right",
    marginLeft: 8,
    flexShrink: 1,
  },
  valueStrong: {
    fontWeight: "700",
  },

  // Productos
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 4,
  },
  productImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "#e5e7eb",
  },
  productImagePlaceholder: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  productMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  productSubtotal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },

  // Actividad
  activityRow: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 4,
  },
  activityStatus: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  activityMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  activityObs: {
    fontSize: 12,
    color: "#374151",
    marginTop: 4,
  },
});
