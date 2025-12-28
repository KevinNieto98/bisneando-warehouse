import Icono from "@/components/ui/Icon.native";
import Title from "@/components/ui/Title.native";
import useAuth from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { fetchOrdersHeadByBodega } from "@/services/api";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* =========================
   Helpers
   ========================= */

function formatCreationDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return d.toLocaleString("es-HN");
  } catch {
    return d.toLocaleString();
  }
}

function getStatusBadge(id_status: number | null, status: string | null) {
  // 🔴 Rechazada
  if (id_status === 6) {
    return { text: status ?? "Rechazada", bg: "#fee2e2", color: "#b91c1c" };
  }

  // 🟢 Completada
  if (id_status === 5) {
    return { text: status ?? "Completada", bg: "#dcfce7", color: "#15803d" };
  }

  // 🟠 En progreso (id_status = 2)
  if (id_status === 2) {
    return { text: status ?? "En progreso", bg: "#ffedd5", color: "#c2410c" };
  }

  // ⚪ Default
  return {
    text: status ?? "Sin estado",
    bg: "#e5e7eb",
    color: "#374151",
  };
}

/* =========================
   Tipos (vista VW_ORDERS_HEAD)
   ========================= */

type BodegaOrder = {
  id_bodega: number | null;
  id_order: number;
  cantidad: number | null;
  total: number | null;
  uid: string | null;
  fecha_creacion: string | null;
  id_status: number | null;
  status: string | null;
  nombre_usuario: string | null;
};

type TabKey = "progreso" | "finalizadas";
const PAGE_SIZE_FINALIZED = 10;

