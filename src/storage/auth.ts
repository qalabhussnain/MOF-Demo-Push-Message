import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = '@mofdemo_auth';

export type SavedAuth = {
  email: string;
  password?: string;
  userId: number;
  deviceUuid: string;
};

export async function saveAuth(data: SavedAuth) {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
}

export async function getSavedAuth(): Promise<SavedAuth | null> {
  const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as SavedAuth;
  } catch {
    return null;
  }
}

export async function clearSavedAuth() {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}

