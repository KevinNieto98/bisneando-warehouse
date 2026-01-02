// src/lib/api.ts
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? ""; // p.ej. https://tu-dominio.com

// --------- Helper genérico ---------------------------------------------
type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  // timeout en ms (default 12s)
  timeoutMs?: number;
};

// 👇 Helper para loguear errores de forma más limpia (sin warnings/errores en consola)
function logApiError(scope: string, error: any) {

}

// Helper para devolver un valor vacío genérico y no romper tipos
function emptyResult<T>(): T {
  return {} as T;
}

async function apiFetch<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, headers, timeoutMs = 12000 } = opts;

  if (!API_BASE) {
    // Sin base URL, devolvemos vacío y logueamos suave
    logApiError("apiFetch", new Error("API base URL no definida. Configura EXPO_PUBLIC_API_URL."));
    return emptyResult<T>();
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(headers ?? {}),
      },
      body: body != null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    // intenta json -> si falla, usa texto
    const raw = await res.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      /* raw no era JSON */
    }

    // Si la respuesta NO es ok, no lanzamos error, solo devolvemos lo que haya
    if (!res.ok) {
      const msg =
        (data && (data.message || data.error)) ||
        raw ||
        `HTTP ${res.status} ${res.statusText}`;

      logApiError(
        "apiFetch",
        new Error(
          `[API ERROR] ${method} ${url} -> ${res.status} ${res.statusText}\nRespuesta: ${msg}`
        )
      );

      // devolvemos data si existe, si no, algo vacío
      return (data ?? emptyResult<T>()) as T;
    }

    return (data ?? emptyResult<T>()) as T;
  } catch (err: any) {
    // ⏱ Timeout (AbortController)
    if (err?.name === "AbortError") {
      const timeoutError = new Error(
        "No pudimos conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo."
      ) as any;
      timeoutError.status = 404;
      timeoutError.code = "TIMEOUT_ERROR";
      timeoutError.isNetworkError = true;
      logApiError("apiFetch-timeout", timeoutError);
      return emptyResult<T>();
    }

    // 🌐 Errores típicos de red / sin conexión en React Native / fetch
    const msg = String(err?.message ?? "");
    if (
      msg.includes("Network request failed") ||
      msg.includes("Failed to fetch") ||
      msg.includes("NetworkError")
    ) {
      const netError = new Error(
        "Parece que no hay conexión a internet. Verifica tu red e inténtalo nuevamente."
      ) as any;
      netError.status = 404;
      netError.code = "NETWORK_ERROR";
      netError.isNetworkError = true;
      logApiError("apiFetch-network", netError);
      return emptyResult<T>();
    }

    // cualquier otro error: solo lo registramos suave y devolvemos vacío
    logApiError("apiFetch-unknown", err);
    return emptyResult<T>();
  } finally {
    clearTimeout(id);
  }
}

// --------- Endpoints concretos -----------------------------------------
export async function fetchCategorias() {
  try {
    const res = await apiFetch<any[]>("/api/categorias");
    return Array.isArray(res) ? res : [];
  } catch {
    // Nunca deberíamos entrar aquí porque apiFetch ya no lanza, pero por si acaso
    return [];
  }
}



