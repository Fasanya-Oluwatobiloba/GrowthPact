// app/(journals)/character.jsx
import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { subscribeJournalEntries, addJournalEntry, deleteJournalEntry } from "../../lib/firestore";
import { useAuth } from "../../hooks/useAuth";
import { C, F, R, rs, vs, fs } from "../../constants/theme";
import { Btn, Empty, Sheet, SectionTitle, timeAgo } from "../../components/UI";
import { useTheme } from "../../context/ThemeContext";

const IDENTITY_TRUTHS = [
  "Chosen (Eph 1:4)", "Loved (John 3:16)", "New Creation (2 Cor 5:17)",
  "Forgiven (Col 1:14)", "Redeemed (Gal 3:13)", "More than a conqueror (Rom 8:37)",
  "Child of God (John 1:12)", "Salt and light (Matt 5:13-14)",
];

const STATUS_OPTIONS = [
  { label: "Strong",        bg: C.primaryLight, color: C.primaryDark },
  { label: "Growing",       bg: C.greenLight,   color: "#085041" },
  { label: "Working on it", bg: C.amberLight,   color: "#633806" },
  { label: "Struggling",    bg: C.pinkLight,    color: "#72243E" },
];

function EntryCard({ entry, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const status = STATUS_OPTIONS.find(s => s.label === entry.status) || STATUS_OPTIONS[1];

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      onLongPress={() => Alert.alert("Delete entry?","", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ])}
      style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: R.lg, padding: rs(14), marginBottom: vs(10) }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: vs(6) }}>
        <Text style={{ fontFamily: F.bold, fontSize: fs(14), color: theme.text, flex: 1 }}>{entry.trait || "Character note"}</Text>
        <View style={{ backgroundColor: theme.darkMode ? "rgba(255,255,255,0.05)" : status.bg, borderRadius: R.full, paddingVertical: vs(3), paddingHorizontal: rs(10), marginLeft: rs(8), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
          <Text style={{ fontFamily: F.semibold, fontSize: fs(10), color: theme.darkMode ? theme.text : status.color }}>{entry.status}</Text>
        </View>
      </View>
      <Text style={{ fontFamily: F.regular, fontSize: fs(11), color: theme.textSub, marginBottom: vs(6) }}>{timeAgo(entry.createdAt)}</Text>
      {entry.note ? (
        <Text style={{ fontFamily: F.regular, fontSize: fs(13), color: theme.textSub, lineHeight: vs(19) }} numberOfLines={expanded ? undefined : 2}>
          {entry.note}
        </Text>
      ) : null}
      {expanded && entry.scripture ? (
        <View style={{ backgroundColor: theme.darkMode ? "rgba(255,255,255,0.05)" : C.primaryLight, borderRadius: R.md, padding: rs(10), marginTop: vs(8), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
          <Text style={{ fontFamily: F.semibold, fontSize: fs(10), color: theme.darkMode ? C.primaryLight : C.primary, marginBottom: vs(2), letterSpacing: 0.5 }}>SCRIPTURE ANCHOR</Text>
          <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: theme.darkMode ? theme.text : C.primaryDark, fontStyle: "italic" }}>{entry.scripture}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function CharacterScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [entries,   setEntries]   = useState([]);
  const [newSheet,  setNewSheet]  = useState(false);
  const [trait,     setTrait]     = useState("");
  const [status,    setStatus]    = useState("Growing");
  const [note,      setNote]      = useState("");
  const [scripture, setScripture] = useState("");
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeJournalEntries("character", setEntries);
  }, [user]);

  const handleSave = async () => {
    if (!trait.trim() && !note.trim()) {
      Alert.alert("Nothing to save", "Add a trait name or note.");
      return;
    }
    setSaving(true);
    await addJournalEntry("character", {
      trait: trait.trim(),
      status,
      note: note.trim(),
      scripture: scripture.trim(),
    });
    setTrait(""); setStatus("Growing"); setNote(""); setScripture("");
    setNewSheet(false); setSaving(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ padding: rs(16), paddingBottom: vs(100) }} showsVerticalScrollIndicator={false}>
        {/* Identity truths banner */}
        <View style={{ backgroundColor: theme.darkMode ? "#1F1D2B" : C.pinkLight, borderRadius: R.xl, padding: rs(14), marginBottom: vs(16), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
          <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: C.pink, marginBottom: vs(10), letterSpacing: 0.5 }}>MY IDENTITY IN CHRIST</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: rs(7) }}>
            {IDENTITY_TRUTHS.map(t => (
              <View key={t} style={{ backgroundColor: theme.darkMode ? "rgba(255,255,255,0.05)" : "#fff", borderRadius: R.full, paddingVertical: vs(5), paddingHorizontal: rs(11), borderWidth: 1, borderColor: theme.darkMode ? theme.border : "#F4C0D1" }}>
                <Text style={{ fontFamily: F.medium, fontSize: fs(11), color: theme.darkMode ? theme.text : "#72243E" }}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <SectionTitle title="Character notes" action="+ New note" onAction={() => setNewSheet(true)} />

        {entries.length === 0 ? (
          <Empty
            emoji="🪞"
            title="Track your character growth"
            sub="Document your strengths, areas to work on, and who God says you are becoming."
            onAction={() => setNewSheet(true)}
            actionLabel="Add first note"
          />
        ) : (
          entries.map(e => (
            <EntryCard key={e.id} entry={e} onDelete={() => deleteJournalEntry(e.id)} />
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => setNewSheet(true)}
        style={{ position: "absolute", bottom: vs(24), right: rs(20), backgroundColor: C.pink, borderRadius: R.full, width: rs(56), height: rs(56), alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: C.pink, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
      >
        <Text style={{ fontSize: fs(26), color: "#fff" }}>+</Text>
      </TouchableOpacity>

      <Sheet visible={newSheet} onClose={() => setNewSheet(false)} title="New Character Note" style={{ backgroundColor: theme.sheetBg }}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: vs(420) }}>
          <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(5), letterSpacing: 0.5 }}>CHARACTER TRAIT</Text>
          <TextInput
            value={trait}
            onChangeText={setTrait}
            placeholder="e.g. Patience, Discipline, Kindness..."
            placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
            style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(12), fontSize: fs(14), color: theme.text, fontFamily: F.regular, marginBottom: vs(10) }}
          />

          <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(8), letterSpacing: 0.5 }}>CURRENT STATUS</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: rs(7), marginBottom: vs(12) }}>
            {STATUS_OPTIONS.map(s => (
              <TouchableOpacity
                key={s.label}
                onPress={() => setStatus(s.label)}
                style={{ backgroundColor: status === s.label ? (theme.darkMode ? "rgba(255,255,255,0.15)" : s.bg) : theme.inputBg, borderWidth: status === s.label ? 1.5 : 1, borderColor: status === s.label ? (theme.darkMode ? theme.text : s.color) : theme.border, borderRadius: R.full, paddingVertical: vs(6), paddingHorizontal: rs(13) }}
              >
                <Text style={{ fontFamily: F.semibold, fontSize: fs(12), color: status === s.label ? (theme.darkMode ? theme.text : s.color) : theme.textSub }}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(5), letterSpacing: 0.5 }}>YOUR REFLECTION</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What happened today that relates to this trait? How did you respond? What do you want to do differently?"
            placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
            multiline
            style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(12), fontSize: fs(13), color: theme.text, fontFamily: F.regular, minHeight: vs(90), textAlignVertical: "top", marginBottom: vs(10), lineHeight: vs(20) }}
          />

          <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(5), letterSpacing: 0.5 }}>SCRIPTURE ANCHOR (OPTIONAL)</Text>
          <TextInput
            value={scripture}
            onChangeText={setScripture}
            placeholder="A verse that speaks to this area..."
            placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
            style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(12), fontSize: fs(13), color: theme.text, fontFamily: F.regular, marginBottom: vs(16) }}
          />

          <Btn label="Save note" onPress={handleSave} loading={saving} color={C.pink} />
        </ScrollView>
      </Sheet>
    </View>
  );
}