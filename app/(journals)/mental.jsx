// app/(journals)/mental.jsx
import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { subscribeJournalEntries, addJournalEntry, deleteJournalEntry } from "../../lib/firestore";
import { useAuth } from "../../hooks/useAuth";
import { C, F, R, rs, vs, fs } from "../../constants/theme";
import { Btn, Empty, Sheet, SectionTitle, timeAgo } from "../../components/UI";
import { useTheme } from "../../context/ThemeContext";

const MOODS = [
  { emoji: "😔", label: "Low",    color: "#6B7CB8" },
  { emoji: "😐", label: "Okay",   color: C.textSub },
  { emoji: "😊", label: "Good",   color: C.green },
  { emoji: "🤩", label: "Great",  color: C.amber },
  { emoji: "😤", label: "Tense",  color: C.pink },
  { emoji: "😰", label: "Anxious",color: "#D4537E" },
  { emoji: "😌", label: "Peaceful",color: C.greenMint },
];

const THOUGHT_PATTERNS = [
  "Growth mindset", "Gratitude", "Anxious thoughts", "Overthinking",
  "Self-doubt", "Comparison", "Fear of failure", "Peace", "Confidence",
  "Forgiveness", "Trust in God", "Overwhelmed", "Hopeful",
];

function EntryCard({ entry, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const mood = MOODS.find(m => m.label === entry.mood) || MOODS[2];

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      onLongPress={() => Alert.alert("Delete entry?", "", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ])}
      style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: R.lg, padding: rs(14), marginBottom: vs(10) }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: vs(6) }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: rs(8) }}>
          <Text style={{ fontSize: fs(22) }}>{mood.emoji}</Text>
          <View>
            <Text style={{ fontFamily: F.bold, fontSize: fs(13), color: theme.text }}>{entry.mood || "Check-in"}</Text>
            <Text style={{ fontFamily: F.regular, fontSize: fs(11), color: theme.textSub }}>{timeAgo(entry.createdAt)}</Text>
          </View>
        </View>
        <Text style={{ fontFamily: F.regular, fontSize: fs(18), color: theme.textSub }}>{expanded ? "▲" : "▼"}</Text>
      </View>

      {entry.thoughts ? (
        <Text style={{ fontFamily: F.regular, fontSize: fs(13), color: theme.textSub, lineHeight: vs(19) }} numberOfLines={expanded ? undefined : 2}>
          {entry.thoughts}
        </Text>
      ) : null}

      {expanded && entry.patterns?.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: rs(6), marginTop: vs(10) }}>
          {entry.patterns.map(p => (
            <View key={p} style={{ backgroundColor: theme.darkMode ? "rgba(255,255,255,0.05)" : C.primaryLight, borderRadius: R.full, paddingVertical: vs(4), paddingHorizontal: rs(10), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
              <Text style={{ fontFamily: F.medium, fontSize: fs(11), color: theme.darkMode ? theme.textSub : C.primaryDark }}>{p}</Text>
            </View>
          ))}
        </View>
      )}

      {expanded && entry.gratitude ? (
        <View style={{ backgroundColor: theme.darkMode ? "rgba(255,255,255,0.05)" : C.greenLight, borderRadius: R.md, padding: rs(10), marginTop: vs(8), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
          <Text style={{ fontFamily: F.semibold, fontSize: fs(10), color: theme.darkMode ? C.greenMint : C.green, marginBottom: vs(3), letterSpacing: 0.5 }}>GRATITUDE</Text>
          <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: theme.darkMode ? theme.text : "#085041", lineHeight: vs(18) }}>{entry.gratitude}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function MentalJournalScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [entries,   setEntries]   = useState([]);
  const [newSheet,  setNewSheet]  = useState(false);
  const [mood,      setMood]      = useState("Good");
  const [thoughts,  setThoughts]  = useState("");
  const [patterns,  setPatterns]  = useState([]);
  const [gratitude, setGratitude] = useState("");
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeJournalEntries("mental", setEntries);
  }, [user]);

  const togglePattern = (p) =>
    setPatterns(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const handleSave = async () => {
    if (!thoughts.trim() && patterns.length === 0) {
      Alert.alert("Nothing to save", "Share your thoughts or select a thought pattern.");
      return;
    }
    setSaving(true);
    await addJournalEntry("mental", {
      mood,
      thoughts:  thoughts.trim(),
      patterns,
      gratitude: gratitude.trim(),
    });
    setMood("Good"); setThoughts(""); setPatterns([]); setGratitude("");
    setNewSheet(false); setSaving(false);
  };

  const last7 = entries.slice(0, 7).reverse();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ padding: rs(16), paddingBottom: vs(100) }} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={{ backgroundColor: theme.darkMode ? "#1F1D2B" : "#0D2A1E", borderRadius: R.xl, padding: rs(16), marginBottom: vs(16), flexDirection: "row", alignItems: "center", gap: rs(12), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
          <View style={{ width: rs(50), height: rs(50), borderRadius: R.lg, backgroundColor: C.green, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: fs(26) }}>🧠</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.bold, fontSize: fs(16), color: C.white }}>Mental Growth Journal</Text>
            <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: theme.darkMode ? C.greenMint : C.greenMint, marginTop: vs(2) }}>
              {entries.length} {entries.length === 1 ? "entry" : "entries"} recorded
            </Text>
          </View>
        </View>

        {/* Mood trend chart */}
        {last7.length > 0 && (
          <View style={{ backgroundColor: theme.darkMode ? "rgba(255,255,255,0.03)" : C.greenLight, borderRadius: R.lg, padding: rs(14), marginBottom: vs(16), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
            <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.darkMode ? theme.textSub : C.green, marginBottom: vs(10), letterSpacing: 0.5 }}>YOUR RECENT MOOD</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
              {last7.map((e, i) => {
                const m = MOODS.find(x => x.label === e.mood) || MOODS[2];
                return (
                  <View key={i} style={{ alignItems: "center", gap: vs(3) }}>
                    <Text style={{ fontSize: fs(18) }}>{m.emoji}</Text>
                    <Text style={{ fontFamily: F.regular, fontSize: fs(9), color: theme.darkMode ? theme.textSub : "#0F6E56" }}>
                      {e.createdAt?.toDate ? e.createdAt.toDate().toLocaleDateString("en-GB",{weekday:"short"}) : ""}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <SectionTitle title="All check-ins" action="+ New check-in" onAction={() => setNewSheet(true)} />

        {entries.length === 0 ? (
          <Empty
            emoji="💭"
            title="Start tracking your mind"
            sub="Daily check-ins help you notice patterns, process emotions, and grow in mental clarity."
            onAction={() => setNewSheet(true)}
            actionLabel="First check-in"
          />
        ) : (
          entries.map(e => (
            <EntryCard key={e.id} entry={e} onDelete={() => deleteJournalEntry(e.id)} />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setNewSheet(true)}
        style={{ position: "absolute", bottom: vs(24), right: rs(20), backgroundColor: C.green, borderRadius: R.full, width: rs(56), height: rs(56), alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: C.green, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
      >
        <Text style={{ fontSize: fs(26), color: "#fff" }}>+</Text>
      </TouchableOpacity>

      {/* New Entry Sheet */}
      <Sheet visible={newSheet} onClose={() => setNewSheet(false)} title="Mental Check-in" style={{ backgroundColor: theme.sheetBg }}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: vs(460) }}>
          <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(8), letterSpacing: 0.5 }}>HOW ARE YOU FEELING RIGHT NOW?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: vs(14) }}>
            <View style={{ flexDirection: "row", gap: rs(8) }}>
              {MOODS.map(m => (
                <TouchableOpacity
                  key={m.label}
                  onPress={() => setMood(m.label)}
                  style={{
                    backgroundColor: mood === m.label ? m.color + "22" : theme.inputBg,
                    borderWidth: mood === m.label ? 2 : 1,
                    borderColor: mood === m.label ? m.color : theme.border,
                    borderRadius: R.md,
                    padding: rs(10),
                    alignItems: "center",
                    minWidth: rs(62),
                  }}
                >
                  <Text style={{ fontSize: fs(22) }}>{m.emoji}</Text>
                  <Text style={{ fontFamily: F.medium, fontSize: fs(10), color: mood === m.label ? m.color : theme.textSub, marginTop: vs(3) }}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(5), letterSpacing: 0.5 }}>WHAT'S ON YOUR MIND?</Text>
          <TextInput
            value={thoughts}
            onChangeText={setThoughts}
            placeholder="Write freely — express everything you're feeling or thinking. This is your safe space."
            placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
            multiline
            style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(12), fontSize: fs(13), color: theme.text, fontFamily: F.regular, minHeight: vs(90), textAlignVertical: "top", marginBottom: vs(14), lineHeight: vs(20) }}
          />

          <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(8), letterSpacing: 0.5 }}>THOUGHT PATTERNS I'M NOTICING</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: rs(7), marginBottom: vs(14) }}>
            {THOUGHT_PATTERNS.map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => togglePattern(p)}
                style={{
                  backgroundColor: patterns.includes(p) ? (theme.darkMode ? "rgba(255,255,255,0.15)" : C.primaryLight) : theme.inputBg,
                  borderWidth: patterns.includes(p) ? 1.5 : 1,
                  borderColor: patterns.includes(p) ? C.primary : theme.border,
                  borderRadius: R.full,
                  paddingVertical: vs(6),
                  paddingHorizontal: rs(12),
                }}
              >
                <Text style={{ fontFamily: F.medium, fontSize: fs(12), color: patterns.includes(p) ? (theme.darkMode ? theme.text : C.primaryDark) : theme.textSub }}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(5), letterSpacing: 0.5 }}>ONE THING I'M GRATEFUL FOR</Text>
          <TextInput
            value={gratitude}
            onChangeText={setGratitude}
            placeholder="Gratitude shifts perspective..."
            placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
            style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(12), fontSize: fs(13), color: theme.text, fontFamily: F.regular, marginBottom: vs(16) }}
          />

          <Btn label="Save check-in" onPress={handleSave} loading={saving} color={C.green} />
        </ScrollView>
      </Sheet>
    </View>
  );
}