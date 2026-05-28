// app/index.jsx
import { useEffect, useRef } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter, useRootNavigationState } from "expo-router"; // 1. Import this
import { useAuth } from "../hooks/useAuth";
import { C, F, fs } from "../constants/theme";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState(); // 2. Initialize the state hook
  const redirected = useRef(false);

  useEffect(() => {
    // 3. Guard: If the navigation tree isn't ready yet, wait and do nothing
    if (!rootNavigationState?.key) return;

    // Timeout safety — if Firebase takes >5s, go to splash anyway
    const timeout = setTimeout(() => {
      if (!redirected.current) {
        redirected.current = true;
        router.replace("/(auth)/splash");
      }
    }, 5000);

    if (!loading) {
      clearTimeout(timeout);
      if (!redirected.current) {
        redirected.current = true;
        if (user) {
          router.replace("/(tabs)/home");
        } else {
          router.replace("/(auth)/splash");
        }
      }
    }

    return () => clearTimeout(timeout);
  }, [user, loading, rootNavigationState]); // 4. Add to dependency array

  return (
    <View style={{ flex: 1, backgroundColor: C.dark, alignItems: "center", justifyContent: "center", gap: 16 }}>
      <Text style={{ fontSize: 48 }}>🌱</Text>
      <ActivityIndicator color={C.primary} size="large" />
      <Text style={{ fontFamily: F.regular, fontSize: fs(13), color: C.muted, marginTop: 8 }}>
        Loading GrowthPact...
      </Text>
    </View>
  );
}