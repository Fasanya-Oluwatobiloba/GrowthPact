// app/(auth)/splash.jsx
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { C, F, R, rs, vs, fs } from "../../constants/theme";

const PILLS = [
  { label: "📖 Bible Study",    bg: "rgba(83,74,183,0.22)",   color: C.muted },
  { label: "🧠 Mental Growth",  bg: "rgba(29,158,117,0.18)",  color: C.greenMint },
  { label: "🪞 Character",      bg: "rgba(212,83,126,0.18)",  color: "#F4C0D1" },
  { label: "💰 Finances",       bg: "rgba(239,159,39,0.18)",  color: C.amberGold },
  { label: "🎓 Academic",       bg: "rgba(55,138,221,0.18)",  color: "#B5D4F4" },
  { label: "👥 Community",      bg: "rgba(175,169,236,0.12)", color: C.muted },
];

export default function SplashScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: C.dark }}>
      {/* Orbs */}
      <View style={{ position:"absolute", width:rs(260), height:rs(260), borderRadius:rs(130), backgroundColor:C.primary, opacity:0.10, top:-rs(80), right:-rs(80) }} />
      <View style={{ position:"absolute", width:rs(180), height:rs(180), borderRadius:rs(90), backgroundColor:C.green, opacity:0.08, bottom:rs(30), left:-rs(50) }} />

      <ScrollView contentContainerStyle={{ flexGrow:1, alignItems:"center", justifyContent:"center", padding:rs(28) }} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={{ width:rs(76), height:rs(76), borderRadius:R.xl, backgroundColor:C.primary, alignItems:"center", justifyContent:"center", marginBottom:vs(20) }}>
          <Text style={{ fontSize:fs(38) }}>🌱</Text>
        </View>

        <Text style={{ fontFamily:F.bold, fontSize:fs(34), color:C.white, letterSpacing:-1, marginBottom:vs(8) }}>
          Growth<Text style={{ color:C.greenMint }}>Pact</Text>
        </Text>
        <Text style={{ fontFamily:F.regular, fontSize:fs(14), color:C.muted, lineHeight:vs(22), textAlign:"center", marginBottom:vs(40) }}>
          Your faith-led accountability companion.{"\n"}Grow intentionally in every area of life.
        </Text>

        {/* Pills */}
        <View style={{ flexDirection:"row", flexWrap:"wrap", gap:rs(8), justifyContent:"center", marginBottom:vs(44) }}>
          {PILLS.map(p => (
            <View key={p.label} style={{ backgroundColor:p.bg, borderRadius:R.full, paddingVertical:vs(6), paddingHorizontal:rs(14), borderWidth:1, borderColor:p.color+"44" }}>
              <Text style={{ fontFamily:F.medium, fontSize:fs(11), color:p.color }}>{p.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup")}
          style={{ width:"100%", backgroundColor:C.primary, borderRadius:R.lg, paddingVertical:vs(16), alignItems:"center", marginBottom:vs(12) }}
        >
          <Text style={{ fontFamily:F.bold, fontSize:fs(15), color:C.white }}>Begin your journey</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          style={{ width:"100%", borderRadius:R.lg, paddingVertical:vs(15), alignItems:"center", borderWidth:1, borderColor:"rgba(255,255,255,0.2)" }}
        >
          <Text style={{ fontFamily:F.semibold, fontSize:fs(14), color:C.white }}>I already have an account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
