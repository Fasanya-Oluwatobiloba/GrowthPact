// app/(tabs)/journals.jsx
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { C, F, R, rs, vs, fs } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";

const JOURNALS = [
  {
    id: "bible", icon: "book", provider: Ionicons, label: "Bible Study Journal",
    sub: "Study scripture · AI verse visuals · Share insights",
    bg: C.dark, darkBg: "#1A1926", labelColor: "#fff", subColor: C.muted, accent: C.primary,
  },
  {
    id: "mental", icon: "brain", provider: FontAwesome5, label: "Mental Growth Journal",
    sub: "Daily mood · Thought patterns · Wellbeing tracker",
    bg: C.greenLight, darkBg: "#1D2D24", labelColor: "#085041", subColor: "#0F6E56", accent: C.green,
  },
  {
    id: "character", icon: "fingerprint", provider: MaterialCommunityIcons, label: "Character & Identity",
    sub: "Who God says you are · Strengths · Growth areas",
    bg: C.pinkLight, darkBg: "#331C24", labelColor: "#72243E", subColor: "#993556", accent: C.pink,
  },
  {
    id: "book", icon: "book-open", provider: FontAwesome5, label: "Book Reading Journal",
    sub: "Chapter tracker · Key takeaways · Lessons learned",
    bg: C.amberLight, darkBg: "#2D2216", labelColor: "#633806", subColor: "#854F0B", accent: C.amber,
  },
  {
    id: "finance", icon: "wallet", provider: Ionicons, label: "Finance Tracker",
    sub: "Savings goals · Expenses · Monthly breakdown",
    bg: "#FFF9EE", darkBg: "#2D261A", labelColor: "#633806", subColor: "#854F0B", accent: C.amber,
  },
  {
    id: "sandbox", icon: "create", provider: Ionicons, label: "Personal Sandbox",
    sub: "Free writing · Brainstorm · Voice notes · Sketches",
    bg: C.sand, darkBg: "#242422", labelColor: C.sandDark, subColor: "#5F5E5A", accent: "#888780",
  },
];

export default function JournalsScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: rs(16), paddingBottom: vs(24) }}>
        <Text style={{ fontFamily: F.bold, fontSize: fs(22), color: theme.text, marginBottom: vs(4) }}>
          My Journals
        </Text>
        <Text style={{ fontFamily: F.regular, fontSize: fs(13), color: theme.textSub, marginBottom: vs(20) }}>
          Your sacred spaces for growth
        </Text>

        <View style={{ gap: vs(10) }}>
          {JOURNALS.map((j) => {
            const Icon = j.provider;
            const containerBg = theme.darkMode ? j.darkBg : j.bg;
            const dynamicTxt = theme.darkMode ? "#E4E2F0" : j.labelColor;
            const dynamicSub = theme.darkMode ? "#A3A0BC" : j.subColor;

            return (
              <TouchableOpacity
                key={j.id}
                onPress={() => router.push(`/(journals)/${j.id}`)}
                activeOpacity={0.82}
                style={{ 
                  backgroundColor: containerBg, 
                  borderRadius: R.xl, 
                  padding: rs(16), 
                  flexDirection: "row", 
                  alignItems: "center", 
                  gap: rs(14),
                  borderWidth: theme.darkMode ? 1 : 0,
                  borderColor: theme.border
                }}
              >
                <View style={{ width: rs(46), height: rs(46), borderRadius: R.lg, backgroundColor: j.accent + "25", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={j.icon} size={fs(22)} color={j.id === "bible" && !theme.darkMode ? "#fff" : j.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: F.bold, fontSize: fs(14), color: dynamicTxt, marginBottom: vs(3) }}>
                    {j.label}
                  </Text>
                  <Text style={{ fontFamily: F.regular, fontSize: fs(11), color: dynamicSub, lineHeight: vs(16) }}>
                    {j.sub}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={fs(16)} color={dynamicTxt + "88"} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}