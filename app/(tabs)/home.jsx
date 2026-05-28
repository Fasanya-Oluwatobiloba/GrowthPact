// app/(tabs)/home.jsx
import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, Alert, TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { subscribeTodayTasks, addTask, toggleTask, deleteTask, subscribeUser } from "../../lib/firestore";
import { C, F, R, rs, vs, fs } from "../../constants/theme";
import { Tag, ProgressBar, Sheet, Btn } from "../../components/UI";
import { useTheme } from "../../context/ThemeContext"; // Connected to global context

const TASK_CATEGORIES = [
  { id: "bible",    label: "Bible",    bg: C.primaryLight, color: C.primaryDark },
  { id: "academic", label: "Academic", bg: C.greenLight,   color: "#085041" },
  { id: "finance",  label: "Finance",  bg: C.amberLight,   color: "#633806" },
  { id: "mental",   label: "Mental",   bg: C.pinkLight,    color: "#72243E" },
  { id: "goals",    label: "Goals",    bg: C.blueLight,    color: C.blue },
  { id: "other",    label: "Other",    bg: C.surface,      color: C.textSub },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const theme = useTheme(); 
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [userData, setUserData] = useState(profile);
  const [refreshing, setRefreshing] = useState(false);
  const [addSheet, setAddSheet] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [newCat, setNewCat] = useState("other");

  const firstName = (userData?.name || user?.displayName || "Friend").split(" ")[0];
  const streak = userData?.streak || 0;
  const hour = new Date().getHours();
  
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greetingIcon = hour < 12 ? "sunny" : hour < 17 ? "partly-sunny" : "moon";

  const todayIndex = new Date().getDay();
  const verseOfDay = [
    '"I can do all things through Christ who strengthens me." — Phil 4:13',
    '"For I know the plans I have for you, declares the Lord." — Jer 29:11',
    '"Trust in the Lord with all your heart." — Prov 3:5',
    '"Be strong and courageous." — Josh 1:9',
    '"The Lord is my shepherd, I lack nothing." — Ps 23:1',
    '"Delight yourself in the Lord." — Ps 37:4',
    '"Cast all your anxiety on Him." — 1 Pet 5:7',
  ][todayIndex];

  useEffect(() => {
    if (!user) return;
    const unsub1 = subscribeTodayTasks(setTasks);
    const unsub2 = subscribeUser(user.uid, d => { if (d) setUserData(d); });
    return () => { unsub1(); unsub2(); };
  }, [user]);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    await addTask(newTask.trim(), newCat);
    setNewTask(""); setNewCat("other"); setAddSheet(false);
  };

  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { label: DAYS[d.getDay()], isToday: i === 6 };
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: rs(16), paddingBottom: vs(24) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} tintColor={C.primary} />}
      >
        {/* Header Block */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: vs(16) }}>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: rs(6) }}>
              <Text style={{ fontFamily: F.bold, fontSize: fs(20), color: theme.text }}>
                {greeting}, <Text style={{ color: C.primary }}>{firstName}</Text>
              </Text>
              <Ionicons name={greetingIcon} size={fs(20)} color={C.amberGold} />
            </View>
            <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: theme.textSub, marginTop: vs(2) }}>
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push("/(tabs)/profile")} 
            style={{ width: rs(42), height: rs(42), borderRadius: rs(21), backgroundColor: theme.darkMode ? "#1F1D2B" : C.primaryLight, alignItems: "center", justifyContent: "center", borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}
          >
            <Text style={{ fontFamily: F.bold, fontSize: fs(15), color: C.primary }}>
              {firstName.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Streak + Week Tracker Summary Surface */}
        <View style={{ backgroundColor: theme.darkMode ? "#1F1D2B" : C.dark, borderRadius: R.xl, padding: rs(16), marginBottom: vs(16), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View>
              <Text style={{ fontFamily: F.regular, fontSize: fs(11), color: theme.darkMode ? theme.textSub : C.muted, marginBottom: vs(2) }}>Current streak</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: rs(6) }}>
                <Text style={{ fontFamily: F.bold, fontSize: fs(38), color: C.amberGold, lineHeight: vs(44) }}>{streak}</Text>
                <MaterialCommunityIcons name="fire" size={fs(28)} color={C.amberGold} />
              </View>
              <Text style={{ fontFamily: F.medium, fontSize: fs(11), color: C.greenMint, marginTop: vs(2) }}>days consistent</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontFamily: F.regular, fontSize: fs(10), color: theme.darkMode ? theme.textSub : C.muted, marginBottom: vs(6) }}>This week</Text>
              <View style={{ flexDirection: "row", gap: rs(5) }}>
                {weekDays.map((d, i) => (
                  <View key={i} style={{ alignItems: "center", gap: vs(4) }}>
                    <View style={{ width: rs(14), height: rs(14), borderRadius: R.sm, backgroundColor: d.isToday ? C.green : i < 4 ? C.primary : (theme.darkMode ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.15)") }} />
                    <Text style={{ fontFamily: F.regular, fontSize: fs(9), color: theme.darkMode ? theme.textSub : C.muted }}>{d.label[0]}</Text>
                  </View>
                ))}
              </View>
              <View style={{ marginTop: vs(10), backgroundColor: C.green, borderRadius: R.sm, paddingVertical: vs(3), paddingHorizontal: rs(8), flexDirection: "row", alignItems: "center", gap: rs(4) }}>
                <FontAwesome5 name="leaf" size={fs(9)} color="#fff" />
                <Text style={{ fontFamily: F.bold, fontSize: fs(10), color: C.white }}>Lvl {userData?.level || 1} · Rooted</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Verse of the day Content Layout */}
        <View style={{ backgroundColor: theme.darkMode ? "#1F1D2B" : C.primaryLight, borderRadius: R.lg, padding: rs(14), marginBottom: vs(16), flexDirection: "row", gap: rs(12), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
          <Ionicons name="book" size={fs(20)} color={C.primary} style={{ marginTop: vs(2) }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.semibold, fontSize: fs(10), color: C.primary, marginBottom: vs(4), letterSpacing: 0.5 }}>VERSE OF THE DAY</Text>
            <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: theme.text, lineHeight: vs(18), fontStyle: "italic" }}>{verseOfDay}</Text>
          </View>
        </View>

        {/* Today's Focus Dynamic Section Title */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: vs(4), marginBottom: vs(12) }}>
          <Text style={{ fontFamily: F.bold, fontSize: fs(16), color: theme.text }}>Today's focus</Text>
          <TouchableOpacity onPress={() => setAddSheet(true)}>
            <Text style={{ fontFamily: F.semibold, fontSize: fs(13), color: C.primary }}>+ Add task</Text>
          </TouchableOpacity>
        </View>

        {/* Progress summary bar */}
        {total > 0 && (
          <View style={{ marginBottom: vs(12) }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: vs(4) }}>
              <Text style={{ fontFamily: F.medium, fontSize: fs(12), color: theme.textSub }}>{done} of {total} done</Text>
              <Text style={{ fontFamily: F.semibold, fontSize: fs(12), color: C.primary }}>{pct}%</Text>
            </View>
            <ProgressBar pct={pct} color={C.primary} bg={theme.darkMode ? "rgba(255,255,255,0.05)" : C.primaryLight} height={vs(5)} />
          </View>
        )}

        {/* Tasks List Logic Wrapper */}
        {tasks.length === 0 ? (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: vs(28), paddingHorizontal: rs(16) }}>
            <View style={{ width: rs(44), height: rs(44), borderRadius: R.full, backgroundColor: theme.darkMode ? "#1F1D2B" : C.surface, alignItems: "center", justifyContent: "center", marginBottom: vs(10), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
              <Ionicons name="clipboard-outline" size={fs(20)} color={theme.textSub} />
            </View>
            <Text style={{ fontFamily: F.bold, fontSize: fs(15), color: theme.text, marginBottom: vs(4) }}>No tasks yet</Text>
            <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: theme.textSub, textAlign: "center", marginBottom: vs(14), paddingHorizontal: rs(20) }}>
              Add tasks to track what you want to accomplish today.
            </Text>
            <TouchableOpacity onPress={() => setAddSheet(true)} style={{ backgroundColor: C.primary, paddingVertical: vs(8), paddingHorizontal: rs(16), borderRadius: R.md }}>
              <Text style={{ fontFamily: F.semibold, fontSize: fs(12), color: "#fff" }}>Add first task</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: vs(8), marginBottom: vs(16) }}>
            {tasks.map(task => {
              const cat = TASK_CATEGORIES.find(c => c.id === task.category) || TASK_CATEGORIES[5];
              return (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => toggleTask(task.id, task.done)}
                  onLongPress={() => Alert.alert("Delete task?", "", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => deleteTask(task.id) }
                  ])}
                  style={{ flexDirection: "row", alignItems: "center", gap: rs(10), backgroundColor: theme.card, borderRadius: R.md, padding: rs(12), borderWidth: 1, borderColor: theme.border }}
                >
                  <Ionicons 
                    name={task.done ? "checkmark-circle" : "ellipse-outline"} 
                    size={fs(20)} 
                    color={task.done ? C.primary : (theme.darkMode ? "#4E4B66" : "#C0BDD4")} 
                  />
                  <Text style={{ fontFamily: F.regular, fontSize: fs(13), color: task.done ? theme.textSub : theme.text, flex: 1, textDecorationLine: task.done ? "line-through" : "none" }}>
                    {task.label}
                  </Text>
                  <Tag label={cat.label} bg={theme.darkMode ? "#1F1D2B" : cat.bg} color={theme.darkMode ? theme.textSub : cat.color} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Growth Areas Core Headers */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: vs(12), marginBottom: vs(12) }}>
          <Text style={{ fontFamily: F.bold, fontSize: fs(16), color: theme.text }}>Growth areas</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/progress")}>
            <Text style={{ fontFamily: F.semibold, fontSize: fs(13), color: C.primary }}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Growth Grid Items */}
        <View style={{ flexDirection: "row", gap: rs(8), marginBottom: vs(8) }}>
          {[
            { icon: "book", label: "Bible", color: C.primary, bg: C.primaryLight, journal: "bible", provider: Ionicons },
            { icon: "graduation-cap", label: "Academic", color: C.green, bg: C.greenLight, journal: "academic", provider: FontAwesome5 },
          ].map(a => (
            <TouchableOpacity key={a.label} onPress={() => router.push(`/(journals)/${a.journal}`)} style={{ flex: 1, backgroundColor: theme.darkMode ? "#1F1D2B" : a.bg, borderRadius: R.lg, padding: rs(12), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
              <a.provider name={a.icon} size={fs(20)} color={a.color} style={{ marginBottom: vs(6) }} />
              <Text style={{ fontFamily: F.medium, fontSize: fs(11), color: theme.darkMode ? theme.text : a.color }}>{a.label}</Text>
              <Text style={{ fontFamily: F.bold, fontSize: fs(20), color: theme.textSub, marginVertical: vs(2) }}>—</Text>
              <ProgressBar pct={0} color={a.color} bg={theme.darkMode ? "rgba(255,255,255,0.05)" : a.color + "33"} height={vs(4)} />
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: rs(8) }}>
          {[
            { icon: "wallet", label: "Finance", color: C.amber, bg: C.amberLight, journal: "finance", provider: Ionicons },
            { icon: "brain", label: "Mental", color: C.pink, bg: C.pinkLight, journal: "mental", provider: FontAwesome5 },
          ].map(a => (
            <TouchableOpacity key={a.label} onPress={() => router.push(`/(journals)/${a.journal}`)} style={{ flex: 1, backgroundColor: theme.darkMode ? "#1F1D2B" : a.bg, borderRadius: R.lg, padding: rs(12), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
              <a.provider name={a.icon} size={fs(20)} color={a.color} style={{ marginBottom: vs(6) }} />
              <Text style={{ fontFamily: F.medium, fontSize: fs(11), color: theme.darkMode ? theme.text : a.color }}>{a.label}</Text>
              <Text style={{ fontFamily: F.bold, fontSize: fs(20), color: theme.textSub, marginVertical: vs(2) }}>—</Text>
              <ProgressBar pct={0} color={a.color} bg={theme.darkMode ? "rgba(255,255,255,0.05)" : a.color + "33"} height={vs(4)} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Add Task Control Modal Sheet */}
      <Sheet visible={addSheet} onClose={() => setAddSheet(false)} title="Add today's task" style={{ backgroundColor: theme.sheetBg }}>
        <TextInput
          value={newTask}
          onChangeText={setNewTask}
          placeholder="What do you want to accomplish today?"
          placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
          autoFocus
          style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(13), fontSize: fs(14), color: theme.text, fontFamily: F.regular, marginBottom: vs(12) }}
        />
        <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(8), letterSpacing: 0.5 }}>CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: vs(16) }}>
          <View style={{ flexDirection: "row", gap: rs(8) }}>
            {TASK_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setNewCat(cat.id)}
                style={{ backgroundColor: newCat === cat.id ? (theme.darkMode ? C.primary : cat.bg) : theme.inputBg, borderRadius: R.full, paddingVertical: vs(7), paddingHorizontal: rs(14), borderWidth: 1, borderColor: newCat === cat.id ? (theme.darkMode ? C.primary : cat.color) : theme.border }}
              >
                <Text style={{ fontFamily: F.semibold, fontSize: fs(12), color: newCat === cat.id ? (theme.darkMode ? "#fff" : cat.color) : theme.textSub }}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <Btn label="Add task" onPress={handleAddTask} />
      </Sheet>
    </SafeAreaView>
  );
}