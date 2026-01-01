import { Stack } from "expo-router";
import { useEffect } from "react";
import { I18nManager } from "react-native";

export default function RootLayout() {
  // Force LTR layout even on RTL phones (Hebrew, Arabic, etc.)
  useEffect(() => {
    if (I18nManager.isRTL) {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
    }
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}