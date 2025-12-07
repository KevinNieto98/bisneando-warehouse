// (tabs)/profile/index.tsx
import ConfirmModal from "@/components/ui/ConfirmModal";
import Icono from "@/components/ui/Icon.native";
import useAuth from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const navigation = useNavigation();
  const { user, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  // ✅ Banner verde de éxito
  const params = useLocalSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  const { profile, loading: loadingProfile } = useProfile(user?.id);

  // Redirigir si no hay sesión
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/(auth)/login");
    }
  }, [loading, user]);

  // Mostrar banner si viene ?success=1 y limpiar la URL
  useEffect(() => {
    const successParam = params?.success;
    const isSuccess =
      successParam === "1" || (Array.isArray(successParam) && successParam.includes("1"));

    if (isSuccess) {
      setShowSuccess(true);
      const t = setTimeout(() => {
        setShowSuccess(false);
        router.replace("/(tabs)/profile"); // limpia el query param
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [params?.success]);

  // Logout
  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error al cerrar sesión:", error);
        Alert.alert("Error", "No se pudo cerrar sesión. Intenta de nuevo.");
        setLoggingOut(false);
        return;
      }
      router.replace("/(auth)/login");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Ocurrió un problema al cerrar sesión.");
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading || (user && loadingProfile)) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!user) return null;

  const displayName =
    [profile?.nombre, profile?.apellido].filter(Boolean).join(" ").trim() ||
    (user.user_metadata?.name as string | undefined) ||
    "Usuario sin nombre";

  const displayEmail = profile?.email ?? user.email ?? undefined;
  const avatarUrl = profile?.avatar_url ?? (user.user_metadata?.avatar_url as string | undefined);

  return (
    // ⬇️ SafeAreaView para teñir el notch / área superior de amarillo
    <SafeAreaView style={styles.safeTop} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Zona amarilla */}
        <View style={styles.yellowSection}>
          {/* Header con botón de volver */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#1e293b" />
              <Text style={styles.backText}>Volver</Text>
            </TouchableOpacity>
          </View>

          {/* Banner de éxito */}
          {showSuccess && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#065f46" />
              <Text style={styles.successText}>Cambios realizados exitosamente</Text>
            </View>
          )}

          {/* Perfil */}
          <View style={styles.profileSection}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person-circle-outline" size={80} color="#a16207" />
              </View>
            )}

            <Text style={styles.userName}>{displayName}</Text>
            {!!displayEmail && <Text style={styles.emailText}>{displayEmail}</Text>}
          </View>
        </View>

        {/* Contenido blanco */}
        <View style={styles.whiteSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/edit_profile")}>
            <Ionicons name="person-outline" size={22} color="#27272a" />
            <Text style={styles.menuText}>Editar Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/address")}>
            <Ionicons name="location-outline" size={22} color="#27272a" />
            <Text style={styles.menuText}>Mis direcciones</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/orders")}>
            <Icono name="Tag" size={22} color="#27272a" />
            <Text style={styles.menuText}>Mis pedidos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/legal_information")}>
            <Ionicons name="document-text-outline" size={22} color="#27272a" />
            <Text style={styles.menuText}>Información legal</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* 🚪 Botón de cerrar sesión */}
          <TouchableOpacity
            style={[styles.logoutButton, loggingOut && { opacity: 0.6 }]}
            onPress={() => setConfirmVisible(true)}
            disabled={loggingOut}
          >
            <Ionicons name="log-out-outline" size={22} color="#dc2626" />
            <Text style={styles.logoutText}>
              {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Versión 1.0.1</Text>
            <Text style={styles.footerText}>Powered by DDG Soluciones Digitales 2025</Text>
          </View>
        </View>
      </ScrollView>

      {/* Confirmación de cierre de sesión */}
      <ConfirmModal
        visible={confirmVisible}
        title="Confirmación"
        message="¿Estás seguro que deseas cerrar sesión?"
        icon="help-circle"
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        onConfirm={() => {
          setConfirmVisible(false);
          handleLogout();
        }}
        onCancel={() => setConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ⬅️ Pintamos el área segura de arriba de amarillo
  safeTop: { flex: 1, backgroundColor: "#facc15" },

  // El resto de la pantalla sigue en blanco, sin paddingTop para no crear gaps
  container: { flexGrow: 1, backgroundColor: "#fff" },

  // Banner verde de éxito
  successBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#d1fae5",
    borderColor: "#a7f3d0",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  successText: {
    color: "#065f46",
    fontWeight: "700",
  },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  loadingText: { fontSize: 16, color: "#52525b" },

  yellowSection: {
    backgroundColor: "#facc15",
    paddingTop: 12, // ⬅️ más pequeño; el SafeArea ya maneja el notch
    paddingBottom: 40,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: { marginBottom: 16 },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backText: { color: "#1e293b", marginLeft: 6, fontWeight: "600" },
  profileSection: { alignItems: "center", marginBottom: 10 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: "#a16207" },
  avatarPlaceholder: {
    width: 110, height: 110, borderRadius: 55, backgroundColor: "#fef9c3",
    justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#a16207",
  },
  userName: { marginTop: 10, fontSize: 18, fontWeight: "700", color: "#1e293b" },
  emailText: { marginTop: 4, fontSize: 14, color: "#3f3f46" },

  whiteSection: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 24 },
  separator: { height: 1, backgroundColor: "#e4e4e7", marginVertical: 16 },
  menuItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#f3f4f6", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 10,
  },
  menuText: { fontSize: 16, color: "#27272a" },

  logoutButton: {
    flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fef2f2",
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: "#fee2e2", marginTop: 8,
  },
  logoutText: { color: "#dc2626", fontWeight: "600", fontSize: 16 },

  footer: { marginTop: 20, alignItems: "center" },
  footerText: { fontSize: 12, color: "#9ca3af" },
});
