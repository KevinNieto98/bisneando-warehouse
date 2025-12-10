import Icono from "@/components/ui/Icon.native";
import Title from "@/components/ui/Title.native";
import useAuth from "@/hooks/useAuth";
import { fetchOrdersHeadByUid } from "@/services/api";
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
   Tipos y helpers de Órdenes
   ========================= */

type OrderHead = {
  id_order: number;
  uid: string;
  total: number;
  qty_items: number;
  status: string | null;
  id_status: number | null;
  fecha_creacion: string | null;
};

function formatOrderCode(id: number, width = 5, prefix = "ORD-") {
  if (!Number.isFinite(id) || id <= 0) return `${prefix}00000`;
  return `${prefix}${String(id).padStart(width, "0")}`;
}

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

/* =========================
   Skeleton de item de orden
   ========================= */

const SkeletonOrderItem = () => {
  return (
    <View style={styles.skeletonItem}>
      <View style={styles.skeletonRow}>
        <View style={[styles.skeletonBox, { width: 110, height: 14 }]} />
        <View style={[styles.skeletonBox, { width: 70, height: 14 }]} />
      </View>

      <View
        style={[
          styles.skeletonBox,
          { width: "60%", height: 12, marginTop: 10 },
        ]}
      />

      <View
        style={[
          styles.skeletonBox,
          { width: "40%", height: 12, marginTop: 10 },
        ]}
      />
    </View>
  );
};

type TabKey = "progreso" | "finalizadas";
const PAGE_SIZE_FINALIZED = 10;

export default function OrdersScreen() {
  const { user } = useAuth();

  // Órdenes
  const [orders, setOrders] = useState<OrderHead[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Tabs / paginación
  const [activeTab, setActiveTab] = useState<TabKey>("progreso");
  const [finalizedPage, setFinalizedPage] = useState(1);

  // Pull to refresh
  const [refreshing, setRefreshing] = useState(false);

  const loadOrdersForUser = async (uid?: string | null) => {
    setLoadingOrders(true);
    setOrdersError(null);

    try {
      if (!uid) {
        setOrders([]);
        setFinalizedPage(1);
        return;
      }

      const data = await fetchOrdersHeadByUid(uid);
      const rows = (data ?? []) as any[];

      const mapped = rows.map((d) => ({
        id_order: d.id_order,
        uid: d.uid,
        total: d.total ?? 0,
        qty_items: d.qty_items ?? d.qty ?? d.items_count ?? 0,
        status: d.status ?? null,
        id_status: d.id_status ?? null,
        fecha_creacion: d.fecha_creacion ?? null,
      })) as OrderHead[];

      setOrders(mapped);
      setFinalizedPage(1);
    } catch (err: any) {
      console.error("Error cargando órdenes:", err);
      setOrdersError(err?.message ?? "Error al cargar órdenes");
    } finally {
      setLoadingOrders(false);
    }
  };

  // Cargar al inicio cuando cambia el usuario
  useEffect(() => {
    loadOrdersForUser(user?.id ?? null);
  }, [user?.id]);

  // Pull To Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadOrdersForUser(user?.id ?? null);
    } finally {
      setRefreshing(false);
    }
  };

  // =========================
  // Lógica de órdenes
  // =========================

  const sortByFechaCreacionDesc = (a: OrderHead, b: OrderHead) => {
    const ta = a.fecha_creacion ? new Date(a.fecha_creacion).getTime() : 0;
    const tb = b.fecha_creacion ? new Date(b.fecha_creacion).getTime() : 0;
    return tb - ta;
  };

  const inProgressOrders = useMemo(
    () =>
      orders
        .filter((o) => {
          const s = o.id_status ?? 0;
          return s >= 1 && s <= 5;
        })
        .sort(sortByFechaCreacionDesc),
    [orders]
  );

  const finalizedOrders = useMemo(
    () =>
      orders
        .filter((o) => {
          const s = o.id_status ?? 0;
          return s === 6 || s === 7;
        })
        .sort(sortByFechaCreacionDesc),
    [orders]
  );

  const visibleOrders =
    activeTab === "progreso"
      ? inProgressOrders
      : finalizedOrders.slice(0, finalizedPage * PAGE_SIZE_FINALIZED);

  const canLoadMoreFinalized =
    activeTab === "finalizadas" &&
    finalizedOrders.length > visibleOrders.length;

  const renderOrderItem = (item: OrderHead) => {
    const code = formatOrderCode(item.id_order);
    const fecha = formatCreationDate(item.fecha_creacion);

    return (
      <TouchableOpacity
        key={item.id_order}
        style={styles.orderItem}
        activeOpacity={0.7}
        onPress={() => router.push(`/orders/${item.id_order}` as any)}
      >
        <View style={styles.orderRowTop}>
          <Text style={styles.orderId}>{code}</Text>
          <Text style={styles.orderTotal}>
            L. {Number(item.total ?? 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.orderRowMiddle}>
          <Text style={styles.orderColonia}>
            {item.qty_items === 1
              ? "1 artículo"
              : `${item.qty_items} artículos`}
          </Text>
          {!!fecha && <Text style={styles.orderDate}>{fecha}</Text>}
        </View>

        <View style={styles.orderRowBottom}>
          <Text style={styles.orderStatusText}>
            {item.status ?? "Sin estado"}
          </Text>
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

      {/* Header fijo arriba sobre fondo amarillo */}
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

      {/* Contenido blanco con bordes redondeados y todo lo demás dentro del ScrollView */}
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
            {/* Título de sección de órdenes */}
            <Title
              icon={<Icono name="ClipboardList" size={20} color="#52525b" />}
              title="Pendientes por procesar"
            />

            {/* Tabs En progreso / Finalizadas */}
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
                      activeTab === "finalizadas" &&
                        styles.tabBadgeTextActive,
                    ]}
                  >
                    {finalizedOrders.length}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Contenido de órdenes */}
            {loadingOrders ? (
              <View style={{ paddingTop: 4 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonOrderItem key={i} />
                ))}
              </View>
            ) : ordersError ? (
              <View style={styles.centerWrapper}>
                <Text style={styles.errorText}>{ordersError}</Text>
              </View>
            ) : orders.length === 0 ? (
              <View style={styles.centerWrapper}>
                <Text style={styles.emptyText}>
                  Aún no tienes órdenes registradas.
                </Text>
              </View>
            ) : visibleOrders.length === 0 ? (
              <View style={styles.centerWrapper}>
                <Text style={styles.emptyText}>
                  {activeTab === "progreso"
                    ? "No tienes órdenes en progreso."
                    : "No tienes órdenes finalizadas."}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.listContent}>
                  {visibleOrders.map(renderOrderItem)}
                </View>

                {canLoadMoreFinalized && (
                  <View style={styles.footerMoreWrapper}>
                    <TouchableOpacity
                      style={styles.moreButton}
                      activeOpacity={0.8}
                      onPress={() =>
                        setFinalizedPage((prev) => prev + 1)
                      }
                    >
                      <Text style={styles.moreButtonText}>
                        Ver más órdenes
                      </Text>
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
      ios: {
        paddingTop: 8,
        paddingBottom: 8,
      },
      android: {
        paddingTop: 12,
        paddingBottom: 8,
      },
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

  listContent: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  orderItem: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  orderRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  orderRowMiddle: {
    marginBottom: 6,
  },
  orderColonia: {
    fontSize: 13,
    color: "#4b5563",
  },
  orderDate: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  orderRowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderStatusText: {
    fontSize: 12,
    color: "#6b7280",
  },

  // Skeleton
  skeletonItem: {
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  skeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skeletonBox: {
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
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
