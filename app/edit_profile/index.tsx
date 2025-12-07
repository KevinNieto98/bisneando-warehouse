// screens/ProfileScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AlertModal from "@/components/ui/AlertModal";
import Icono from "@/components/ui/Icon.native";
import LinksApp from "@/components/ui/LinksApp";
import TitleForm from "@/components/ui/TitleForm";
import useAuth from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { actualizarUsuarioActual, otpGenerate, otpVerify } from "@/services/api"; // OTP aquí

import ConfirmModal from "@/components/ui/ConfirmModal";
import DNIMaskedInput, { isValidDNI } from "./components/DNIMaskedInput";
import NameRow from "./components/NameRow";
import OtpModal from "./components/OtpModal";
import PhoneField from "./components/PhoneField";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, loading } = useAuth();
  const { profile, loading: loadingProfile } = useProfile(user?.id);

  // Alerts (solo para errores/infos locales)
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertIcon, setAlertIcon] = useState<keyof typeof Ionicons.glyphMap>("alert-circle");
  const showAlert = (title: string, message: string, icon: keyof typeof Ionicons.glyphMap = "alert-circle") => {
    setAlertTitle(title); setAlertMessage(message); setAlertIcon(icon); setAlertVisible(true);
  };

  // OTP UI
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);

  // Confirmación Guardar
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [saving, setSaving] = useState(false); // evita múltiples submit

  // Form state (editables)
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [phoneVerified, setPhoneVerified] = useState<boolean>(false);

  // DNI (masked y raw)
  const [dniMasked, setDniMasked] = useState<string>("");
  const [dniRaw, setDniRaw] = useState<string>("");

  // Snapshot inicial para detectar cambios
  const [initial, setInitial] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    dniRaw: "",
  });

  // Cargar perfil
  useEffect(() => {
    if (profile) {
      const pNombre = profile?.nombre ?? "";
      const pApellido = profile?.apellido ?? "";
      const pTelefono = profile?.phone ?? "";
      const pEmail = profile?.email ?? user?.email ?? "";
      const pPhoneVerified = profile?.phone_verified ?? false;
      const pDniRaw = (profile?.dni ?? "").replace(/\D/g, "").slice(0, 13);

      setNombre(pNombre);
      setApellido(pApellido);
      setTelefono(pTelefono);
      setEmail(pEmail);
      setPhoneVerified(pPhoneVerified);

      setDniMasked(profile?.dni ?? "");
      setDniRaw(pDniRaw);

      setInitial({
        nombre: pNombre,
        apellido: pApellido,
        telefono: pTelefono,
        dniRaw: pDniRaw,
      });
    }
  }, [profile, user?.email]);

  // Redirigir si no hay sesión
  useEffect(() => {
    if (!loading && !user) navigation.navigate("Login" as never);
  }, [loading, user, navigation]);

  // ¿Hay cambios?
  const isDirty = useMemo(() => {
    const n = (s: string) => (s ?? "").trim();
    return (
      n(nombre)   !== n(initial.nombre)   ||
      n(apellido) !== n(initial.apellido) ||
      n(telefono) !== n(initial.telefono) ||
      (dniRaw ?? "") !== (initial.dniRaw ?? "")
    );
  }, [nombre, apellido, telefono, dniRaw, initial]);

  // Generar OTP (email)
  const handleVerifyAccount = async () => {
    if (loadingGenerate) return;
    try {
      setLoadingGenerate(true);
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;
      if (!token) { showAlert("Sesión requerida", "Inicia sesión para verificar tu cuenta.", "lock-closed"); return; }
      if (!email) { showAlert("Correo no disponible", "No se encontró tu correo electrónico.", "mail"); return; }

      const res = await otpGenerate("verify_account", { email, ttlSeconds: 300, returnOtpInResponse: __DEV__, token });
      if (__DEV__ && res?.otp) showAlert("OTP de desarrollo", `Código: ${res.otp}`, "construct");
      else showAlert("Código enviado", "Revisa tu correo electrónico para el código.", "mail");
      setOtpCode(""); setOtpModalVisible(true);
    } catch (e: any) {
      showAlert("No se pudo generar el código", e?.message ?? "Intenta de nuevo.", "warning");
    } finally { setLoadingGenerate(false); }
  };

  // Verificar OTP (email)
  const handleSubmitOtp = async () => {
    if (!otpCode || otpCode.length < 4) { showAlert("Código incompleto", "Ingresa tu código de verificación."); return; }
    try {
      setLoadingVerify(true);
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;
      if (!token) { showAlert("Sesión requerida", "Inicia sesión para verificar tu cuenta."); return; }
      const res = await otpVerify("verify_account", otpCode, token);
      if (res.ok) { setOtpModalVisible(false); showAlert("¡Cuenta verificada!", "Tu verificación se completó con éxito.", "checkmark-circle"); }
      else showAlert("Código inválido", res?.reason ?? "Verifica tu código e intenta nuevamente.", "close-circle");
    } catch (e: any) {
      showAlert("Error al verificar", e?.message ?? "Intenta de nuevo.", "warning");
    } finally { setLoadingVerify(false); }
  };

  // Guardar cambios usando /api/usuarios/actualizar (PUT + id)
  const handleSave = async () => {
    if (!user || saving) return;

    // Validación DNI si lo llenaron
    if (dniMasked && !isValidDNI(dniMasked)) {
      showAlert("DNI inválido", "Debe tener 13 dígitos en formato 0000-0000-00000", "alert-circle");
      return;
    }

    try {
      setSaving(true);
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? undefined;

      const payload = {
        id: user.id, // ⬅️ requerido por tu API
        nombre,
        apellido,
        telefono,
        dni: dniRaw.length ? dniRaw : null,
      };

      const res = await actualizarUsuarioActual(payload, token);
      if (!res.ok) throw new Error(res.message ?? "No se pudo actualizar el usuario.");

      // Actualizar snapshot local (para ocultar botón Guardar)
      setInitial({
        nombre: (nombre ?? "").trim(),
        apellido: (apellido ?? "").trim(),
        telefono: (telefono ?? "").trim(),
        dniRaw: dniRaw ?? "",
      });

      router.replace("/(tabs)/profile?success=1");
    } catch (e: any) {
      const detail = e?.message || "No se pudo actualizar.";
      showAlert("Error al guardar", detail, "warning");
    } finally {
      setSaving(false);
    }
  };

  // Acción botón teléfono
  const handlePhoneAction = () => {
    if (phoneVerified) {
      showAlert("Editar teléfono", "Aquí podrías permitir editar el número.");
    } else {
      showAlert("Verificación", "Aquí puedes iniciar el proceso de verificación del teléfono.");
    }
  };

  if (loading || loadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }
  if (!user) return null;

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
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Perfil */}
        <View style={styles.userRow}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{nombre ? nombre.charAt(0).toUpperCase() : "U"}</Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{`${nombre} ${apellido}`.trim() || "Usuario sin nombre"}</Text>
            <Text style={styles.userEmail}>{email}</Text>
          </View>
        </View>

        <TitleForm text="Editar Perfil" size="md" />

        <NameRow nombre={nombre} apellido={apellido} onChangeNombre={setNombre} onChangeApellido={setApellido} />

        <PhoneField telefono={telefono} onChangeTelefono={setTelefono} phoneVerified={phoneVerified} onPressAction={handlePhoneAction} />

        {/* DNI con máscara */}
        <DNIMaskedInput
          value={dniMasked}
          onChangeMasked={setDniMasked}
          onChangeRaw={setDniRaw}
          required={false}
          showHint
        />

        <TitleForm text="Seguridad" size="md" />

        {/* Fila: Cambiar contraseña + Eliminar (pequeño) */}
        <View style={styles.inlineActionsRow}>
          <TouchableOpacity
            style={styles.deleteSmall}
            onPress={() => {
              showAlert("Acción restringida", "La eliminación de clientes está deshabilitada.", "information-circle");
            }}
            activeOpacity={0.85}
          >
            <Icono name="Trash" size={16} color="#dc2626" />
            <Text style={styles.deleteSmallText}>Eliminar</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <LinksApp name="KeyRound" title="Cambiar Contraseña" onPress={() => {}} />
          </View>
        </View>

        {/* Botón Guardar SOLO si hay cambios */}
        {isDirty && (
          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
            onPress={() => !saving && setConfirmVisible(true)}
            activeOpacity={0.9}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Icono name="Check" size={20} color="#fff" />}
            <Text style={styles.saveText}>{saving ? "Guardando..." : "Guardar"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal OTP */}
      <OtpModal
        visible={otpModalVisible}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        loadingVerify={loadingVerify}
        onClose={() => setOtpModalVisible(false)}
        onSubmit={handleSubmitOtp}
      />

      {/* Confirmación Guardar */}
      <ConfirmModal
        visible={confirmVisible}
        title="Guardar cambios"
        message="¿Deseas guardar los cambios de tu perfil?"
        icon="save-outline"
        confirmText="Guardar"
        cancelText="Cancelar"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => {
          setConfirmVisible(false);
          handleSave();
        }}
      />

      {/* AlertModal (errores/info) */}
      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        icon={alertIcon}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, color: "#4b5563" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD600",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  backButton: { padding: 6, borderRadius: 20 },

  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },

  userRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  avatarContainer: { marginRight: 16 },
  avatarCircle: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: "#facc15", justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 26, fontWeight: "bold" },
  userInfo: { flexDirection: "column" },
  userName: { fontSize: 18, fontWeight: "bold", color: "#1e293b" },
  userEmail: { fontSize: 14, color: "#52525b", marginTop: 4 },

  inlineActionsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 8,
    marginBottom: 10,
  },
  deleteSmall: {
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#fee2e2",
    backgroundColor: "#fef2f2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  deleteSmallText: { color: "#dc2626", fontWeight: "600", fontSize: 13 },

  saveButton: {
    width: "100%",
    height: 45,
    backgroundColor: "#22c55e",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  saveText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
