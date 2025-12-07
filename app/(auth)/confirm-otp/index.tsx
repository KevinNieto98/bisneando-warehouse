import AlertModal from "@/components/ui/AlertModal";
import LoginButton from "@/components/ui/LoginButton";
import { useBackHandler } from "@/hooks/useBackHandler";
import { supabase } from "@/lib/supabase";
import { otpGenerate, otpVerify, signupRequest } from "@/services/api";

import { useSignupDraft } from "@/store/useSignupDraft";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function ConfirmOTPPage() {
  const { draft, clearDraft } = useSignupDraft();
  const { handleBack } = useBackHandler();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ email?: string; eventId?: string; expiresAt?: string }>();

  const userEmail = draft?.correo ?? (params.email as string | undefined);

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputsRef = useRef<Array<TextInput | null>>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState("");

  // Cooldown para reenvío
  const [cooldown, setCooldown] = useState(0); // en segundos

  const show = (m: string) => { setModalMsg(m); setModalVisible(true); };

  useEffect(() => {
    // foco inicial en el primer input
    const t = setTimeout(() => inputsRef.current[0]?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const moveFocus = (idx: number, dir: 1 | -1) => {
    const next = idx + dir;
    if (next >= 0 && next < 6) inputsRef.current[next]?.focus();
  };

  const handleChange = (idx: number, raw: string) => {
    const digits = raw.replace(/\D+/g, "");
    // Pegado múltiple
    if (digits.length > 1) {
      const next = [...code];
      let i = idx;
      for (const d of digits.split("")) {
        if (i > 5) break;
        next[i] = d;
        i++;
      }
      setCode(next);
      if (idx + digits.length <= 5) inputsRef.current[idx + digits.length]?.focus();
      return;
    }

    const d = digits.slice(-1); // último dígito
    const next = [...code];
    next[idx] = d;
    setCode(next);
    if (d) moveFocus(idx, 1);
  };

  const handleKeyPress = (idx: number, e: any) => {
    if (e.nativeEvent.key === "Backspace") {
      if (code[idx]) {
        const next = [...code];
        next[idx] = "";
        setCode(next);
      } else {
        moveFocus(idx, -1);
      }
    }
  };

  const joinOtp = () => code.join("");

  const verifyOtp = async () => {
    const otp = joinOtp();

    if (otp.length !== 6) {
      show("Ingresa el código de 6 dígitos.");
      return;
    }
    if (!draft) {
      show("No hay información de registro. Vuelve a la pantalla anterior.");
      return;
    }

    try {
      setIsLoading(true);

const id_event = params.eventId as string | undefined;
const verifyRes = await otpVerify("verify_account", otp, {
  id_event,
  email: userEmail,
  debug: true, // 👈 para ver details en DEV
});

if (!verifyRes.ok) {
  const base = verifyRes.message ?? verifyRes.reason ?? "No se pudo verificar el código.";
  // Si quieres ver detalles en modal durante dev:
  if (__DEV__ && verifyRes.details) {
    show(`${base}\n\nDetalles: ${JSON.stringify(verifyRes.details, null, 2)}`);
  } else {
    show(base);
  }
  return;
}

      // ✅ OTP OK -> crear cuenta
      const res = await signupRequest({
        nombre: draft.nombre,
        apellido: draft.apellido,
        telefono: draft.telefono,
        correo: draft.correo,
        password: draft.password,
        id_perfil: 1,
      });

      if (!res.ok) {
        show(res.message ?? "No se pudo crear la cuenta.");
        return;
      }

      if (res.status === "created") {
        const at = res.tokens?.access_token;
        const rt = res.tokens?.refresh_token;

        if (at && rt) {
          const { error: setErr } = await supabase.auth.setSession({
            access_token: at,
            refresh_token: rt,
          });
          if (setErr) {
            show("Cuenta creada, pero no se pudo establecer la sesión local.");
            return;
          }
        }

        clearDraft();
        router.replace("/(tabs)/home?welcome=1");
        return;
      }

      show("Registro creado. Revisa tu correo para verificar tu cuenta.");
    } catch (err) {
      console.error(err);
      show("Ocurrió un error al verificar el código. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!userEmail) {
      show("No se encontró un correo para reenviar el código.");
      return;
    }
    if (cooldown > 0) return;

    try {
      setCooldown(60); // inicia cooldown
      const resp = await otpGenerate("verify_account", {
        email: userEmail,
        channel: "email",
        metadata: { reintento: true },
        returnOtpInResponse: __DEV__,
      });

      if (!resp?.ok) {
        show("No se pudo reenviar el código. Intenta más tarde.");
        return;
      }

      if (__DEV__ && resp.otp) {
        show(`Código reenviado a ${userEmail}. (DEV: ${resp.otp})`);
      } else {
        show(`Código reenviado a ${userEmail}.`);
      }
    } catch (e) {
      console.error(e);
      show("Ocurrió un error al reenviar el código.");
      setCooldown(0); // liberar el cooldown si falló
    }
  };

  const cooldownLabel =
    cooldown > 0
      ? `Reenviar código (${String(Math.floor(cooldown / 60)).padStart(1, "0")}:${String(cooldown % 60).padStart(2, "0")})`
      : "Reenviar código";

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top + 56}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safe}>
          {/* Back */}
          <TouchableOpacity
            onPress={() => handleBack()}
            style={{ position: "absolute", top: insets.top + 8, left: 16, zIndex: 10, padding: 8 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={28} color="#374151" />
          </TouchableOpacity>

          <View style={styles.center}>
            {/* Logo */}
            <Image
              source={require("@/assets/images/bisneando.png")}
              style={{ width: 160, height: 80, marginBottom: 24 }}
              resizeMode="contain"
            />

            <View style={styles.card}>
              <Text style={styles.title}>Confirma tu OTP</Text>
              <Text style={styles.subtitle}>
                Ingresa el código que enviamos a tu correo {userEmail ? `(${userEmail})` : ""}.
              </Text>

              <View style={styles.otpRow}>
                {code.map((val, idx) => (
                  <TextInput
                    key={idx}
                    ref={(r) => { inputsRef.current[idx] = r; }}
                    value={val}
                    onChangeText={(t) => handleChange(idx, t)}
                    onKeyPress={(e) => handleKeyPress(idx, e)}
                    style={styles.otpInput}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    textContentType="oneTimeCode"
                    maxLength={1}
                    returnKeyType="next"
                    autoFocus={idx === 0}
                    selectTextOnFocus
                  />
                ))}
              </View>

              <LoginButton
                title={isLoading ? "Verificando..." : "Confirmar código"}
                onPress={verifyOtp}
                disabled={isLoading}
              />

              <TouchableOpacity
                onPress={handleResend}
                disabled={cooldown > 0}
                style={{ alignSelf: "center", marginTop: 8, opacity: cooldown > 0 ? 0.5 : 1 }}
              >
                <Text style={styles.resend}>{cooldownLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      <AlertModal
        visible={modalVisible}
        title="Aviso"
        message={modalMsg}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#facc15" },
  safe: { flex: 1, paddingHorizontal: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
    textAlign: "center",
  },
  subtitle: { fontSize: 14, color: "#374151", textAlign: "center" },
  otpRow: {
    flexDirection: "row",
    gap: 10,
    alignSelf: "center",
    marginVertical: 6,
  },
  otpInput: {
    width: 46,
    height: 56,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 22,
    textAlign: "center",
  },
  resend: { color: "#a16207", fontWeight: "700", fontSize: 13 },
});
