import { ProductHeader } from "@/components/product/ProductHeader";
import Icono from "@/components/ui/Icon.native";
import React, { useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  date: string;
  type: "order" | "promo" | "system";
  read: boolean;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Pedido confirmado",
      message: "Tu pedido ORD-123456 ha sido confirmado y está en preparación.",
      date: "Hoy, 10:35 AM",
      type: "order",
      read: false,
    },
    {
      id: "2",
      title: "Nueva promoción 🎉",
      message: "Aprovecha 20% de descuento en productos seleccionados por tiempo limitado.",
      date: "Ayer, 7:12 PM",
      type: "promo",
      read: true,
    },
    {
      id: "3",
      title: "Actualización del sistema",
      message: "Hemos mejorado la seguridad y velocidad de la aplicación.",
      date: "2 Oct, 3:40 PM",
      type: "system",
      read: true,
    },
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIconByType = (type: NotificationItem["type"]) => {
    switch (type) {
      case "order":
        return "Truck";
      case "promo":
        return "Gift";
      case "system":
        return "Info";
      default:
        return "Bell";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />
      <ProductHeader showCartButton={false} />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Notificaciones</Text>

        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icono name="BellOff" size={42} color="#9ca3af" />
            <Text style={styles.emptyText}>No tienes notificaciones nuevas</Text>
          </View>
        ) : (
          notifications.map((n) => (
            <Pressable
              key={n.id}
              onPress={() => handleMarkAsRead(n.id)}
              style={({ pressed }) => [
                styles.card,
                pressed && { backgroundColor: "#f3f4f6" },
                !n.read && styles.unreadCard,
              ]}
              android_ripple={{ color: "#e5e7eb" }}
            >
              <View style={styles.iconContainer}>
                <Icono
                  name={getIconByType(n.type)}
                  size={22}
                  color={n.read ? "#6b7280" : "#2563eb"}
                />
              </View>
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.cardTitle,
                    !n.read && { color: "#111827", fontWeight: "700" },
                  ]}
                >
                  {n.title}
                </Text>
                <Text style={styles.cardMessage}>{n.message}</Text>
                <Text style={styles.cardDate}>{n.date}</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD600" },
  scrollArea: { flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  scrollContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 10,
  },
  unreadCard: {
    backgroundColor: "#f0f9ff",
    borderColor: "#2563eb",
  },
  iconContainer: {
    backgroundColor: "#e0e7ff",
    borderRadius: 8,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  cardMessage: {
    fontSize: 13,
    color: "#4b5563",
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  emptyText: {
    color: "#6b7280",
    marginTop: 8,
    fontSize: 14,
  },
});