export default function OrdersScreen() {
  const { user, loading } = useAuth();
  const { profile } = useProfile(user?.id);

  // Redirigir si no hay sesión (esperando hidratación)
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/(auth)/login");
    }
  }, [loading, user]);

  // Data
  const [orders, setOrders] = useState<BodegaOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Tabs / paginación
  const [activeTab, setActiveTab] = useState<TabKey>("progreso");
  const [finalizedPage, setFinalizedPage] = useState(1);

  // Pull to refresh
  const [refreshing, setRefreshing] = useState(false);

  const loadOrdersForBodega = async (idBodega?: number | null) => {
    setLoadingOrders(true);
    setOrdersError(null);

    try {
      if (!idBodega || !Number.isFinite(idBodega)) {
        setOrders([]);
        setFinalizedPage(1);
        return;
      }

      const data = await fetchOrdersHeadByBodega(Number(idBodega));
      setOrders(Array.isArray(data) ? (data as BodegaOrder[]) : []);
      setFinalizedPage(1);
    } catch (err: any) {
      console.error("Error cargando órdenes por bodega:", err);
      setOrdersError(err?.message ?? "Error al cargar órdenes");
    } finally {
      setLoadingOrders(false);
    }
  };

  // Cargar cuando haya id_bodega
  useEffect(() => {
    loadOrdersForBodega(profile?.id_bodega ?? null);
  }, [profile?.id_bodega]);

  // Pull To Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadOrdersForBodega(profile?.id_bodega ?? null);
    } finally {
      setRefreshing(false);
    }
  };

  // =========================
  // ✅ Clasificación correcta:
  // En Progreso => id_status === 2
  // Finalizadas => todas las demás
  // =========================

  const inProgressOrders = useMemo(
    () => orders.filter((o) => o.id_status === 2),
    [orders]
  );

  const finalizedOrders = useMemo(
    () => orders.filter((o) => o.id_status !== 2),
    [orders]
  );

  const visibleOrders =
    activeTab === "progreso"
      ? inProgressOrders
      : finalizedOrders.slice(0, finalizedPage * PAGE_SIZE_FINALIZED);

  const canLoadMoreFinalized =
    activeTab === "finalizadas" &&
    finalizedOrders.length > visibleOrders.length;

  // =========================
  // Tarjetita
  // =========================
  const renderBodegaOrderCard = (item: BodegaOrder) => {
    const fecha = formatCreationDate(item.fecha_creacion);
    const cantidad = Number(item.cantidad ?? 0);
    const total = Number(item.total ?? 0);
    const badge = getStatusBadge(item.id_status, item.status);

    return (
      <TouchableOpacity
        key={item.id_order}
        style={styles.card}
        activeOpacity={0.75}
        onPress={() =>
  router.push(
    `/orders/${item.id_order}?id_bodega=${encodeURIComponent(
      String(item.id_bodega ?? "")
    )}` as any
  )
}
      >
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle}>Orden #{item.id_order}</Text>
          <Text style={styles.cardTotal}>L. {total.toFixed(2)}</Text>
        </View>

        <View style={styles.cardMid}>
          <Text style={styles.cardMeta}>
            Cantidad:{" "}
            <Text style={styles.cardMetaStrong}>
              {Number.isFinite(cantidad) ? cantidad : 0}
            </Text>
          </Text>

          {!!fecha && <Text style={styles.cardDate}>{fecha}</Text>}
        </View>

        <View style={styles.cardBottom}>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.statusBadgeText, { color: badge.color }]}>
              {badge.text}
            </Text>
          </View>

          <Icono name="ChevronRight" size={18} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    );
  };

  // ======================================================================
  // RENDER
  // ======================================================================
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      <View style={styles.header}>
        <Image
          source={require("@/assets/images/bisneando.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.rightHeaderIcons}>
          {user && (
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push("/notifications")}
            >
              <Icono name="Bell" size={22} color="#27272a" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          scrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.paddedContentSection}>
            <Title
              icon={<Icono name="ClipboardList" size={20} color="#52525b" />}
              title="Órdenes de la bodega"
            />

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "progreso" && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab("progreso")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === "progreso" && styles.tabLabelActive,
                  ]}
                >
                  En progreso
                </Text>
                <View style={styles.tabBadge}>
                  <Text
                    style={[
                      styles.tabBadgeText,
                      activeTab === "progreso" && styles.tabBadgeTextActive,
                    ]}
                  >
                    {inProgressOrders.length}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "finalizadas" && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab("finalizadas")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === "finalizadas" && styles.tabLabelActive,
                  ]}
                >
                  Finalizadas
                </Text>
                <View style={styles.tabBadge}>
                  <Text
                    style={[
                      styles.tabBadgeText,
                      activeTab === "finalizadas" && styles.tabBadgeTextActive,
                    ]}
                  >
                    {finalizedOrders.length}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Listado */}
            {loadingOrders ? (
              <View style={styles.centerWrapper}>
                <Text style={styles.emptyText}>Cargando órdenes...</Text>
              </View>
            ) : ordersError ? (
              <View style={styles.centerWrapper}>
                <Text style={styles.errorText}>{ordersError}</Text>
              </View>
            ) : orders.length === 0 ? (
              <View style={styles.centerWrapper}>
                <Text style={styles.emptyText}>
                  No hay órdenes para esta bodega.
                </Text>
              </View>
            ) : visibleOrders.length === 0 ? (
              <View style={styles.centerWrapper}>
                <Text style={styles.emptyText}>
                  {activeTab === "progreso"
                    ? "No hay órdenes en progreso (id_status = 2)."
                    : "No hay órdenes finalizadas."}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.listContent}>
                  {visibleOrders.map(renderBodegaOrderCard)}
                </View>

                {canLoadMoreFinalized && (
                  <View style={styles.footerMoreWrapper}>
                    <TouchableOpacity
                      style={styles.moreButton}
                      activeOpacity={0.8}
                      onPress={() => setFinalizedPage((prev) => prev + 1)}
                    >
                      <Text style={styles.moreButtonText}>Ver más órdenes</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFD600",
    paddingHorizontal: 16,
    ...Platform.select({
      ios: { paddingTop: 8, paddingBottom: 8 },
      android: { paddingTop: 12, paddingBottom: 8 },
    }),
  },
  logo: {
    aspectRatio: 3,
    resizeMode: "contain",
    ...Platform.select({
      ios: { width: 160, height: 40 },
      android: { width: 180, height: 40 },
    }),
  },
  rightHeaderIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  paddedContentSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  centerWrapper: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#dc2626",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 9999,
    padding: 4,
    marginTop: 12,
    marginBottom: 12,
    alignSelf: "center",
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  tabButtonActive: {
    backgroundColor: "#111827",
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  tabLabelActive: {
    color: "#f9fafb",
  },
  tabBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: "rgba(31,41,55,0.08)",
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
  },
  tabBadgeTextActive: {
    color: "#e5e7eb",
  },

  // List / Cards
  listContent: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  card: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  cardTotal: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  cardMid: {
    marginBottom: 8,
  },
  cardMeta: {
    fontSize: 13,
    color: "#4b5563",
  },
  cardMetaStrong: {
    fontWeight: "700",
    color: "#111827",
  },
  cardDate: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // ✅ Badge status
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  footerMoreWrapper: {
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: "center",
  },
  moreButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: "#111827",
  },
  moreButtonText: {
    color: "#f9fafb",
    fontSize: 13,
    fontWeight: "500",
  },
});
