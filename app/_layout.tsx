import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Módulos de permisos por feature
import * as Location from 'expo-location';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (!loaded) return;
    // Pide al iniciar (opcional). Recomendación: en producción pide solo cuando se necesite.
    (async () => {
      try {
        // Ubicación
        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus !== 'granted') {
    
        }

    

      } catch (e) {
        console.warn('Error solicitando permisos', e);
        Alert.alert('Permisos', 'No se pudieron solicitar algunos permisos.');
      }
    })();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider value={DefaultTheme}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="product" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ headerShown: false }} />
          <Stack.Screen name="success" options={{ headerShown: false }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen name="address" options={{ headerShown: false }} />
          <Stack.Screen name="new_address" options={{ headerShown: false }} />
          <Stack.Screen name="edit_profile" options={{ headerShown: false }} />
          <Stack.Screen name="orders" options={{ headerShown: false }} />
          <Stack.Screen name="set_address" options={{ headerShown: false }} />
          <Stack.Screen name="legal_information" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        {/* Evita duplicar StatusBar: ya tienes una arriba */}
        {/* <StatusBar style="auto" /> */}
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
