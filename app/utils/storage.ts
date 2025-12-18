// app/utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  BANK_STATUS: "bank_status", // "pending" | "completed"
};

// Helpers
export async function setBankStatusCompleted() {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.BANK_STATUS, "completed");
  } catch (e) {
    console.warn("setBankStatusCompleted error", e);
  }
}

export async function setBankStatusPending() {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.BANK_STATUS, "pending");
  } catch (e) {
    console.warn("setBankStatusPending error", e);
  }
}

export async function getBankStatus(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.BANK_STATUS);
  } catch (e) {
    console.warn("getBankStatus error", e);
    return null;
  }
}

export async function clearBankStatus() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.BANK_STATUS);
  } catch (e) {
    console.warn("clearBankStatus error", e);
  }
}
