// app/(journals)/bible.jsx
import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { subscribeJournalEntries, addJournalEntry, deleteJournalEntry } from "../../lib/firestore";
import { useAuth } from "../../hooks/useAuth";
import { C, F, R, rs, vs, fs } from "../../constants/theme";
import { Btn, Empty, Sheet, timeAgo, SectionTitle } from "../../components/UI";
import { useTheme } from "../../context/ThemeContext";

function EntryCard({ entry, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      onLongPress={() => Alert.alert("Delete entry?", "", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ])}
      style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: R.lg, padding: rs(14), marginBottom: vs(10) }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: vs(6) }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.bold, fontSize: fs(14), color: theme.text, marginBottom: vs(2) }}>
            📖 {entry.scripture || "Bible Study"}
          </Text>
          <Text style={{ fontFamily: F.regular, fontSize: fs(11), color: theme.textSub }}>
            {timeAgo(entry.createdAt)}
          </Text>
        </View>
        <Text style={{ fontFamily: F.regular, fontSize: fs(18), color: theme.textSub }}>{expanded ? "▲" : "▼"}</Text>
      </View>

      {entry.reflection ? (
        <Text style={{ fontFamily: F.regular, fontSize: fs(13), color: theme.textSub, lineHeight: vs(19) }} numberOfLines={expanded ? undefined : 2}>
          {entry.reflection}
        </Text>
      ) : null}

      {expanded && (
        <View style={{ marginTop: vs(10), gap: vs(8) }}>
          {entry.application ? (
            <View style={{ backgroundColor: theme.darkMode ? "rgba(255,255,255,0.05)" : C.greenLight, borderRadius: R.md, padding: rs(10), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
              <Text style={{ fontFamily: F.semibold, fontSize: fs(10), color: theme.darkMode ? C.greenMint : C.green, marginBottom: vs(3), letterSpacing: 0.5 }}>APPLICATION</Text>
              <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: theme.darkMode ? theme.text : "#085041", lineHeight: vs(18) }}>{entry.application}</Text>
            </View>
          ) : null}
          {entry.prayer ? (
            <View style={{ backgroundColor: theme.darkMode ? "rgba(255,255,255,0.05)" : C.primaryLight, borderRadius: R.md, padding: rs(10), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
              <Text style={{ fontFamily: F.semibold, fontSize: fs(10), color: theme.darkMode ? C.primaryLight : C.primary, marginBottom: vs(3), letterSpacing: 0.5 }}>PRAYER</Text>
              <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: theme.darkMode ? theme.text : C.primaryDark, lineHeight: vs(18) }}>{entry.prayer}</Text>
            </View>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function BibleJournalScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [entries,    setEntries]    = useState([]);
  const [newSheet,   setNewSheet]   = useState(false);
  const [scripture,  setScripture]  = useState("");
  const [reflection, setReflection] = useState("");
  const [application,setApplication]= useState("");
  const [prayer,     setPrayer]     = useState("");
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeJournalEntries("bible", setEntries);
  }, [user]);

  const handleSave = async () => {
    if (!scripture.trim() && !reflection.trim()) {
      Alert.alert("Nothing to save", "Please add a scripture reference or reflection.");
      return;
    }
    setSaving(true);
    await addJournalEntry("bible", { scripture: scripture.trim(), reflection: reflection.trim(), application: application.trim(), prayer: prayer.trim() });
    setScripture(""); setReflection(""); setApplication(""); setPrayer("");
    setNewSheet(false); setSaving(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ padding: rs(16), paddingBottom: vs(100) }} showsVerticalScrollIndicator={false}>
        {/* Header banner */}
        <View style={{ backgroundColor: theme.darkMode ? "#1F1D2B" : C.dark, borderRadius: R.xl, padding: rs(16), marginBottom: vs(16), flexDirection: "row", alignItems: "center", gap: rs(12), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
          <View style={{ width: rs(50), height: rs(50), borderRadius: R.lg, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: fs(26) }}>📖</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.bold, fontSize: fs(16), color: C.white }}>Bible Study Journal</Text>
            <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: theme.darkMode ? theme.textSub : C.muted, marginTop: vs(2) }}>
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </Text>
          </View>
        </View>

        <SectionTitle title="All entries" action="+ New entry" onAction={() => setNewSheet(true)} />

        {entries.length === 0 ? (
          <Empty
            emoji="✨"
            title="Start your first entry"
            sub="Record what God is speaking to you through His Word. Every entry is a step in your spiritual journey."
            onAction={() => setNewSheet(true)}
            actionLabel="New entry"
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
        style={{ position: "absolute", bottom: vs(24), right: rs(20), backgroundColor: C.primary, borderRadius: R.full, width: rs(56), height: rs(56), alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: C.primary, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
      >
        <Text style={{ fontSize: fs(26), color: "#fff" }}>+</Text>
      </TouchableOpacity>

      {/* New Entry Sheet */}
      <Sheet visible={newSheet} onClose={() => setNewSheet(false)} title="New Bible Study Entry" style={{ backgroundColor: theme.sheetBg }}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: vs(420) }}>
          <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(5), letterSpacing: 0.5 }}>SCRIPTURE REFERENCE</Text>
          <TextInput
            value={scripture}
            onChangeText={setScripture}
            placeholder="e.g. John 15:5, Psalm 23"
            placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
            style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(12), fontSize: fs(14), color: theme.text, fontFamily: F.regular, marginBottom: vs(10) }}
          />

          <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(5), letterSpacing: 0.5 }}>WHAT STOOD OUT TO YOU?</Text>
          <TextInput
            value={reflection}
            onChangeText={setReflection}
            placeholder="What is God saying to you through this passage?"
            placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
            multiline
            style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(12), fontSize: fs(13), color: theme.text, fontFamily: F.regular, minHeight: vs(80), textAlignVertical: "top", marginBottom: vs(10) }}
          />

          <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(5), letterSpacing: 0.5 }}>HOW WILL YOU APPLY THIS?</Text>
          <TextInput
            value={application}
            onChangeText={setApplication}
            placeholder="One concrete step you'll take today..."
            placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
            multiline
            style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(12), fontSize: fs(13), color: theme.text, fontFamily: F.regular, minHeight: vs(60), textAlignVertical: "top", marginBottom: vs(10) }}
          />

          <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(5), letterSpacing: 0.5 }}>PRAYER RESPONSE</Text>
          <TextInput
            value={prayer}
            onChangeText={setPrayer}
            placeholder="Talk to God about what you've read..."
            placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
            multiline
            style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(12), fontSize: fs(13), color: theme.text, fontFamily: F.regular, minHeight: vs(60), textAlignVertical: "top", marginBottom: vs(16) }}
          />

          <Btn label="Save entry" onPress={handleSave} loading={saving} />
        </ScrollView>
      </Sheet>
    </View>
  );
}