// app/(journals)/_layout.jsx
import { Stack } from "expo-router";
import { TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { C, F, fs } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";

export default function JournalsLayout() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle:     { backgroundColor: theme.bg },
        headerTintColor: theme.text,
        headerTitleStyle:{ fontFamily: F.bold, fontSize: fs(16), color: theme.text },
        headerShadowVisible: false,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 8, paddingLeft: 4 }}>
            <Text style={{ fontSize: fs(24), color: theme.text }}>←</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="bible"     options={{ title: "Bible Study Journal" }} />
      <Stack.Screen name="mental"    options={{ title: "Mental Growth Journal" }} />
      <Stack.Screen name="character" options={{ title: "Character & Identity" }} />
      <Stack.Screen name="book"      options={{ title: "Book Reading Journal" }} />
      <Stack.Screen name="finance"   options={{ title: "Finance Tracker" }} />
      <Stack.Screen name="sandbox"   options={{ title: "Personal Sandbox" }} />
    </Stack>
  );
}