// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#DAA520",
        tabBarInactiveTintColor: "#6b7280",
        tabBarHideOnKeyboard: Platform.OS === "android",
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >

      {/* Orders */}
      <Tabs.Screen
        name="orders/index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={focused ? size + 4 : size}
              color={color}
            />
          ),
        }}
      />

      {/* Products */}
      <Tabs.Screen
        name="products/index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cube" : "cube-outline"}
              size={focused ? size + 4 : size}
              color={color}
            />
          ),
        }}
      />

      {/* Dashboard */}
      <Tabs.Screen
        name="dashboard/index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              size={focused ? size + 4 : size}
              color={color}
            />
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={focused ? size + 4 : size}
              color={color}
            />
          ),
        }}
      />

    </Tabs>
  );
}
