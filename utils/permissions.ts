
import * as Location from 'expo-location';

export async function requestLocation() {
  return Location.requestForegroundPermissionsAsync();
}

