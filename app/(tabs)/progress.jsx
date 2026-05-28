// app/(tabs)/progress.jsx
import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { subscribeGoals, addGoal, updateGoal, deleteGoal } from "../../lib/firestore";
import { useAuth } from "../../hooks/useAuth";
import { C, F, R, rs, vs, fs } from "../../constants/theme";
import { ProgressBar, Sheet, Btn, Tag } from "../../components/UI";
import { useTheme } from "../../context/ThemeContext"; // Connected to global context

const CATS = ["All", "Spiritual", "Academic", "Finance", "Mental", "Relationship", "Other"];
const CAT_COLORS = {
  Spiritual:    { color: C.primary, bg: C.primaryLight },
  Academic:     { color: C.green,   bg: C.greenLight },
  Finance:      { color: C.amber,   bg: C.amberLight },
  Mental:       { color: C.pink,    bg: C.pinkLight },
  Relationship: { color: C.blue,    bg: C.blueLight },
  Other:        { color: C.textSub, bg: C.surface },
};

export default function ProgressScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [goals, setGoals] = useState([]);
  const [filter, setFilter] = useState("All");
  const [sheet, setSheet] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("Spiritual");
  const [target, setTarget] = useState("30");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeGoals(setGoals);
  }, [user]);

  const filtered = filter === "All" ? goals : goals.filter(g => g.category === filter);

  const handleAdd = async () => {
    if (!title.trim()) return;
    setLoading(true);
    await addGoal({ title: title.trim(), description: desc.trim(), category, target: parseInt(target) || 30, progress: 0, unit: "days" });
    setTitle(""); setDesc(""); setCategory("Spiritual"); setTarget("30");
    setSheet(false); setLoading(false);
  };

  const handleProgress = async (goal) => {
    const newPct = Math.min((goal.progress || 0) + 10, 100);
    await updateGoal(goal.id, { progress: newPct });
  };

  const handleDelete = (id) => {
    Alert.alert("Delete goal?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteGoal(id) },
    ]);
  };

  const statusLabel = (pct) => {
    if (pct >= 100) return { label: "Completed", bg: theme.darkMode ? "#143A2E" : "#E1F5EE", color: theme.darkMode ? C.greenMint : "#085041" };
    if (pct >= 70)  return { label: "On track",    bg: theme.darkMode ? "#143A2E" : C.greenLight, color: theme.darkMode ? C.greenMint : "#085041" };
    if (pct >= 40)  return { label: "In progress", bg: theme.darkMode ? "#3A2A14" : C.amberLight, color: theme.darkMode ? C.amberGold : "#633806" };
    return { label: "Just started", bg: theme.darkMode ? "#2C1E21" : C.primaryLight, color: theme.darkMode ? C.primaryLight : C.primaryDark };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: rs(16), paddingBottom: vs(24) }}>
        
        {/* Dynamic Section Header Framework */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: vs(4), marginBottom: vs(14) }}>
          <Text style={{ fontFamily: F.bold, fontSize: fs(18), color: theme.text }}>My Goals</Text>
          <TouchableOpacity onPress={() => setSheet(true)}>
            <Text style={{ fontFamily: F.semibold, fontSize: fs(13), color: C.primary }}>+ New goal</Text>
          </TouchableOpacity>
        </View>

        {/* Category filter slide row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: vs(14) }}>
          <View style={{ flexDirection: "row", gap: rs(7) }}>
            {CATS.map(c => (
              <TouchableOpacity key={c} onPress={() => setFilter(c)}
                style={{ backgroundColor: filter === c ? (theme.darkMode ? C.primary : C.dark) : theme.card, borderRadius: R.full, paddingVertical: vs(6), paddingHorizontal: rs(14), borderWidth: 1, borderColor: filter === c ? "transparent" : theme.border }}
              >
                <Text style={{ fontFamily: F.semibold, fontSize: fs(12), color: filter === c ? "#fff" : theme.textSub }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Goals Collection Display View */}
        {filtered.length === 0 ? (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: vs(40), paddingHorizontal: rs(16) }}>
            <View style={{ width: rs(48), height: rs(48), borderRadius: R.full, backgroundColor: theme.darkMode ? "#1F1D2B" : C.surface, alignItems: "center", justifyContent: "center", marginBottom: vs(12), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
              <Ionicons name="trophy-outline" size={fs(22)} color={theme.textSub} />
            </View>
            <Text style={{ fontFamily: F.bold, fontSize: fs(16), color: theme.text, marginBottom: vs(4) }}>No goals yet</Text>
            <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: theme.textSub, textAlign: "center", marginBottom: vs(16), paddingHorizontal: rs(20) }}>
              Set a goal for any area of your life and track your daily progress.
            </Text>
            <TouchableOpacity onPress={() => setSheet(true)} style={{ backgroundColor: C.primary, paddingVertical: vs(8), paddingHorizontal: rs(16), borderRadius: R.md }}>
              <Text style={{ fontFamily: F.semibold, fontSize: fs(12), color: "#fff" }}>Add first goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: vs(10) }}>
            {filtered.map(goal => {
              const pct = goal.progress || 0;
              const status = statusLabel(pct);
              const cc = CAT_COLORS[goal.category] || CAT_COLORS.Other;
              return (
                <View key={goal.id} style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: R.lg, padding: rs(14), borderLeftWidth: 4, borderLeftColor: cc.color }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: vs(4) }}>
                    <Text style={{ fontFamily: F.bold, fontSize: fs(14), color: theme.text, flex: 1, marginRight: rs(8) }}>{goal.title}</Text>
                    <View style={{ backgroundColor: status.bg, borderRadius: R.full, paddingVertical: vs(3), paddingHorizontal: rs(9), flexDirection: "row", alignItems: "center", gap: rs(3) }}>
                      {pct >= 100 && <Ionicons name="checkmark-circle" size={fs(11)} color={status.color} />}
                      <Text style={{ fontFamily: F.semibold, fontSize: fs(10), color: status.color }}>{status.label}</Text>
                    </View>
                  </View>
                  {goal.description ? (
                    <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: theme.textSub, marginBottom: vs(8), lineHeight: vs(18) }}>{goal.description}</Text>
                  ) : null}
                  <Tag label={goal.category} bg={theme.darkMode ? "#1F1D2B" : cc.bg} color={theme.darkMode ? theme.textSub : cc.color} />
                  <View style={{ marginTop: vs(10), marginBottom: vs(4) }}>
                    <ProgressBar pct={pct} color={cc.color} bg={theme.darkMode ? "rgba(255,255,255,0.05)" : cc.bg} height={vs(7)} />
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontFamily: F.regular, fontSize: fs(11), color: theme.textSub }}>{pct}% complete</Text>
                    <View style={{ flexDirection: "row", gap: rs(8) }}>
                      <TouchableOpacity onPress={() => handleProgress(goal)}
                        style={{ backgroundColor: cc.color, borderRadius: R.sm, paddingVertical: vs(5), paddingHorizontal: rs(12) }}
                      >
                        <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: "#fff" }}>+10%</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(goal.id)}
                        style={{ backgroundColor: theme.darkMode ? "#2C141A" : C.redLight, borderRadius: R.sm, paddingVertical: vs(5), paddingHorizontal: rs(10), borderWidth: theme.darkMode ? 1 : 0, borderColor: "#5C1D24" }}
                      >
                        <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: C.red }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Target Sheet Interaction Module */}
      <Sheet visible={sheet} onClose={() => setSheet(false)} title="New Goal" style={{ backgroundColor: theme.sheetBg }}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Goal title" placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
          style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(13), fontSize: fs(14), color: theme.text, fontFamily: F.regular, marginBottom: vs(10) }}
        />
        <TextInput value={desc} onChangeText={setDesc} placeholder="Description (optional)" placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"} multiline
          style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(13), fontSize: fs(13), color: theme.text, fontFamily: F.regular, minHeight: vs(60), marginBottom: vs(10), textAlignVertical: "top" }}
        />
        <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(8), letterSpacing: 0.5 }}>CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: vs(14) }}>
          <View style={{ flexDirection: "row", gap: rs(7) }}>
            {CATS.filter(c => c !== "All").map(c => {
              const cc = CAT_COLORS[c];
              return (
                <TouchableOpacity key={c} onPress={() => setCategory(c)}
                  style={{ backgroundColor: category === c ? (theme.darkMode ? C.primary : cc.bg) : theme.inputBg, borderRadius: R.full, paddingVertical: vs(6), paddingHorizontal: rs(13), borderWidth: 1, borderColor: category === c ? (theme.darkMode ? C.primary : cc.color) : theme.border }}
                >
                  <Text style={{ fontFamily: F.semibold, fontSize: fs(12), color: category === c ? (theme.darkMode ? "#fff" : cc.color) : theme.textSub }}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        <Btn label="Create goal" onPress={handleAdd} loading={loading} />
      </Sheet>
    </SafeAreaView>
  );
}