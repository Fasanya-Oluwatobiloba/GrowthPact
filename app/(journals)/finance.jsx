// app/(journals)/finance.jsx
import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { subscribeExpenses, addExpense, getSavingsGoal, updateSavingsGoal } from "../../lib/firestore";
import { useAuth } from "../../hooks/useAuth";
import { C, F, R, rs, vs, fs } from "../../constants/theme";
import { Btn, Empty, Sheet, SectionTitle, ProgressBar } from "../../components/UI";
import { useTheme } from "../../context/ThemeContext";

const EXPENSE_CATS = [
  { id: "food",      label: "🍔 Food",       color: C.amber },
  { id: "academic",  label: "📖 Academic",   color: C.blue },
  { id: "transport", label: "🚌 Transport",  color: C.pink },
  { id: "health",    label: "💊 Health",     color: C.green },
  { id: "tithe",     label: "🙏 Tithe",      color: C.primary },
  { id: "savings",   label: "💰 Savings",    color: C.green },
  { id: "other",     label: "📦 Other",      color: C.textSub },
];

export default function FinanceScreen() {
  const { user }    = useAuth();
  const theme       = useTheme();
  const [expenses,  setExpenses]  = useState([]);
  const [goal,      setGoal]      = useState({ monthlyGoal: 20000, saved: 0 });
  const [addSheet,  setAddSheet]  = useState(false);
  const [goalSheet, setGoalSheet] = useState(false);
  const [amount,    setAmount]    = useState("");
  const [desc,      setDesc]      = useState("");
  const [cat,       setCat]       = useState("food");
  const [newGoal,   setNewGoal]   = useState("");
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeExpenses(setExpenses);
    getSavingsGoal().then(setGoal);
    return unsub;
  }, [user]);

  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const savedPct   = Math.min(Math.round(((goal.saved || 0) / (goal.monthlyGoal || 1)) * 100), 100);

  const byCategory = EXPENSE_CATS.map(c => ({
    ...c,
    total: expenses.filter(e => e.category === c.id).reduce((s, e) => s + (e.amount || 0), 0),
  })).filter(c => c.total > 0);

  const handleAdd = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert("Invalid amount", "Please enter a valid number.");
      return;
    }
    setSaving(true);
    await addExpense({ amount: parseFloat(amount), description: desc.trim(), category: cat });
    setAmount(""); setDesc(""); setCat("food");
    setAddSheet(false); setSaving(false);
  };

  const handleGoalSave = async () => {
    const val = parseFloat(newGoal);
    if (!val) return;
    await updateSavingsGoal({ ...goal, monthlyGoal: val });
    setGoal(g => ({ ...g, monthlyGoal: val }));
    setGoalSheet(false);
  };

  const daysLeft = (() => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return end.getDate() - now.getDate();
  })();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ padding: rs(16), paddingBottom: vs(100) }} showsVerticalScrollIndicator={false}>
        {/* Savings goal card */}
        <View style={{ backgroundColor: theme.darkMode ? "#1F1D2B" : C.dark, borderRadius: R.xl, padding: rs(18), marginBottom: vs(16), borderWidth: theme.darkMode ? 1 : 0, borderColor: theme.border }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: vs(4) }}>
            <Text style={{ fontFamily: F.regular, fontSize: fs(11), color: theme.darkMode ? theme.textSub : C.muted }}>Monthly savings goal</Text>
            <TouchableOpacity onPress={() => { setNewGoal(String(goal.monthlyGoal)); setGoalSheet(true); }}
              style={{ backgroundColor: C.amber + "33", borderRadius: R.full, paddingVertical: vs(4), paddingHorizontal: rs(10) }}>
              <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: C.amberGold }}>Edit goal</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontFamily: F.bold, fontSize: fs(32), color: C.amberGold, marginBottom: vs(4) }}>
            ₦{(goal.saved || 0).toLocaleString()}
            <Text style={{ fontSize: fs(14), color: theme.darkMode ? theme.textSub : C.muted, fontFamily: F.regular }}> / ₦{(goal.monthlyGoal || 0).toLocaleString()}</Text>
          </Text>
          <ProgressBar pct={savedPct} color={C.amber} bg={theme.darkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.12)"} height={vs(7)} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: vs(8) }}>
            <Text style={{ fontFamily: F.medium, fontSize: fs(11), color: theme.darkMode ? theme.textSub : C.muted }}>{savedPct}% saved</Text>
            <Text style={{ fontFamily: F.medium, fontSize: fs(11), color: theme.darkMode ? theme.textSub : C.muted }}>{daysLeft} days left</Text>
          </View>
          <TouchableOpacity
            onPress={() => { setCat("savings"); setAddSheet(true); }}
            style={{ backgroundColor: C.amber, borderRadius: R.md, paddingVertical: vs(10), alignItems: "center", marginTop: vs(12) }}
          >
            <Text style={{ fontFamily: F.bold, fontSize: fs(13), color: "#fff" }}>+ Log savings</Text>
          </TouchableOpacity>
        </View>

        {/* This month summary */}
        <View style={{ backgroundColor: theme.card, borderRadius: R.lg, padding: rs(14), marginBottom: vs(16), flexDirection: "row", justifyContent: "space-around", borderWidth: 1, borderColor: theme.border }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: F.bold, fontSize: fs(18), color: C.red }}>₦{totalSpent.toLocaleString()}</Text>
            <Text style={{ fontFamily: F.regular, fontSize: fs(11), color: theme.textSub }}>Spent</Text>
          </View>
          <View style={{ width: 1, backgroundColor: theme.border }} />
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: F.bold, fontSize: fs(18), color: C.green }}>₦{(goal.saved || 0).toLocaleString()}</Text>
            <Text style={{ fontFamily: F.regular, fontSize: fs(11), color: theme.textSub }}>Saved</Text>
          </View>
          <View style={{ width: 1, backgroundColor: theme.border }} />
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: F.bold, fontSize: fs(18), color: theme.text }}>{expenses.length}</Text>
            <Text style={{ fontFamily: F.regular, fontSize: fs(11), color: theme.textSub }}>Entries</Text>
          </View>
        </View>

        {/* Category breakdown */}
        {byCategory.length > 0 && (
          <>
            <SectionTitle title="By category" />
            {byCategory.map(c => (
              <View key={c.id} style={{ flexDirection: "row", alignItems: "center", gap: rs(10), backgroundColor: theme.card, borderRadius: R.md, padding: rs(12), marginBottom: vs(7), borderWidth: 1, borderColor: theme.border }}>
                <Text style={{ fontSize: fs(18), width: rs(28) }}>{c.label.split(" ")[0]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: F.medium, fontSize: fs(13), color: theme.text }}>{c.label.split(" ").slice(1).join(" ")}</Text>
                  <ProgressBar pct={totalSpent > 0 ? (c.total/totalSpent)*100 : 0} color={c.color} bg={theme.border} height={vs(3)} />
                </View>
                <Text style={{ fontFamily: F.bold, fontSize: fs(13), color: theme.text }}>₦{c.total.toLocaleString()}</Text>
              </View>
            ))}
          </>
        )}

        {/* All expenses */}
        <SectionTitle title="All transactions" action="+ Add" onAction={() => setAddSheet(true)} />
        {expenses.length === 0 ? (
          <Empty emoji="💸" title="No transactions yet" sub="Start logging your income and expenses to track where your money goes." onAction={() => setAddSheet(true)} actionLabel="Log first transaction" />
        ) : (
          expenses.map(e => {
            const ec = EXPENSE_CATS.find(c => c.id === e.category) || EXPENSE_CATS[6];
            return (
              <View key={e.id} style={{ flexDirection: "row", alignItems: "center", gap: rs(10), backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(12), marginBottom: vs(7) }}>
                <Text style={{ fontSize: fs(18) }}>{ec.label.split(" ")[0]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: F.medium, fontSize: fs(13), color: theme.text }}>{e.description || ec.label.split(" ").slice(1).join(" ")}</Text>
                  <Text style={{ fontFamily: F.regular, fontSize: fs(11), color: theme.textSub }}>
                    {e.date?.toDate ? e.date.toDate().toLocaleDateString("en-GB",{day:"numeric",month:"short"}) : ""}
                  </Text>
                </View>
                <Text style={{ fontFamily: F.bold, fontSize: fs(14), color: e.category === "savings" ? C.green : C.red }}>
                  {e.category === "savings" ? "+" : "-"}₦{(e.amount || 0).toLocaleString()}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => setAddSheet(true)}
        style={{ position: "absolute", bottom: vs(24), right: rs(20), backgroundColor: C.amber, borderRadius: R.full, width: rs(56), height: rs(56), alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: C.amber, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
      >
        <Text style={{ fontSize: fs(26), color: "#fff" }}>+</Text>
      </TouchableOpacity>

      {/* Add Expense Sheet */}
      <Sheet visible={addSheet} onClose={() => setAddSheet(false)} title="Log transaction" style={{ backgroundColor: theme.sheetBg }}>
        <TextInput value={amount} onChangeText={setAmount} placeholder="Amount (₦)" keyboardType="numeric" placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
          style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(13), fontSize: fs(22), fontFamily: F.bold, color: theme.text, marginBottom: vs(10), textAlign: "center" }} />
        <TextInput value={desc} onChangeText={setDesc} placeholder="Description (optional)" placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
          style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(12), fontSize: fs(14), color: theme.text, fontFamily: F.regular, marginBottom: vs(12) }} />
        <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(8), letterSpacing: 0.5 }}>CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: vs(16) }}>
          <View style={{ flexDirection: "row", gap: rs(7) }}>
            {EXPENSE_CATS.map(c => (
              <TouchableOpacity key={c.id} onPress={() => setCat(c.id)}
                style={{ backgroundColor: cat===c.id ? c.color+"22" : theme.inputBg, borderRadius: R.full, paddingVertical: vs(7), paddingHorizontal: rs(13), borderWidth: 1, borderColor: cat===c.id ? c.color : theme.border }}>
                <Text style={{ fontFamily: F.semibold, fontSize: fs(12), color: cat===c.id ? (theme.darkMode ? theme.text : c.color) : theme.textSub }}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <Btn label="Save" onPress={handleAdd} loading={saving} color={C.amber} />
      </Sheet>

      {/* Goal Sheet */}
      <Sheet visible={goalSheet} onClose={() => setGoalSheet(false)} title="Set monthly savings goal" style={{ backgroundColor: theme.sheetBg }}>
        <TextInput value={newGoal} onChangeText={setNewGoal} placeholder="e.g. 20000" keyboardType="numeric" autoFocus placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
          style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(13), fontSize: fs(22), fontFamily: F.bold, color: theme.text, marginBottom: vs(16), textAlign: "center" }} />
        <Btn label="Save goal" onPress={handleGoalSave} color={C.amber} />
      </Sheet>
    </View>
  );
}