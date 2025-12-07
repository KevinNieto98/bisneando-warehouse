import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { fetchOrdersHeadByUid } from "@/services/api";
import { router } from "expo-router";

type OrderHead = {
  id_order: number;
  uid: string;
  total: number;
  qty_items: number; // cantidad de artículos
  status: string | null;
  id_status: number | null;
  fecha_creacion: string | null; // 👈 nueva
};

/* =========================
   Helper: formatear código
   ========================= */

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
  const navigation = useNavigation();

  const [userId, setUserId] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderHead[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("progreso");
  const [finalizedPage, setFinalizedPage] = useState(1);

  // 1) Obtener el usuario logueado (uid)
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error al obtener usuario:", error.message);
          setUserId(null);
          return;
        }
        setUserId(data.user?.id ?? null);
      } catch (e) {
        console.error(e);
        setUserId(null);
      }
    };

    getUser();
  }, []);

  // 2) Perfil (nombre para saludo)
  const { profile } = useProfile(userId ?? undefined);

  // 3) Cargar órdenes por uid
  useEffect(() => {
    if (!userId) {
      setLoadingOrders(false);
      return;
    }

    const loadOrders = async () => {
      try {
        setLoadingOrders(true);
        setOrdersError(null);

        const data = await fetchOrdersHeadByUid(userId);

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
        setFinalizedPage(1); // reset paginación cuando cambian las órdenes
      } catch (e: any) {
        console.error(e);
        setOrdersError(e?.message ?? "Error al cargar órdenes");
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, [userId]);

  // Ordenar por fecha_creacion desc (más nuevas primero)
  const sortByFechaCreacionDesc = (a: OrderHead, b: OrderHead) => {
    const ta = a.fecha_creacion ? new Date(a.fecha_creacion).getTime() : 0;
    const tb = b.fecha_creacion ? new Date(b.fecha_creacion).getTime() : 0;
    return tb - ta;
  };

  // Separar órdenes por estado + ordenar
  const inProgressOrders = orders
    .filter((o) => {
      const s = o.id_status ?? 0;
      return s >= 1 && s <= 5; // 1–5 en progreso
    })
    .sort(sortByFechaCreacionDesc);

  const finalizedOrders = orders
    .filter((o) => {
      const s = o.id_status ?? 0;
      return s === 6 || s === 7; // 6,7 finalizadas
    })
    .sort(sortByFechaCreacionDesc);

  const visibleOrders =
    activeTab === "progreso"
      ? inProgressOrders
      : finalizedOrders.slice(0, finalizedPage * PAGE_SIZE_FINALIZED);

  // Render de cada orden
  const renderOrderItem = ({ item }: { item: OrderHead }) => {
    const code = formatOrderCode(item.id_order);
    const fecha = formatCreationDate(item.fecha_creacion);

    return (
      <TouchableOpacity
        style={styles.orderItem}
        activeOpacity={0.7}
        onPress={() => router.push(`/orders/${item.id_order}`)}
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
          {fecha ? (
            <Text style={styles.orderDate}>{fecha}</Text>
          ) : null}
        </View>

        <View style={styles.orderRowBottom}>
          <Text style={styles.orderStatusText}>
            {item.status ?? "Sin estado"}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    );
  };

  const canLoadMoreFinalized =
    activeTab === "finalizadas" &&
    finalizedOrders.length > visibleOrders.length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* Header amarillo con botón back */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

      
      </View>

      {/* Contenido blanco */}
      <View style={styles.content}>
        {/* Loading con skeleton */}
        {loadingOrders ? (
          <View style={{ paddingTop: 4 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonOrderItem key={i} />
            ))}
          </View>
        ) : ordersError ? (
          // Error
          <View style={styles.centerWrapper}>
            <Text style={styles.errorText}>{ordersError}</Text>
          </View>
        ) : orders.length === 0 ? (
          // Sin órdenes en absoluto
          <View style={styles.centerWrapper}>
            <Text style={styles.emptyText}>
              Aún no tienes órdenes registradas.
            </Text>
          </View>
        ) : (
          <>
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

            {/* Lista filtrada por tab */}
            <FlatList
              data={visibleOrders}
              keyExtractor={(item) => String(item.id_order)}
              renderItem={renderOrderItem}
              contentContainerStyle={
                visibleOrders.length === 0
                  ? [styles.listContent, { flex: 1, justifyContent: "center" }]
                  : styles.listContent
              }
              ListEmptyComponent={
                <View style={styles.centerWrapper}>
                  <Text style={styles.emptyText}>
                    {activeTab === "progreso"
                      ? "No tienes órdenes en progreso."
                      : "No tienes órdenes finalizadas."}
                  </Text>
                </View>
              }
              ListFooterComponent={
                canLoadMoreFinalized ? (
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
                ) : null
              }
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

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

  // Centro genérico
  centerWrapper: {
    flex: 1,
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
    paddingBottom: 16,
  },

  // Item de orden
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

  // Footer "Ver más"
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
