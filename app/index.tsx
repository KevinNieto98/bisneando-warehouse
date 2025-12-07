// app/index.tsx
import { Redirect } from "expo-router";

export default function Index() {
  const isLoggedIn = false; // aquí va tu estado real (Zustand, Supabase, AsyncStorage, etc.)

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/dashboard" />;
}
