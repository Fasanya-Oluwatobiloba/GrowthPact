// app/(journals)/book.jsx
import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { subscribeBooks, addBook, updateBook } from "../../lib/firestore";
import { useAuth } from "../../hooks/useAuth";
import { C, F, R, rs, vs, fs } from "../../constants/theme";
import { Btn, Empty, Sheet, SectionTitle, ProgressBar } from "../../components/UI";
import { useTheme } from "../../context/ThemeContext";

function BookCard({ book, onLogChapter, onAddNote }) {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const pct = Math.round(((book.currentChapter || 0) / (book.totalChapters || 1)) * 100);

  return (
    <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: R.xl, padding: rs(16), marginBottom: vs(12) }}>
      <View style={{ flexDirection: "row", gap: rs(12), marginBottom: vs(10) }}>
        <View style={{ width: rs(50), height: rs(66), backgroundColor: book.color || C.primary, borderRadius: R.md, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: F.bold, fontSize: fs(9), color: "#fff", textAlign: "center", padding: rs(4), lineHeight: vs(13) }}>
            {book.title}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.bold, fontSize: fs(15), color: theme.text }}健全>{book.title}</Text>
          <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: theme.textSub, marginTop: vs(2) }}>{book.author}</Text>
          <Text style={{ fontFamily: F.medium, fontSize: fs(11), color: theme.textSub, marginTop: vs(2) }}>
            Ch {book.currentChapter || 0} of {book.totalChapters} · {pct}% done
          </Text>
        </View>
        <View style={{ backgroundColor: theme.darkMode ? "rgba(255,255,255,0.05)" : (book.color || C.primary) + "22", borderRadius: R.full, paddingVertical: vs(3), paddingHorizontal: rs(9), alignSelf: "flex-start" }}>
          <Text style={{ fontFamily: F.bold, fontSize: fs(11), color: book.color || C.primary }}>{pct}%</Text>
        </View>
      </View>

      <ProgressBar pct={pct} color={book.color || C.primary} bg={theme.darkMode ? "rgba(255,255,255,0.05)" : (book.color || C.primary) + "22"} height={vs(6)} />

      {/* Latest note */}
      {book.notes?.length > 0 && (
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={{ backgroundColor: theme.darkMode ? "rgba(255,255,255,0.03)" : C.surface, borderRadius: R.md, padding: rs(10), marginTop: vs(10), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}
        >
          <Text style={{ fontFamily: F.semibold, fontSize: fs(10), color: theme.textSub, marginBottom: vs(3), letterSpacing: 0.5 }}>
            LATEST NOTE — Chapter {book.notes[book.notes.length-1]?.chapter}
          </Text>
          <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: theme.text, lineHeight: vs(18) }} numberOfLines={expanded ? undefined : 2}>
            {book.notes[book.notes.length-1]?.text}
          </Text>
          {book.notes.length > 1 && (
            <Text style={{ fontFamily: F.medium, fontSize: fs(11), color: C.primary, marginTop: vs(4) }}>
              {expanded ? "Show less" : `View all ${book.notes.length} notes`}
            </Text>
          )}
          {expanded && book.notes.length > 1 && (
            <View style={{ marginTop: vs(8), gap: vs(6) }}>
              {book.notes.slice(0, -1).reverse().map((n, i) => (
                <View key={i} style={{ borderTopWidth: 1, borderTopColor: theme.border, paddingTop: vs(6) }}>
                  <Text style={{ fontFamily: F.semibold, fontSize: fs(10), color: theme.textSub, marginBottom: vs(2) }}>Chapter {n.chapter}</Text>
                  <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: theme.text, lineHeight: vs(18) }}>{n.text}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      )}

      <View style={{ flexDirection: "row", gap: rs(8), marginTop: vs(12) }}>
        <TouchableOpacity
          onPress={onLogChapter}
          style={{ flex: 1, backgroundColor: book.color || C.primary, borderRadius: R.md, paddingVertical: vs(10), alignItems: "center" }}
        >
          <Text style={{ fontFamily: F.bold, fontSize: fs(12), color: "#fff" }}>Log chapter ›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onAddNote}
          style={{ flex: 1, backgroundColor: "transparent", borderWidth: 1, borderColor: book.color || C.primary, borderRadius: R.md, paddingVertical: vs(10), alignItems: "center" }}
        >
          <Text style={{ fontFamily: F.bold, fontSize: fs(12), color: book.color || C.primary }}>Add note</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const BOOK_COLORS = [C.primary, C.green, C.pink, C.amber, C.blue, "#7C5CBF", "#2A9D8F"];

export default function BookJournalScreen() {
  const { user }   = useAuth();
  const theme      = useTheme();
  const [books,    setBooks]    = useState([]);
  const [addSheet, setAddSheet] = useState(false);
  const [noteSheet,setNoteSheet]= useState(false);
  const [activeBook,setActiveBook]=useState(null);
  const [title,    setTitle]    = useState("");
  const [author,   setAuthor]   = useState("");
  const [chapters, setChapters] = useState("");
  const [noteText, setNoteText] = useState("");
  const [colorIdx, setColorIdx] = useState(0);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeBooks(setBooks);
  }, [user]);

  const handleAddBook = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await addBook({ title: title.trim(), author: author.trim(), totalChapters: parseInt(chapters) || 10, color: BOOK_COLORS[colorIdx], notes: [], currentChapter: 0 });
    setTitle(""); setAuthor(""); setChapters(""); setColorIdx(0);
    setAddSheet(false); setSaving(false);
  };

  const handleLogChapter = async (book) => {
    const next = (book.currentChapter || 0) + 1;
    if (next > book.totalChapters) {
      Alert.alert("🎉 Finished!", `You've completed "${book.title}"!`);
      return;
    }
    await updateBook(book.id, { currentChapter: next });
  };

  const handleAddNote = (book) => {
    setActiveBook(book);
    setNoteText("");
    setNoteSheet(true);
  };

  const handleSaveNote = async () => {
    if (!noteText.trim() || !activeBook) return;
    const notes = [...(activeBook.notes || []), { chapter: activeBook.currentChapter || 0, text: noteText.trim(), date: new Date().toISOString() }];
    await updateBook(activeBook.id, { notes });
    setNoteSheet(false); setNoteText("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ padding: rs(16), paddingBottom: vs(100) }} showsVerticalScrollIndicator={false}>
        <SectionTitle title="My reading list" action="+ Add book" onAction={() => setAddSheet(true)} />

        {books.length === 0 ? (
          <Empty
            emoji="📚"
            title="No books yet"
            sub="Track any book you're reading — chapter by chapter. Log takeaways and lessons as you go."
            onAction={() => setAddSheet(true)}
            actionLabel="Add first book"
          />
        ) : (
          books.map(b => (
            <BookCard key={b.id} book={b} onLogChapter={() => handleLogChapter(b)} onAddNote={() => handleAddNote(b)} />
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => setAddSheet(true)}
        style={{ position: "absolute", bottom: vs(24), right: rs(20), backgroundColor: C.amber, borderRadius: R.full, width: rs(56), height: rs(56), alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: C.amber, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
      >
        <Text style={{ fontSize: fs(26), color: "#fff" }}>+</Text>
      </TouchableOpacity>

      {/* Add Book Sheet */}
      <Sheet visible={addSheet} onClose={() => setAddSheet(false)} title="Add a book" style={{ backgroundColor: theme.sheetBg }}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Book title" placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
          style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(12), fontSize: fs(14), color: theme.text, fontFamily: F.regular, marginBottom: vs(10) }} />
        <TextInput value={author} onChangeText={setAuthor} placeholder="Author name" placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
          style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(12), fontSize: fs(14), color: theme.text, fontFamily: F.regular, marginBottom: vs(10) }} />
        <TextInput value={chapters} onChangeText={setChapters} placeholder="Total chapters" placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"} keyboardType="numeric"
          style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(12), fontSize: fs(14), color: theme.text, fontFamily: F.regular, marginBottom: vs(12) }} />
        <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(8), letterSpacing: 0.5 }}>BOOK COLOUR</Text>
        <View style={{ flexDirection: "row", gap: rs(10), marginBottom: vs(16) }}>
          {BOOK_COLORS.map((col, i) => (
            <TouchableOpacity key={i} onPress={() => setColorIdx(i)}
              style={{ width: rs(30), height: rs(30), borderRadius: R.full, backgroundColor: col, borderWidth: colorIdx === i ? 3 : 0, borderColor: "#fff", shadowColor: col, shadowOpacity: colorIdx===i?0.5:0, shadowRadius: 4, elevation: colorIdx===i?4:0 }} />
          ))}
        </View>
        <Btn label="Add book" onPress={handleAddBook} loading={saving} color={C.amber} />
      </Sheet>

      {/* Add Note Sheet */}
      <Sheet visible={noteSheet} onClose={() => setNoteSheet(false)} title={`Note — Ch ${activeBook?.currentChapter || 0}`} style={{ backgroundColor: theme.sheetBg }}>
        <TextInput
          value={noteText}
          onChangeText={setNoteText}
          placeholder="Key takeaway, lesson, or quote from this chapter..."
          placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
          multiline
          autoFocus
          style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(12), fontSize: fs(13), color: theme.text, fontFamily: F.regular, minHeight: vs(100), textAlignVertical: "top", marginBottom: vs(16), lineHeight: vs(20) }}
        />
        <Btn label="Save note" onPress={handleSaveNote} color={C.amber} />
      </Sheet>
    </View>
  );
}