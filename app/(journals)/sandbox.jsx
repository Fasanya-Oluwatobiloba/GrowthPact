// app/(journals)/sandbox.jsx
import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { subscribeJournalEntries, addJournalEntry, deleteJournalEntry } from "../../lib/firestore";
import { useAuth } from "../../hooks/useAuth";
import { C, F, R, rs, vs, fs } from "../../constants/theme";
import { Btn, Empty, Sheet, SectionTitle, timeAgo } from "../../components/UI";
import { useTheme } from "../../context/ThemeContext";

const MODES = [
  { id: "write",       label: "✍️ Write",      color: C.primary },
  { id: "brainstorm",  label: "💡 Brainstorm", color: C.amber },
  { id: "gratitude",   label: "🙏 Gratitude",  color: C.green },
  { id: "dream",       label: "🌙 Dream log",  color: "#7C5CBF" },
  { id: "vent",        label: "😤 Vent",       color: C.pink },
];

function EntryCard({ entry, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const mode = MODES.find(m => m.id === entry.mode) || MODES[0];

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      onLongPress={() =>
        Alert.alert("Delete entry?", "This cannot be undone.", [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: onDelete },
        ])
      }
      activeOpacity={0.85}
      style={{
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: R.lg,
        padding: rs(14),
        marginBottom: vs(10),
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: vs(6) }}>
        <View style={{ flex: 1 }}>
          {entry.title ? (
            <Text style={{ fontFamily: F.bold, fontSize: fs(14), color: theme.text, marginBottom: vs(2) }}>
              {entry.title}
            </Text>
          ) : null}
          <View style={{ flexDirection: "row", alignItems: "center", gap: rs(6) }}>
            <View style={{ backgroundColor: theme.darkMode ? "rgba(255,255,255,0.05)" : mode.color + "22", borderRadius: R.full, paddingVertical: vs(2), paddingHorizontal: rs(8) }}>
              <Text style={{ fontFamily: F.medium, fontSize: fs(10), color: mode.color }}>{mode.label}</Text>
            </View>
            <Text style={{ fontFamily: F.regular, fontSize: fs(11), color: theme.textSub }}>{timeAgo(entry.createdAt)}</Text>
          </View>
        </View>
        <Text style={{ fontFamily: F.regular, fontSize: fs(18), color: theme.textSub }}>{expanded ? "▲" : "▼"}</Text>
      </View>

      <Text
        style={{ fontFamily: F.regular, fontSize: fs(13), color: theme.textSub, lineHeight: vs(20) }}
        numberOfLines={expanded ? undefined : 3}
      >
        {entry.content}
      </Text>
    </TouchableOpacity>
  );
}

export default function SandboxScreen() {
  const { user }   = useAuth();
  const theme      = useTheme();
  const [entries,  setEntries]  = useState([]);
  const [newSheet, setNewSheet] = useState(false);
  const [mode,     setMode]     = useState("write");
  const [title,    setTitle]    = useState("");
  const [content,  setContent]  = useState("");
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeJournalEntries("sandbox", setEntries);
  }, [user]);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert("Nothing to save", "Write something first.");
      return;
    }
    setSaving(true);
    await addJournalEntry("sandbox", {
      mode,
      title: title.trim(),
      content: content.trim(),
    });
    setMode("write"); setTitle(""); setContent("");
    setNewSheet(false); setSaving(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: rs(16), paddingBottom: vs(100) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={{ backgroundColor: theme.darkMode ? "#1F1D2B" : C.sand, borderRadius: R.xl, padding: rs(16), marginBottom: vs(16), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
          <Text style={{ fontFamily: F.bold, fontSize: fs(16), color: theme.darkMode ? theme.text : C.sandDark, marginBottom: vs(4) }}>
            Personal Sandbox ✏️
          </Text>
          <Text style={{ fontFamily: F.regular, fontSize: fs(13), color: theme.darkMode ? theme.textSub : "#5F5E5A", lineHeight: vs(19) }}>
            Your free space — write, brainstorm, dream, vent, or think. No rules here.
          </Text>
          <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: "#888", marginTop: vs(6) }}>
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </Text>
        </View>

        <SectionTitle title="All entries" action="+ New entry" onAction={() => setNewSheet(true)} />

        {entries.length === 0 ? (
          <Empty
            emoji="✏️"
            title="Your free space awaits"
            sub="Write anything — goals, random thoughts, prayers, gratitude lists, vents, or dreams. This is yours."
            onAction={() => setNewSheet(true)}
            actionLabel="Start writing"
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
        style={{
          position: "absolute", bottom: vs(24), right: rs(20),
          backgroundColor: C.sandDark, borderRadius: R.full,
          width: rs(56), height: rs(56),
          alignItems: "center", justifyContent: "center",
          elevation: 6, shadowColor: "#000", shadowOpacity: 0.2,
          shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Text style={{ fontSize: fs(26), color: "#fff" }}>+</Text>
      </TouchableOpacity>

      {/* New Entry Sheet */}
      <Sheet visible={newSheet} onClose={() => setNewSheet(false)} title="New entry" style={{ backgroundColor: theme.sheetBg }}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: vs(480) }}>
          <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(8), letterSpacing: 0.5 }}>
            WHAT KIND OF ENTRY?
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: vs(12) }}>
            <View style={{ flexDirection: "row", gap: rs(7) }}>
              {MODES.map(m => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setMode(m.id)}
                  style={{
                    backgroundColor: mode === m.id ? m.color + "22" : theme.inputBg,
                    borderRadius: R.full,
                    paddingVertical: vs(7),
                    paddingHorizontal: rs(13),
                    borderWidth: mode === m.id ? 1.5 : 1,
                    borderColor: mode === m.id ? m.color : theme.border,
                  }}
                >
                  <Text style={{ fontFamily: F.semibold, fontSize: fs(12), color: mode === m.id ? m.color : theme.textSub }}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Title */}
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title (optional)"
            placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
            style={{
              backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border,
              borderRadius: R.md, padding: rs(12), fontSize: fs(15),
              color: theme.text, fontFamily: F.bold, marginBottom: vs(10),
            }}
          />

          {/* Content */}
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder={
              mode === "brainstorm" ? "Dump every idea — no filtering, no judgment..." :
              mode === "gratitude"  ? "What are you grateful for today?" :
              mode === "dream"      ? "Write what you dreamed or what you're dreaming of..." :
              mode === "vent"       ? "Let it all out. This is your safe space..." :
              "Start writing anything on your mind..."
            }
            placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
            multiline
            autoFocus
            style={{
              backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border,
              borderRadius: R.md, padding: rs(12), fontSize: fs(14),
              color: theme.text, fontFamily: F.regular, minHeight: vs(160),
              textAlignVertical: "top", marginBottom: vs(16), lineHeight: vs(22),
            }}
          />

          <Btn
            label="Save entry"
            onPress={handleSave}
            loading={saving}
            color={MODES.find(m => m.id === mode)?.color || C.primary}
          />
        </ScrollView>
      </Sheet>
    </View>
  );
}