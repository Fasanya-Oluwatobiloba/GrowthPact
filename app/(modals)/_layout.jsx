// app/(modals)/_layout.jsx
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, F, fs, rs } from "../../constants/theme";

export default function ModalsLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: C.text,
        headerTitleStyle: { fontFamily: F.bold, fontSize: fs(16) },
        headerShadowVisible: false,
        // Removed presentation: "modal" here since the root stack handles the transition
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ paddingRight: rs(12), paddingLeft: rs(4), justifyContent: "center" }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={fs(22)} color={C.text} />
          </TouchableOpacity>
        ),
      }}
    />
  );
}