export async function fetchProductosDestacados() {
  try {
    const params = new URLSearchParams({
      onlyActive: "true",
      orderBy: "fecha_creacion",
      orderDir: "desc",
      limit: "10",
    });
    const res = await apiFetch<any[]>(`/api/productos/?${params.toString()}`);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

export async function fetchProductoById(id: number) {
  try {
    const res = await apiFetch<any>(`/api/productos/${id}`);
    return res ?? null;
  } catch {
    return null;
  }
}

// --------- Tipos (ajusta si tu API devuelve algo distinto) -------------
export type SignupPayload = {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  password: string;
  id_perfil: number;
};

export type SignupResult =
  | {
      ok: true;
      status: "created" | "pending_confirmation";
      tokens?: {
        access_token: string;
        refresh_token: string;
        expires_in?: number;
        token_type?: string;
      };
      user?: { id: string | null; email: string | null };
    }
  | { ok: false; message: string };

// --------- NUEVO: Signup -----------------------------------------------
export async function signupRequest(
  payload: SignupPayload
): Promise<SignupResult> {
  try {
    const res = await apiFetch<SignupResult>("/api/signup", {
      method: "POST",
      body: payload,
    });

    if (
      res.ok === true &&
      (res.status === "created" || res.status === "pending_confirmation")
    ) {
      return res;
    }
    return { ok: false, message: "Respuesta inesperada del servidor." };
  } catch (error: any) {
    return {
      ok: false,
      message: error?.message ?? "No se pudo crear la cuenta.",
    };
  }
}


import { supabase } from "@/lib/supabase";

type LoginResponse = {
  success: boolean;
  message?: string;
  tokens?: {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    token_type?: string;
  };
  user?: {
    id: string;
    email: string;
  };
};

export async function loginRequestApp(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const res = await apiFetch<LoginResponse>("/api/login", {
      method: "POST",
      body: { email, password, platform: "BODEGA" },
    });


    // Si tu API dice "ok" pero no trae tokens, no podemos hidratar sesión
    if (!res?.success) return res;

    const access_token = res?.tokens?.access_token;
    const refresh_token = res?.tokens?.refresh_token;

    if (!access_token || !refresh_token) {
      return {
        ...res,
        success: false,
        message:
          res?.message ??
          "Login exitoso, pero no se recibieron tokens para crear la sesión.",
      };
    }

    // ✅ Hidratar sesión de Supabase en el CLIENTE usando tokens del backend
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {

      return {
        success: false,
        message: `No se pudo persistir la sesión en el cliente: ${error.message}`,
      };
    }

    // (Opcional) Verificación rápida para debug
    // Si esto devuelve null, tu supabase client no está persistiendo correctamente (AsyncStorage)
    const snap = await supabase.auth.getSession();

    // Si quieres, puedes alinear el user retornado con data.session.user
    // pero no es obligatorio
    return {
      ...res,
      user: {
        id: data.session?.user?.id ?? res.user?.id ?? "",
        email: data.session?.user?.email ?? res.user?.email ?? email,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? "No se pudo iniciar sesión.",
    };
  }
}


// --------- Utilidad: Header de Autorización ----------------------------
function withAuthHeader(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --------- OTP: Generar -----------------------------------------------
export type OtpGenerateOk = {
  ok: true;
  id_event: string;
  expires_at: string;
  otp?: string;
};

export type OtpGenerateErr = {
  ok: false;
  error?: string;
  message?: string;
};

export type OtpGenerateResp = OtpGenerateOk | OtpGenerateErr;

export async function otpGenerate(
  id_accion: string,
  options?: {
    email?: string;
    channel?: "email" | "sms";
    ttlSeconds?: number;
    metadata?: Record<string, any>;
    returnOtpInResponse?: boolean;
    token?: string;
    replaceActive?: boolean;
  }
): Promise<OtpGenerateResp> {
  const {
    email,
    channel = "email",
    ttlSeconds,
    metadata,
    returnOtpInResponse,
    token,
    replaceActive,
  } = options ?? {};
  try {
    const data = await apiFetch<OtpGenerateOk>("/api/otp/generate", {
      method: "POST",
      headers: {
        ...withAuthHeader(token),
      },
      body: {
        id_accion,
        ...(email ? { email } : {}),
        ...(channel ? { channel } : {}),
        ...(ttlSeconds ? { ttlSeconds } : {}),
        ...(metadata ? { metadata } : {}),
        ...(returnOtpInResponse ? { returnOtpInResponse: true } : {}),
        ...(typeof replaceActive === "boolean" ? { replaceActive } : {}),
      },
    });
    return data;
  } catch (error: any) {
    const body = error?.body;
    const errMsg =
      (body && (body.error || body.message)) ||
      error?.message ||
      "No se pudo generar OTP.";
    return { ok: false, error: String(errMsg) };
  }
}

// --------- Usuarios: actualizar perfil actual (PUT + id) ----------------
export type UpdateUsuarioPayload = {
  id: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  dni?: string | null;
  email?: string;
  avatar_url?: string | null;
  phone_verified?: boolean;
};

export type UpdateUsuarioResult =
  | { ok: true; message?: string }
  | { ok: false; message: string };

export async function actualizarUsuarioActual(
  payload: UpdateUsuarioPayload,
  token?: string
): Promise<UpdateUsuarioResult> {
  try {
    const res = await apiFetch<UpdateUsuarioResult>("/api/usuarios/actualizar", {
      method: "PUT",
      headers: {
        ...withAuthHeader(token),
      },
      body: payload,
    });
    if (res?.ok === true) return res;
    return { ok: true, message: (res as any)?.message ?? "Actualizado." };
  } catch (error: any) {
    return {
      ok: false,
      message: error?.message ?? "No se pudo actualizar el usuario.",
    };
  }
}

// --------- OTP: Verificar ----------------------------------------------
export type OtpVerifyResponse = {
  ok: boolean;
  reason?: string;
  message?: string;
  details?: Record<string, any>;
};

export async function otpVerify(
  id_accion: string,
  otp: string,
  opts?: { id_event?: string; email?: string; debug?: boolean }
): Promise<OtpVerifyResponse> {
  const body: Record<string, string> = {
    id_accion,
    otp: otp.normalize("NFKC").replace(/\D+/g, ""),
  };
  if (opts?.id_event) body.id_event = opts.id_event;
  if (opts?.email) body.email = opts.email;

  const headers: Record<string, string> = {};
  if (opts?.debug && process.env.NODE_ENV !== "production") {
    headers["x-debug"] = "1";
  }

  try {
    return await apiFetch<OtpVerifyResponse>("/api/otp/verify", {
      method: "POST",
      headers,
      body,
    });
  } catch (error: any) {
    const body = error?.body;
    const reason = body?.reason || undefined;
    const message =
      body?.message ||
      body?.error ||
      error?.message ||
      "Error al verificar OTP.";
    const details = body?.details || undefined;
    return { ok: false, reason, message, details };
  }
}

// --------- Colonias: activas con cobertura ----------------------------
export type Colonia = {
  id_colonia: number;
  nombre_colonia: string;
  is_active: boolean;
  tiene_cobertura: boolean;
  referencia: string | null;
  updated_at: string;
};

export async function fetchColoniasActivasConCobertura(options?: {
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: "id_colonia" | "nombre_colonia" | "updated_at";
  orderDir?: "asc" | "desc";
}) {
  const {
    search,
    limit,
    offset,
    orderBy = "id_colonia",
    orderDir = "asc",
  } = options ?? {};

  try {
    const qs = new URLSearchParams({
      is_active: "true",
      tiene_cobertura: "true",
      orderBy,
      orderDir,
    });

    if (typeof limit === "number") qs.set("limit", String(limit));
    if (typeof offset === "number") qs.set("offset", String(offset));
    if (search && search.trim()) qs.set("search", search.trim());

    const res = await apiFetch<Colonia[]>(`/api/colonias?${qs.toString()}`);
    return Array.isArray(res) ? res : [];
  } catch {
    return [] as Colonia[];
  }
}

// --------- Direcciones: crear -----------------------------------------
export type DireccionRow = {
  id_direccion: number;
  uid: string;
  latitude: number;
  longitude: number;
  tipo_direccion: number;
  id_colonia: number | null;
  nombre_direccion: string | null;
  isPrincipal: boolean;
  referencia: string | null;
  created_at: string;
  updated_at: string;
};

export type CrearDireccionPayload = {
  uid: string;
  latitude: number;
  longitude: number;
  tipo_direccion: number;
  id_colonia?: number | null;
  nombre_direccion?: string | null;
  isPrincipal?: boolean;
  referencia?: string | null;
  enforceSinglePrincipal?: boolean;
};

export type CrearDireccionResult =
  | { ok: true; direccion: DireccionRow }
  | { ok: false; message: string };

export async function crearDireccion(
  payload: CrearDireccionPayload,
  token?: string
): Promise<CrearDireccionResult> {
  try {
    const data = await apiFetch<DireccionRow>("/api/direcciones", {
      method: "POST",
      headers: {
        ...withAuthHeader(token),
      },
      body: payload,
    });
    return { ok: true, direccion: data };
  } catch (error: any) {
    logApiError("Error crearDireccion", error);
    return {
      ok: false,
      message: error?.message ?? "No se pudo crear la dirección.",
    };
  }
}

// --------- Direcciones: leer por uid -----------------------------------
export type Direccion = DireccionRow;

export async function fetchDireccionesByUid(
  uid: string,
  options?: {
    principalOnly?: boolean;
    limit?: number;
    offset?: number;
    token?: string;
  }
): Promise<Direccion[]> {
  const { principalOnly, limit, offset, token } = options ?? {};
  try {
    const qs = new URLSearchParams({ uid });
    if (typeof principalOnly === "boolean")
      qs.set("principalOnly", String(principalOnly));
    if (typeof limit === "number") qs.set("limit", String(limit));
    if (typeof offset === "number") qs.set("offset", String(offset));

    const res = await apiFetch<Direccion[]>(`/api/direcciones?${qs.toString()}`, {
      headers: { ...withAuthHeader(token) },
    });
    return Array.isArray(res) ? res : [];
  } catch (error: any) {
    logApiError("Error fetchDireccionesByUid", error);
    return [];
  }
}

export async function fetchDireccionPrincipal(
  uid: string,
  token?: string
): Promise<Direccion | null> {
  try {
    const list = await fetchDireccionesByUid(uid, {
      principalOnly: true,
      token,
      limit: 1,
      offset: 0,
    });
    return list[0] ?? null;
  } catch (error: any) {
    logApiError("Error fetchDireccionPrincipal", error);
    return null;
  }
}

export async function eliminarDireccion(id: number) {
  const url = `/api/direcciones?id=${id}`;

  try {
    const resp = await apiFetch<{ message?: string; deletedId: number }>(url, {
      method: "DELETE",
    });

    return { ok: true as const, deletedId: resp.deletedId };
  } catch (error: any) {
    logApiError("Error eliminarDireccion", error);
    return {
      ok: false as const,
      message: error?.message ?? "No se pudo eliminar la dirección.",
      status: error?.status,
    };
  }
}

// --------- Direcciones: leer por id_direccion --------------------------
export async function fetchDireccionById(
  id_direccion: number,
  token?: string
): Promise<Direccion | null> {
  if (!Number.isFinite(id_direccion) || id_direccion <= 0) {
    return null;
  }

  try {
    const data = await apiFetch<Direccion>(`/api/direcciones/${id_direccion}`, {
      headers: { ...withAuthHeader(token) },
    });
    return data ?? null;
  } catch (error: any) {
    if (error?.status === 404) return null;
    logApiError("Error fetchDireccionById", error);
    return null;
  }
}

// --------- Direcciones: actualizar (PUT) -------------------------------
export type ActualizarDireccionPayload = {
  id_direccion: number;
  nombre_direccion?: string | null;
  latitude?: number;
  longitude?: number;
  referencia?: string | null;
  tipo_direccion?: number;
  id_colonia?: number | null;
};

export type ActualizarDireccionResult =
  | { ok: true; direccion: DireccionRow }
  | { ok: false; message: string; status?: number };

export async function actualizarDireccion(
  payload: ActualizarDireccionPayload,
  token?: string
): Promise<ActualizarDireccionResult> {
  try {
    if (!payload?.id_direccion || !Number.isFinite(payload.id_direccion)) {
      return { ok: false, message: "id_direccion inválido." };
    }

    const qs = new URLSearchParams({
      id: String(payload.id_direccion),
    }).toString();

    const data = await apiFetch<DireccionRow>(`/api/direcciones?${qs}`, {
      method: "PUT",
      headers: { ...withAuthHeader(token) },
      body: payload,
    });

    return { ok: true, direccion: data };
  } catch (error: any) {
    logApiError("Error actualizarDireccion", error);
    return {
      ok: false,
      message: error?.message ?? "No se pudo actualizar la dirección.",
      status: error?.status,
    };
  }
}

// --------- Carrito: validar precios y stock ----------------------------
export type CartValidateItemInput = {
  id: number;
  price: number;
  quantity: number;
  title?: string;
};

export type CartValidateOk = {
  id: number;
  status: "ok";
  requestedQty: number;
  requestedPrice: number;
  nombre_producto: string;
  dbPrice: number;
  availableQty: number;
  message: string;
};

export type CartValidatePriceMismatch = {
  id: number;
  status: "price_mismatch";
  requestedQty: number;
  requestedPrice: number;
  nombre_producto: string;
  dbPrice: number;
  availableQty: number;
  message: string;
};

export type CartValidateInsufficient = {
  id: number;
  status: "insufficient_stock";
  requestedQty: number;
  requestedPrice: number;
  nombre_producto: string;
  dbPrice: number;
  availableQty: number;
  suggestedQty: number;
  message: string;
};

export type CartValidateInactive = {
  id: number;
  status: "inactive";
  requestedQty: number;
  requestedPrice: number;
  message: string;
};

export type CartValidateNotFound = {
  id: number;
  status: "not_found";
  requestedQty: number;
  requestedPrice: number;
  message: string;
};

export type CartValidateItemResult =
  | CartValidateOk
  | CartValidatePriceMismatch
  | CartValidateInsufficient
  | CartValidateInactive
  | CartValidateNotFound;

export type CartValidateResponse = {
  ok: boolean;
  items: CartValidateItemResult[];
  totals: {
    serverSubtotal: number;
  };
};

export async function validateCart(
  items: CartValidateItemInput[],
  token?: string
): Promise<CartValidateResponse> {
  try {
    const payload = {
      items: items.map(({ id, price, quantity, title }) => ({
        id,
        price,
        quantity,
        ...(title ? { title } : {}),
      })),
    };

    const data = await apiFetch<CartValidateResponse>("/api/cart/validate", {
      method: "POST",
      headers: { ...withAuthHeader(token) },
      body: payload,
    });

    return {
      ok: Boolean(data?.ok),
      items: Array.isArray(data?.items) ? data.items : [],
      totals: {
        serverSubtotal: Number(data?.totals?.serverSubtotal ?? 0),
      },
    };
  } catch (error: any) {
    logApiError("Error validateCart", error);
    return {
      ok: false,
      items: [],
      totals: { serverSubtotal: 0 },
    };
  }
}

// --------- Métodos de pago: activos ------------------------------------
export type MetodoPago = {
  id_metodo: number;
  nombre?: string;
};

export async function fetchMetodosActivos(): Promise<MetodoPago[]> {
  try {
    const res = await apiFetch<{ ok: boolean; items: MetodoPago[] }>(
      "/api/metodos"
    );
    if (res?.ok && Array.isArray(res.items)) return res.items;
    return [];
  } catch (error: any) {
    logApiError("Error fetchMetodosActivos", error);
    return [];
  }
}

// --------- Orders: crear (POST /api/orders) ----------------------------
export type OrderItemInput = {
  id_producto: number;
  qty: number;
  precio: number;
  id_bodega?: number | null;
};

export type CreateOrderPayload = {
  id_status: number;
  items: OrderItemInput[];

  uid?: string;
  delivery?: number;
  isv?: number;
  ajuste?: number;
  num_factura?: string | null;
  rtn?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  tipo_dispositivo?: string | null;
  observacion?: string | null;
  usuario_actualiza?: string | null;

  actividad_observacion?: string | null;
};

export type CreateOrderOk = {
  message: string;
  reqId: string;
  data: {
    id_order: number;
    det_count: number;
    id_act?: number;
  };
};

export type CreateOrderErr = { message: string; reqId?: string };

export type CreateOrderResp = CreateOrderOk | CreateOrderErr;

export async function createOrderRequest(
  payload: CreateOrderPayload,
  token?: string
): Promise<CreateOrderResp> {
  try {
    const data = await apiFetch<CreateOrderOk>("/api/orders", {
      method: "POST",
      headers: { ...withAuthHeader(token) },
      body: payload,
      timeoutMs: 15000,
    });
    if (data?.data?.id_order) return data;
    return { message: "Respuesta inesperada del servidor." };
  } catch (error: any) {
    return {
      message: error?.message ?? "No se pudo crear la orden.",
    };
  }
}

export type OrderHeadApi = {
  id_order: number;
  uid: string;
  id_status: number | null;
  id_metodo: number | null;
  id_colonia: number | null;
  id_max_log: number | null;
  qty: number;
  sub_total: number;
  isv: number;
  delivery: number;
  ajuste: number;
  total: number;
  num_factura: string | null;
  rtn: string | null;
  latitud: string | null;
  longitud: string | null;
  observacion: string | null;
  usuario_actualiza: string | null;
  fecha_creacion: string;
  fecha_actualizacion?: string | null;
  status: string | null;
  nombre_colonia: string | null;
  usuario: string | null;
  metodo_pago: string | null;
};

type OrdersHeadApiResponse = {
  message: string;
  reqId?: string;
  data: OrderHeadApi[];
};

export async function fetchOrdersHeadByUid(
  uid: string,
  token?: string
): Promise<OrderHeadApi[]> {
  if (!uid || uid.trim() === "") {
    // uid inválido -> devolvemos lista vacía en vez de lanzar
    return [];
  }

  try {
    const qs = new URLSearchParams({ uid }).toString();

    const res = await apiFetch<OrdersHeadApiResponse>(`/api/orders?${qs}`, {
      method: "GET",
      headers: {
        ...withAuthHeader(token),
      },
    });

    return Array.isArray(res.data) ? res.data : [];
  } catch (error: any) {
    logApiError("Error fetchOrdersHeadByUid", error);
    return [];
  }
}

// --------- Orders: detalle por id (GET /api/orders/:id) ----------------
export type OrderDetailApi = {
  id_det: number;
  id_order: number;
  id_producto: number;
  qty: number;
  precio: number;
  id_bodega: number | null;
  sub_total: number | null;
  nombre_producto: string | null;
  url_imagen: string | null;
};

export type OrderActivityApi = {
  id_act: number;
  id_order: number;
  id_status: number | null;
  fecha_actualizacion: string | null;
  usuario_actualiza: string | null;
  observacion: string | null;
  status: string | null;
};

export type OrderByIdApi = {
  head: OrderHeadApi;
  det: OrderDetailApi[];
  activity: OrderActivityApi[];
};

type OrderByIdApiResponse = {
  message: string;
  reqId?: string;
  data: OrderByIdApi | null;
};

export async function fetchOrderById(
  id_order: number,
  token?: string,
  id_bodega?: number
): Promise<OrderByIdApi | null> {
  if (!Number.isFinite(id_order) || id_order <= 0) return null;
  if (id_bodega !== undefined && (!Number.isFinite(id_bodega) || id_bodega <= 0)) {
    return null;
  }

  try {
    const url =
      id_bodega !== undefined
        ? `/api/orden/${id_order}?id_bodega=${encodeURIComponent(String(id_bodega))}`
        : `/api/orden/${id_order}`;

    const res = await apiFetch<OrderByIdApiResponse>(url, {
      method: "GET",
      headers: {
        ...withAuthHeader(token),
      },
    });

    return res.data ?? null;
  } catch (error: any) {
    if (error?.status === 404) return null;
    logApiError("Error fetchOrderById", error);
    return null;
  }
}



export type OrderHeadByBodegaApi = {
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

type OrdersHeadByBodegaApiResponse = {
  message: string;
  reqId?: string;
  data: OrderHeadByBodegaApi[];
};

export async function fetchOrdersHeadByBodega(
  id_bodega: number,
  token?: string
): Promise<OrderHeadByBodegaApi[]> {
  if (!Number.isFinite(id_bodega) || id_bodega <= 0) {
    // id_bodega inválido -> devolvemos lista vacía
    return [];
  }

  try {
    const qs = new URLSearchParams({ id_bodega: String(id_bodega) }).toString();

    const res = await apiFetch<OrdersHeadByBodegaApiResponse>(
      `/api/orders/by-bodega?${qs}`,
      {
        method: "GET",
        headers: {
          ...withAuthHeader(token),
        },
      }
    );

    return Array.isArray(res?.data) ? res.data : [];
  } catch (error: any) {
    logApiError("Error fetchOrdersHeadByBodega", error);
    return [];
  }
}

// Tipos (ajusta si ya los tienes en otro archivo)
export type VwOrdersDetRow = {
  id_det: number;
  id_order: number;
  id_producto: number;
  qty: number;
  precio: number;
  sub_total: number;
  nombre_producto: string | null;
  url_imagen: string | null;
};

export type OrdersDetByBodegaApiResponse = {
  message: string;
  data: VwOrdersDetRow[];
  reqId: string;
};

/**
 * Fetch a tu API:
 * GET /api/orders-det/by-bodega?id_order=#&id_bodega=#
 */
export async function fetchOrdersDetByBodega(
  id_order: number,
  id_bodega: number,
  token?: string
): Promise<VwOrdersDetRow[]> {
  if (!Number.isFinite(id_order) || id_order <= 0) return [];
  if (!Number.isFinite(id_bodega) || id_bodega <= 0) return [];

  try {
    const qs = new URLSearchParams();
    qs.set("id_order", String(id_order));
    qs.set("id_bodega", String(id_bodega));

    const url = `/api/orders-det/by-bodega?${qs.toString()}`;

    const res = await apiFetch<OrdersDetByBodegaApiResponse>(url, {
      method: "GET",
      headers: {
        ...withAuthHeader(token),
      },
    });

    console.log('res,',res );
    

    return Array.isArray(res.data) ? res.data : [];
  } catch (error: any) {
    logApiError("Error fetchOrdersDetByBodega", error);
    return [];
  }
}


// --------- ActivityOrder: por id_order (GET /api/activityOrder/:id) ----
export type ActivityOrderApi = {
  id_act: number;
  id_order: number;
  id_status: number | null;
  fecha_actualizacion: string | null;
  usuario_actualiza: string | null;
  observacion: string | null;
};

type ActivityOrderByIdResponse = {
  message: string;
  reqId?: string;
  data: ActivityOrderApi[];
};

export async function fetchActivityOrderByOrderId(
  id_order: number,
  token?: string
): Promise<ActivityOrderApi[]> {
  if (!Number.isFinite(id_order) || id_order <= 0) return [];

  try {
    const res = await apiFetch<ActivityOrderByIdResponse>(
      `/api/activityOrder/${id_order}`,
      {
        method: "GET",
        headers: {
          ...withAuthHeader(token),
        },
      }
    );

    return Array.isArray(res?.data) ? res.data : [];
  } catch (error: any) {
    logApiError("Error fetchActivityOrderByOrderId", error);
    return [];
  }
}


// --------- Orders: update status (POST /api/orders/update-status) ------


export type UpdateOrderStatusOk = {
  message: string;
  reqId?: string;
  data: {
    id_order: number;
    from_status: number;
    to_status: number;
    id_act?: number;
  };
};

export type UpdateOrderStatusErr = {
  message: string;
  reqId?: string;
};

export type UpdateOrderStatusResp = UpdateOrderStatusOk | UpdateOrderStatusErr;

/**
 * POST /api/orders/update-status
 * Body: { id_order, id_status_destino, observacion?, usuario_actualiza? }
 */
/**
 * POST /api/orders/update-status
 * Body: { id_order, id_status_destino, id_bodega?, observacion?, usuario_actualiza? }
 */

export type UpdateOrderStatusPayload = {
  id_order: number;
  id_status_destino: number;
  id_bodega?: number | null; // ✅ opcional
  observacion?: string | null;
  usuario_actualiza?: string | null;
};

export async function updateOrderStatusByIdRequest(
  payload: UpdateOrderStatusPayload,
  token?: string
): Promise<UpdateOrderStatusResp> {
  // validaciones suaves para no romper flujo
  if (!Number.isFinite(payload?.id_order) || payload.id_order <= 0) {
    return { message: "id_order inválido." };
  }
  if (
    !Number.isFinite(payload?.id_status_destino) ||
    payload.id_status_destino <= 0
  ) {
    return { message: "id_status_destino inválido." };
  }

  // ✅ id_bodega opcional: solo validamos si viene
  const bodegaNum =
    payload?.id_bodega === undefined || payload?.id_bodega === null
      ? undefined
      : Number(payload.id_bodega);

  if (
    bodegaNum !== undefined &&
    (!Number.isFinite(bodegaNum) || bodegaNum <= 0)
  ) {
    return { message: "id_bodega inválido (si lo envías debe ser > 0)." };
  }

  try {
    const body: Record<string, any> = {
      id_order: payload.id_order,
      id_status_destino: payload.id_status_destino,
      observacion: payload.observacion ?? null,
      usuario_actualiza: payload.usuario_actualiza ?? null,
    };

    // ✅ solo se agrega si viene en el payload (opcional)
    if (bodegaNum !== undefined) {
      body.id_bodega = bodegaNum;
    }

    const res = await apiFetch<UpdateOrderStatusOk>("/api/orders/update-status", {
      method: "POST",
      headers: {
        ...withAuthHeader(token),
      },
      body,
      timeoutMs: 15000,
    });

    // Si vino con data coherente, devolvemos ok
    if (res?.data?.id_order) return res;

    // Si el backend devolvió un message pero no data, devolvemos eso
    return {
      message: (res as any)?.message ?? "Respuesta inesperada del servidor.",
    };
  } catch (error: any) {
    logApiError("Error updateOrderStatusByIdRequest", error);
    return {
      message: error?.message ?? "No se pudo actualizar el estado de la orden.",
    };
  }
}

// --------- Orders Fulfillment: por bodega + status opcional -------------
// Endpoint:
// GET /api/orders/fulfillment/by-bodega?id_bodega=1&id_status=2

export type OrdersFulfillmentRow = {
  id_fulfillment: number;
  id_order: number;
  id_bodega: number | null;
  id_status: number | null;
  is_used: boolean | null;
  observacion: string | null;
  usuario_actualiza: string | null;
  fecha_actualizacion: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_by: string | null;
  updated_at: string | null;
};

export type OrdersFulfillmentByBodegaOk = {
  message: string;
  reqId?: string;
  data: OrdersFulfillmentRow[];
};

export type OrdersFulfillmentByBodegaErr = {
  message: string;
  reqId?: string;
  data?: OrdersFulfillmentRow[];
};

export type OrdersFulfillmentByBodegaResp =
  | OrdersFulfillmentByBodegaOk
  | OrdersFulfillmentByBodegaErr;

/**
 * GET /api/orders/fulfillment/by-order?id_order=...&id_status=...
 * - id_order: requerido
 * - id_status: opcional (si viene, filtra por ese status)
 *
 * Devuelve fulfillment de TODAS las bodegas para la orden.
 */export async function fetchOrdersFulfillmentByOrder(
  params: { id_order: number; id_status?: number | null },
  token?: string
): Promise<OrdersFulfillmentRow[]> {
  const id_order = Number(params?.id_order);
  const id_status =
    params?.id_status === undefined || params?.id_status === null
      ? undefined
      : Number(params.id_status);

  if (!Number.isFinite(id_order) || id_order <= 0) return [];
  if (id_status !== undefined && (!Number.isFinite(id_status) || id_status <= 0)) return [];

  try {
    const qs = new URLSearchParams();
    qs.set("id_order", String(id_order));
    if (id_status !== undefined) qs.set("id_status", String(id_status));

    const path = `/api/orders/fulfillment/by-bodega?${qs.toString()}`;
    const res = await apiFetch<any>(path, {
      method: "GET",
      headers: { ...withAuthHeader(token) },
      timeoutMs: 15000,
    });

    console.log("[fetchOrdersFulfillmentByOrder] path:", path);
    console.log("[fetchOrdersFulfillmentByOrder] raw res:", res);

    const rows = res?.data;
    console.log("[fetchOrdersFulfillmentByOrder] res.data:", rows);

    return Array.isArray(rows) ? (rows as OrdersFulfillmentRow[]) : [];
  } catch (error: any) {
    logApiError("Error fetchOrdersFulfillmentByOrder", error);
    return [];
  }
}
