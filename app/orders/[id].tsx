import ConfirmModal from "@/components/ui/ConfirmModal";
import { useProfile } from "@/hooks/useProfile";
import {
  fetchActivityOrderByOrderId,
  fetchOrderById,
  fetchOrdersDetByBodega,
  fetchOrdersFulfillmentByOrder,

  updateOrderStatusByIdRequest,
} from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
  id_status?: number | null;
};

type OrderDetailApi = {
  id_det: number;
  id_order?: number;
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

// ✅ Fulfillment row mínimo para render
type FulfillmentRow = {
  id_bodega: number | null;
  is_used: boolean | null;
  created_at: string | null;
  updated_at: string | null;
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

function truthyBoolLabel(v: boolean | null | undefined) {
  if (v === true) return "Completado";
  if (v === false) return "Pendiente";
  return "--";
}

/**
 * ✅ Combina activity del endpoint con el activity del base (fetchOrderById),
 * prefiriendo el texto `status` (nombre) que normalmente viene en base.
 * Así evitas ver "Estado #n".
 */
function mergeActivityPreferTextStatus(baseActivity: any[], endpointActivity: any[]) {
  const base = Array.isArray(baseActivity) ? baseActivity : [];
  const ep = Array.isArray(endpointActivity) ? endpointActivity : [];

  if (ep.length === 0) return base;
  if (base.length === 0) return ep;

  const byIdAct = new Map<number, any>();
  for (const b of base) {
    const idAct = Number(b?.id_act);
    if (Number.isFinite(idAct) && idAct > 0) byIdAct.set(idAct, b);
  }

  return ep.map((a) => {
    const idAct = Number(a?.id_act);
    const b = Number.isFinite(idAct) ? byIdAct.get(idAct) : undefined;

    const statusText =
      a?.status && String(a.status).trim() ? a.status : b?.status ?? null;

    return {
      ...a,
      status: statusText,
    };
  });
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const { profile } = useProfile();

  const { id, fromSuccess, id_bodega } = useLocalSearchParams<{
    id?: string;
    fromSuccess?: string;
    id_bodega?: string;
  }>();

  const numericId = Number(id);
  const cameFromSuccess = fromSuccess === "1";

  const [order, setOrder] = useState<FullOrderByIdApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Observación + modal confirmación
  const [observacion, setObservacion] = useState("");

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title?: string;
    message: string;
    icon?: keyof typeof Ionicons.glyphMap;
    action: "cancel" | "warn" | "update" | null;
  }>({
    message: "",
    action: null,
  });

  const [obsError, setObsError] = useState<string | null>(null);

  // ✅ id_bodega route param normalizado
  const idBodegaParam = useMemo(() => {
    const b = Number(id_bodega);
    return Number.isFinite(b) && b > 0 ? b : undefined;
  }, [id_bodega]);

  // ✅ Bodega efectiva: param > profile
  const effectiveBodegaId = useMemo(() => {
    if (idBodegaParam && idBodegaParam > 0) return idBodegaParam;

    const pb = Number((profile as any)?.id_bodega);
    if (Number.isFinite(pb) && pb > 0) return pb;

    return undefined;
  }, [idBodegaParam, profile]);

  // ✅ Fulfillment state
  const [fulfillmentRows, setFulfillmentRows] = useState<FulfillmentRow[]>([]);
  const [fulfillmentLoading, setFulfillmentLoading] = useState(false);
  const [fulfillmentError, setFulfillmentError] = useState<string | null>(null);

  const openConfirm = (action: "cancel" | "warn" | "update") => {
    setObsError(null);

    if (action === "cancel") {
      setConfirmConfig({
        title: "Cancelar orden",
        message: "¿Estás seguro de que deseas cancelar esta orden?",
        icon: "close-circle",
        action,
      });
    }

    if (action === "warn") {
      setConfirmConfig({
        title: "Advertencia",
        message: "¿Deseas registrar esta advertencia en la orden?",
        icon: "warning",
        action,
      });
    }

    if (action === "update") {
      const current = Number(order?.head?.id_status ?? 0);
      const nextStatus = current === 3 ? 4 : 3;

      setConfirmConfig({
        title: "Actualizar orden",
        message:
          nextStatus === 4
            ? "¿Deseas finalizar la preparación y marcar la orden como lista?"
            : "¿Deseas actualizar la orden con esta observación?",
        icon: "checkmark-circle",
        action,
      });
    }

    setConfirmVisible(true);
  };

  const handleCancelConfirm = () => setConfirmVisible(false);

  // ✅ Cargar/Refrescar fulfillment para el status actual (o forzado)
const refreshFulfillment = useCallback(
  async (opts?: { forceStatus?: number }) => {
    try {
      setFulfillmentError(null);

      const idOrder = Number(numericId);
      const status =
        typeof opts?.forceStatus === "number"
          ? opts.forceStatus
          : Number(order?.head?.id_status ?? 0);

      if (!Number.isFinite(idOrder) || idOrder <= 0) {
        setFulfillmentRows([]);
        return;
      }

      // Si quieres permitir “sin status”, quita esta validación.
      if (!Number.isFinite(status) || status <= 0) {
        setFulfillmentRows([]);
        return;
      }

      setFulfillmentLoading(true);

      const rows = await fetchOrdersFulfillmentByOrder(
        { id_order: idOrder, id_status: status },
        undefined
      );

      console.log("[screen] fetchOrdersFulfillmentByOrder rows:", rows);

      const minimal: FulfillmentRow[] = Array.isArray(rows)
        ? rows.map((r: any) => ({
            id_bodega: r?.id_bodega ?? null,
            is_used: r?.is_used ?? null,
            created_at: r?.created_at ?? null,
            updated_at: r?.updated_at ?? null,
          }))
        : [];

      minimal.sort((a, b) => Number(a.id_bodega ?? 0) - Number(b.id_bodega ?? 0));
      setFulfillmentRows(minimal);
    } catch (e: any) {
      console.error("Error cargando fulfillment:", e);
      setFulfillmentError(e?.message ?? "No se pudo cargar el fulfillment.");
      setFulfillmentRows([]);
    } finally {
      setFulfillmentLoading(false);
    }
  },
  [numericId, order?.head?.id_status] // ✅ importante incluir numericId
);

  // ✅ refrescar el detalle después de actualizar status
  const refreshOrder = useCallback(async () => {
    if (!numericId || Number.isNaN(numericId)) return;

    const base = await fetchOrderById(numericId, undefined, idBodegaParam);
    if (!base) {
      setOrder(null);
      return;
    }

    const det =
      idBodegaParam !== undefined
        ? await fetchOrdersDetByBodega(numericId, idBodegaParam, undefined)
        : [];

    const activityFromEndpoint = await fetchActivityOrderByOrderId(
      numericId,
      undefined
    );

    const mergedActivity = mergeActivityPreferTextStatus(
      (base as any)?.activity ?? [],
      (activityFromEndpoint as any) ?? []
    );

    const nextOrder = {
      head: (base as FullOrderByIdApi).head,
      activity: mergedActivity,
      det: (det as any) ?? [],
    } as FullOrderByIdApi;

    setOrder(nextOrder);

    const newStatus = Number(nextOrder?.head?.id_status ?? 0);
    await refreshFulfillment({ forceStatus: newStatus });
  }, [numericId, idBodegaParam, refreshFulfillment]);

  // ✅ Confirm -> updateStatus según botón
  const handleConfirm = async () => {
    const action = confirmConfig.action;

    if (!action) {
      setConfirmVisible(false);
      return;
    }

    const obsTrim = (observacion ?? "").trim();
    const requiresObs = action === "cancel" || action === "warn";

    if (requiresObs && !obsTrim) {
      setObsError("Debes escribir una observación para continuar.");
      setConfirmVisible(false);
      return;
    }

    const currentStatus = Number(order?.head?.id_status ?? 0);

    let id_status_destino: number;
    if (action === "cancel") id_status_destino = 6;
    else if (action === "warn") id_status_destino = 7;
    else id_status_destino = currentStatus === 3 ? 4 : 3;

    const finalObs =
      action === "update"
        ? obsTrim || "Aprobado, orden en preparacion, mensaje por defecto"
        : obsTrim;

    try {
      setConfirmVisible(false);
      setLoading(true);
      setObsError(null);

      await updateOrderStatusByIdRequest(
        {
          id_order: numericId,
          id_status_destino,
          id_bodega: idBodegaParam,
          observacion: finalObs,
          usuario_actualiza: (() => {
            const b = idBodegaParam;
            if (Number.isFinite(Number(b)) && Number(b) > 0) return `Bodega ${b}`;

            const pb = Number((profile as any)?.id_bodega);
            if (Number.isFinite(pb) && pb > 0) return `Bodega ${pb}`;

            return (profile as any)?.email ?? (profile as any)?.usuario ?? "Bodega";
          })(),
        } as any,
        undefined
      );

      await refreshOrder();
      setObservacion("");

      router.replace("/(tabs)/orders");
    } catch (e: any) {
      console.error("Error actualizando status de la orden:", e);
      setLoadError(e?.message ?? "No se pudo actualizar el estado de la orden.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load inicial
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

        const base = await fetchOrderById(numericId, undefined, idBodegaParam);

        if (!base) {
          setLoadError("No se encontró información para esta orden.");
          setOrder(null);
          return;
        }

        const activityFromEndpoint = await fetchActivityOrderByOrderId(
          numericId,
          undefined
        );

        const det =
          idBodegaParam !== undefined
            ? await fetchOrdersDetByBodega(numericId, idBodegaParam, undefined)
            : [];

        const mergedActivity = mergeActivityPreferTextStatus(
          (base as any)?.activity ?? [],
          (activityFromEndpoint as any) ?? []
        );

        const nextOrder = {
          head: (base as FullOrderByIdApi).head,
          activity: mergedActivity,
          det: (det as any) ?? [],
        } as FullOrderByIdApi;

        setOrder(nextOrder);

        const s = Number(nextOrder?.head?.id_status ?? 0);
        await refreshFulfillment({ forceStatus: s });
      } catch (e: any) {
        console.error("Error al cargar detalle de orden:", e);
        setLoadError(e?.message ?? "Error al cargar el detalle de la orden.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [numericId, idBodegaParam, refreshFulfillment]);

  // ✅ Si cambia el status en memoria, recarga fulfillment
  useEffect(() => {
    const s = Number(order?.head?.id_status ?? 0);
    if (!Number.isFinite(s) || s <= 0) return;
    refreshFulfillment({ forceStatus: s });
  }, [order?.head?.id_status, refreshFulfillment]);

  const orderCode = formatOrderCode(numericId);

  const isRejected = useMemo(() => {
    if (!order) return false;
    return (
      (order.head.id_status ?? 0) === 6 ||
      (order.head.status ?? "").toLowerCase().includes("rechaz")
    );
  }, [order]);

  const lastActivity = order?.activity?.[0] ?? null;
  const lastObservation = lastActivity?.observacion ?? null;

  const handleBack = useCallback(() => {
    if (cameFromSuccess) router.replace("/(tabs)/orders");
    else router.back();
    return true;
  }, [cameFromSuccess, router]);

  useFocusEffect(
    useCallback(() => {
      if (!cameFromSuccess) return undefined;

      const subHW = BackHandler.addEventListener("hardwareBackPress", () => {
        return handleBack();
      });

      return () => subHW.remove();
    }, [cameFromSuccess, handleBack])
  );

  // ✅ Se muestra el panel si status 2 o 3
  const canShowUpdatePanel = useMemo(() => {
    const s = Number(order?.head?.id_status ?? 0);
    return s === 2 || s === 3;
  }, [order?.head?.id_status]);

  // ✅ REGLA: la bodega "cumplió" si existe fila con is_used=true para la bodega efectiva
  const bodegaAlreadyFulfilled = useMemo(() => {
    const b = effectiveBodegaId;
    if (!b) return false;

    return fulfillmentRows.some(
      (r) => Number(r.id_bodega ?? 0) === b && r.is_used === true
    );
  }, [effectiveBodegaId, fulfillmentRows]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

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

      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerWrapper}>
            <ActivityIndicator size="small" color="#000" />
            <Text style={styles.helperText}>Cargando detalle de la orden…</Text>
          </View>
        ) : loadError ? (
          <View style={styles.centerWrapper}>
            <Text style={styles.errorText}>{loadError}</Text>
          </View>
        ) : !order ? (
          <View style={styles.centerWrapper}>
            <Text style={styles.helperText}>
              No se encontró información para la orden #{numericId}.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
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
                    Aquí puedes dar seguimiento al estado de tu pedido en tiempo real.
                    Te avisaremos cuando avance a las siguientes etapas.
                  </Text>
                </View>
              </View>
            )}

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

            {/* ✅ Evitar ruido visual: mientras valida fulfillment */}
            {fulfillmentLoading ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Validando cumplimiento…</Text>
                <Text style={styles.helperText}>Cargando fulfillment…</Text>
              </View>
            ) : null}

            {/* ✅ REGLA VISUAL:
                - Si YA cumplió: mostrar fulfillment, ocultar actualizar
                - Si NO cumplió: mostrar actualizar, ocultar fulfillment
            */}

            {/* ✅ Actualizar SOLO si status 2/3 y NO ha cumplido */}
            {canShowUpdatePanel && !fulfillmentLoading && !bodegaAlreadyFulfilled ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Actualizar Orden</Text>

                <TextInput
                  value={observacion}
                  onChangeText={(t) => {
                    setObservacion(t);
                    if (obsError) setObsError(null);
                  }}
                  placeholder="Escribe una observación para esta orden..."
                  multiline
                  numberOfLines={4}
                  style={[styles.textArea, obsError ? styles.textAreaError : null]}
                  textAlignVertical="top"
                />

                {obsError ? (
                  <Text style={styles.obsErrorText}>{obsError}</Text>
                ) : null}

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnDanger]}
                    onPress={() => openConfirm("cancel")}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={18} color="white" />
                    <Text style={styles.actionBtnText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnWarning]}
                    onPress={() => openConfirm("warn")}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="warning" size={18} color="#111827" />
                    <Text style={[styles.actionBtnText, { color: "#111827" }]}>
                      Advertir
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnSuccess]}
                    onPress={() => openConfirm("update")}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark" size={18} color="white" />
                    <Text style={styles.actionBtnText}>Actualizar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {/* ✅ Fulfillment SOLO si YA cumplió */}
            {!fulfillmentLoading && bodegaAlreadyFulfilled ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  Fulfillment por bodega
                </Text>

                {fulfillmentError ? (
                  <Text style={styles.errorText}>{fulfillmentError}</Text>
                ) : fulfillmentRows.length === 0 ? (
                  <Text style={styles.helperText}>
                    No hay registros de fulfillment para este status.
                  </Text>
                ) : (
                  <View style={styles.table}>
                    <View style={[styles.tr, styles.trHead]}>
                      <Text style={[styles.th, styles.colBodega]}>Bodega</Text>
                      <Text style={[styles.th, styles.colUsed]}>Estado</Text>
                      <Text style={[styles.th, styles.colDate]}>Fecha Asignacion</Text>
                      <Text style={[styles.th, styles.colDate]}>Fecha Actualizacion</Text>
                    </View>

                    {fulfillmentRows.map((r, idx) => {
                      const used = r.is_used === true;
                      return (
                        <View
                          key={`${r.id_bodega ?? "null"}_${idx}`}
                          style={[
                            styles.tr,
                            idx === fulfillmentRows.length - 1 ? styles.trLast : null,
                          ]}
                        >
                          <Text style={[styles.td, styles.colBodega]}>
                            {r.id_bodega != null ? `Bodega ${r.id_bodega}` : "--"}
                          </Text>

                          <View style={[styles.colUsed, styles.usedCell]}>
                            <View style={[styles.pill, used ? styles.pillOk : styles.pillWarn]}>
                              <Text
                                style={[
                                  styles.pillText,
                                  used ? styles.pillTextOk : styles.pillTextWarn,
                                ]}
                              >
                                {truthyBoolLabel(r.is_used)}
                              </Text>
                            </View>
                          </View>

                          <Text style={[styles.td, styles.colDate]}>
                            {formatDateTime(r.created_at)}
                          </Text>
                          <Text style={[styles.td, styles.colDate]}>
                            {formatDateTime(r.updated_at)}
                          </Text>
                        </View>
                      );
                    })}

                    <Text style={styles.tableHint}>
                      Esta sección aparece cuando la bodega ya cumplió su asignación.
                    </Text>
                  </View>
                )}
              </View>
            ) : null}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Resumen de la orden</Text>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>ID</Text>
                <Text style={styles.value}>{orderCode}</Text>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>Estado</Text>
                <Text style={styles.value}>{order.head.status ?? "Sin estado"}</Text>
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

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Productos ({order.det.length})</Text>

              {order.det.length === 0 ? (
                <Text style={styles.helperText}>
                  Esta orden no tiene productos asociados.
                </Text>
              ) : (
                order.det.map((item) => (
                  <View key={item.id_det} style={styles.productRow}>
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

                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>
                        {item.nombre_producto ?? `Producto #${item.id_producto}`}
                      </Text>
                      <Text style={styles.productMeta}>
                        Cantidad: {item.qty} · Precio: {formatMoney(item.precio)}
                      </Text>
                    </View>

                    <Text style={styles.productSubtotal}>
                      {formatMoney(item.sub_total ?? item.qty * item.precio)}
                    </Text>
                  </View>
                ))
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Historial de la orden ({order.activity.length})
              </Text>

              {order.activity.length === 0 ? (
                <Text style={styles.helperText}>
                  No hay movimientos registrados para esta orden.
                </Text>
              ) : (
                order.activity.map((act, idx) => (
                  <View key={act.id_act ?? idx} style={styles.activityRow}>
                    <Text style={styles.activityStatus}>
                      {act.status ?? `Estado #${act.id_status ?? "--"}`}
                    </Text>

                    <Text style={styles.activityMeta}>
                      {formatDateTime(act.fecha_actualizacion)}
                      {act.usuario_actualiza ? ` · ${act.usuario_actualiza}` : ""}
                    </Text>

                    {act.observacion ? (
                      <Text style={styles.activityObs}>{act.observacion}</Text>
                    ) : null}
                  </View>
                ))
              )}
            </View>

            <ConfirmModal
              visible={confirmVisible}
              title={confirmConfig.title}
              message={confirmConfig.message}
              icon={confirmConfig.icon}
              confirmText="Sí, confirmar"
              cancelText="No"
              onConfirm={handleConfirm}
              onCancel={handleCancelConfirm}
            />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const IMAGE_SIZE = 48;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD600" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD600",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  backButton: { padding: 6, borderRadius: 20, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centerWrapper: { flex: 1, alignItems: "center", justifyContent: "center" },
  helperText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  errorText: { fontSize: 14, color: "#dc2626", textAlign: "center" },
  scrollContent: { paddingBottom: 24 },

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
  successBannerText: { fontSize: 13, color: "#854D0E" },

  statusBannerRejected: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  statusTextRejected: { fontSize: 14, fontWeight: "700", color: "#B91C1C" },
  statusObservation: { fontSize: 13, color: "#7F1D1D" },
  statusObservationMuted: { fontSize: 13, color: "#9F1239" },

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
  label: { fontSize: 13, color: "#6b7280" },
  value: {
    fontSize: 13,
    color: "#111827",
    textAlign: "right",
    marginLeft: 8,
    flexShrink: 1,
  },

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
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: "500", color: "#111827" },
  productMeta: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  productSubtotal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },

  activityRow: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 4,
  },
  activityStatus: { fontSize: 13, fontWeight: "600", color: "#111827" },
  activityMeta: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  activityObs: { fontSize: 12, color: "#374151", marginTop: 4 },

  textArea: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    minHeight: 90,
    backgroundColor: "white",
  },
  textAreaError: { borderColor: "#dc2626" },
  obsErrorText: {
    marginTop: 8,
    fontSize: 12,
    color: "#dc2626",
    fontWeight: "600",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    gap: 6,
  },
  actionBtnText: { fontSize: 14, fontWeight: "700", color: "white" },
  btnDanger: { backgroundColor: "#dc2626" },
  btnWarning: { backgroundColor: "#fde047" },
  btnSuccess: { backgroundColor: "#16a34a" },

  /* ✅ Fulfillment "tabla" */
  table: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  tr: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  trHead: {
    backgroundColor: "#f3f4f6",
  },
  trLast: {
    borderBottomWidth: 0,
  },
  th: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4b5563",
  },
  td: {
    fontSize: 12,
    color: "#111827",
  },
  colBodega: { flex: 1.1 },
  colUsed: { flex: 0.9 },
  colDate: { flex: 1.3 },

  usedCell: { alignItems: "flex-start" },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillOk: { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" },
  pillWarn: { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" },
  pillText: { fontSize: 12, fontWeight: "700" },
  pillTextOk: { color: "#047857" },
  pillTextWarn: { color: "#B45309" },

  tableHint: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 12,
    color: "#6b7280",
    backgroundColor: "#fff",
  },
});
