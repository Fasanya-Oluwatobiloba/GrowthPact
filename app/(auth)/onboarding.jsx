// app/(auth)/onboarding.jsx
import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { updateUserDoc } from "../../lib/firestore";
import { auth } from "../../lib/firebase";
import { C, F, R, rs, vs, fs } from "../../constants/theme";

const AREAS = [
  { id:"bible",     emoji:"📖", label:"Bible Study",   color:C.primary, bg:"rgba(83,74,183,0.25)",  border:C.primary,  text:C.muted },
  { id:"mental",    emoji:"🧠", label:"Mental Growth", color:C.green,   bg:"rgba(29,158,117,0.18)", border:C.green,    text:C.greenMint },
  { id:"character", emoji:"🪞", label:"Character",     color:C.pink,    bg:"rgba(212,83,126,0.18)", border:C.pink,     text:"#F4C0D1" },
  { id:"book",      emoji:"📚", label:"Book Reading",  color:C.amber,   bg:"rgba(239,159,39,0.18)", border:C.amber,    text:C.amberGold },
  { id:"finance",   emoji:"💰", label:"Finances",      color:C.amber,   bg:"rgba(239,159,39,0.18)", border:C.amber,    text:C.amberGold },
  { id:"academic",  emoji:"🎓", label:"Academic",      color:C.blue,    bg:"rgba(55,138,221,0.18)", border:C.blue,     text:"#B5D4F4" },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState([]);
  const [loading,  setLoading]  = useState(false);

  const toggle = (id) =>
    setSelected(p => p.includes(id) ? p.filter(i => i!==id) : [...p, id]);

  const handleContinue = async () => {
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid;
      if (uid) await updateUserDoc(uid, { areas: selected });
    } catch {}
    router.replace("/(tabs)/home");
    setLoading(false);
  };

  return (
    <View style={{ flex:1, backgroundColor:C.dark }}>
      {/* Progress */}
      <View style={{ flexDirection:"row", gap:rs(5), margin:rs(24), marginTop:vs(52) }}>
        {[1,1,0,0].map((f,i) => (
          <View key={i} style={{ flex:1, height:3, borderRadius:R.full, backgroundColor: f ? C.primary : "rgba(255,255,255,0.12)" }} />
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding:rs(24), paddingTop:0 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontFamily:F.bold, fontSize:fs(22), color:C.white, marginBottom:vs(6) }}>
          What areas do you want{"\n"}to grow in?
        </Text>
        <Text style={{ fontFamily:F.regular, fontSize:fs(13), color:C.muted, marginBottom:vs(24) }}>
          Select all that apply — you can always adjust later.
        </Text>

        <View style={{ flexDirection:"row", flexWrap:"wrap", gap:rs(10) }}>
          {AREAS.map(a => {
            const on = selected.includes(a.id);
            return (
              <TouchableOpacity
                key={a.id}
                onPress={() => toggle(a.id)}
                style={{ width:"47%", backgroundColor: on ? a.bg : "rgba(255,255,255,0.04)", borderWidth: on ? 2 : 1, borderColor: on ? a.border : "rgba(255,255,255,0.12)", borderRadius:R.lg, padding:rs(16), alignItems:"center" }}
              >
                <Text style={{ fontSize:fs(26), marginBottom:vs(6) }}>{a.emoji}</Text>
                <Text style={{ fontFamily:F.semibold, fontSize:fs(12), color: on ? a.text : C.muted }}>{a.label}</Text>
                <View style={{ width:rs(18), height:rs(18), borderRadius:R.full, marginTop:vs(8), backgroundColor: on ? a.color : "transparent", borderWidth: on ? 0 : 1.5, borderColor:"rgba(255,255,255,0.2)", alignItems:"center", justifyContent:"center" }}>
                  {on && <Text style={{ color:"#fff", fontSize:fs(11) }}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={handleContinue}
          disabled={loading}
          style={{ backgroundColor:C.primary, borderRadius:R.lg, paddingVertical:vs(16), alignItems:"center", marginTop:vs(28) }}
        >
          <Text style={{ fontFamily:F.bold, fontSize:fs(15), color:C.white }}>
            {selected.length === 0 ? "Skip for now" : `Continue — ${selected.length} selected`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
