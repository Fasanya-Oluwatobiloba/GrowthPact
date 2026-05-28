// app/(tabs)/profile.jsx
import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { subscribeUser, updateUserDoc } from "../../lib/firestore";
import { useAuth } from "../../hooks/useAuth";
import { C, F, R, rs, vs, fs } from "../../constants/theme";
import { Avatar, Sheet, Btn } from "../../components/UI";
import { useTheme } from "../../context/ThemeContext"; // Connected to central engine

const BADGES = [
  { icon: "fire", provider: MaterialCommunityIcons, label: "Streak",    bg: C.primaryLight, color: C.primaryDark },
  { icon: "book", provider: Ionicons, label: "Faithful",  bg: C.greenLight,   color: "#085041" },
  { icon: "wallet", provider: Ionicons, label: "Saver",     bg: C.amberLight,   color: "#633806" },
  { icon: "brain", provider: FontAwesome5, label: "Reflective", bg: C.pinkLight,    color: "#72243E" },
  { icon: "leaf", provider: FontAwesome5, label: "Rooted",    bg: C.sand,         color: C.sandDark },
];

export default function ProfileScreen() {
  const { user, profile } = useAuth();
  const theme = useTheme(); // Consuming global properties (bg, card, text, darkMode, setDarkMode)
  const router = useRouter();
  
  const [userData, setUserData] = useState(profile);
  const [editSheet, setEditSheet] = useState(false);
  const [settingsSheet, setSettingsSheet] = useState(false);
  const [editName, setEditName] = useState("");
  const [editChurch, setEditChurch] = useState("");
  const [notifs, setNotifs] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeUser(user.uid, (d) => { if (d) setUserData(d); });
  }, [user]);

  const name = userData?.name || user?.displayName || "User";
  const church = userData?.church || "";
  const streak = userData?.streak || 0;
  const level = userData?.level || 1;
  const entries = userData?.entries || 0;

  const handleEditSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await updateUserDoc(user.uid, {
        name: editName.trim(),
        church: editChurch.trim(),
      });
    } catch {}
    setSaving(false);
    setEditSheet(false);
  };

  const openEdit = () => {
    setEditName(name);
    setEditChurch(church);
    setEditSheet(true);
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            await signOut(auth);
            router.replace("/(auth)/splash");
          },
        },
      ]
    );
  };

  const MENU = [
    { icon: "create-outline", label: "Edit profile", onPress: openEdit },
    { icon: "settings-outline", label: "Settings", onPress: () => setSettingsSheet(true) },
    { icon: "shield-checkmark-outline", label: "Privacy policy", onPress: () => {} },
    { icon: "chatbubble-ellipses-outline", label: "Send feedback", onPress: () => Alert.alert("Feedback", "Thank you! Email us at hello@growthpact.app") },
    { icon: "information-circle-outline", label: "About GrowthPact", onPress: () => Alert.alert("GrowthPact", "Version 1.0.0 — Faith-led accountability app.") },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: rs(16), paddingBottom: vs(32) }}
      >
        {/* Profile Card Surface Info Container */}
        <View style={{ 
          backgroundColor: theme.card, 
          borderRadius: R.xl, 
          padding: rs(20), 
          marginBottom: vs(22), 
          alignItems: "center",
          borderWidth: 1,
          borderColor: theme.border,
          shadowColor: "#000",
          shadowOpacity: theme.darkMode ? 0 : 0.03,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 }
        }}>
          {/* Avatar Frame with Dynamic Border Adjustments */}
          <View style={{ position: "relative", marginBottom: vs(12) }}>
            <Avatar name={name} size={rs(72)} bg={C.primary} color="#fff" />
            <View style={{ 
              position: "absolute", 
              bottom: 0, 
              right: 0, 
              backgroundColor: C.green, 
              borderRadius: R.full, 
              paddingVertical: vs(3), 
              paddingHorizontal: rs(8),
              borderWidth: 2,
              borderColor: theme.card
            }}>
              <Text style={{ fontFamily: F.bold, fontSize: fs(9), color: C.white }}>
                LVL {level}
              </Text>
            </View>
          </View>

          {/* User Identity Details */}
          <Text style={{ fontFamily: F.bold, fontSize: fs(20), color: theme.text, marginBottom: vs(2) }}>
            {name}
          </Text>
          <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: theme.textSub, marginBottom: church ? vs(6) : vs(12) }}>
            {user?.email}
          </Text>
          
          {church ? (
            <View style={{ 
              flexDirection: "row", 
              alignItems: "center", 
              gap: rs(4), 
              marginBottom: vs(12), 
              backgroundColor: theme.surface, 
              paddingVertical: vs(4), 
              paddingHorizontal: rs(10), 
              borderRadius: R.sm 
            }}>
              <Ionicons name="business-outline" size={fs(12)} color={theme.textSub} />
              <Text style={{ fontFamily: F.medium, fontSize: fs(12), color: theme.textSub }}>
                {church}
              </Text>
            </View>
          ) : null}

          {/* Metrics Grid Partition */}
          <View style={{ 
            flexDirection: "row", 
            width: "100%", 
            paddingTop: vs(16), 
            borderTopWidth: 1, 
            borderTopColor: theme.border,
            marginTop: vs(4)
          }}>
            {/* Streak Accumulator Component */}
            <View style={{ flex: 1, alignItems: "center", borderRightWidth: 1, borderRightColor: theme.border }}>
              <MaterialCommunityIcons name="fire" size={fs(18)} color={C.amberGold} />
              <Text style={{ fontFamily: F.bold, fontSize: fs(18), color: theme.text, marginTop: vs(3) }}>
                {streak}
              </Text>
              <Text style={{ fontFamily: F.medium, fontSize: fs(10), color: theme.textSub, marginTop: vs(1) }}>
                Day Streak
              </Text>
            </View>

            {/* Total Journal Logs Counter */}
            <View style={{ flex: 1, alignItems: "center", borderRightWidth: 1, borderRightColor: theme.border }}>
              <Ionicons name="document-text-outline" size={fs(17)} color={C.primary} />
              <Text style={{ fontFamily: F.bold, fontSize: fs(18), color: theme.text, marginTop: vs(3) }}>
                {entries}
              </Text>
              <Text style={{ fontFamily: F.medium, fontSize: fs(10), color: theme.textSub, marginTop: vs(1) }}>
                Total Entries
              </Text>
            </View>

            {/* Status Level Badge Standing */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <FontAwesome5 name="leaf" size={fs(15)} color={C.green} />
              <Text style={{ fontFamily: F.bold, fontSize: fs(13), color: C.green, marginTop: vs(7), transform: [{ translateY: -2 }] }}>
                Rooted
              </Text>
              <Text style={{ fontFamily: F.medium, fontSize: fs(10), color: theme.textSub, marginTop: vs(1) }}>
                Standing
              </Text>
            </View>
          </View>
        </View>

        {/* Milestones / Badges Deck Layout */}
        <Text style={{ fontFamily: F.bold, fontSize: fs(14), color: theme.text, marginBottom: vs(10) }}>
          My badges
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: rs(8), marginBottom: vs(24) }}>
          {BADGES.map((b) => {
            const BadgeIcon = b.provider;
            return (
              <View key={b.label} style={{ 
                backgroundColor: theme.darkMode ? "#1F1D2B" : b.bg, 
                borderRadius: R.md, 
                padding: rs(10), 
                alignItems: "center", 
                minWidth: rs(64),
                borderWidth: theme.darkMode ? 1 : 0,
                borderColor: theme.border
              }}>
                <BadgeIcon name={b.icon} size={fs(20)} color={theme.darkMode ? "#A3A0BC" : b.color} />
                <Text style={{ fontFamily: F.semibold, fontSize: fs(9), color: theme.darkMode ? "#A3A0BC" : b.color, marginTop: vs(4) }}>
                  {b.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Action Menu List Wrapper */}
        <View style={{ gap: vs(6), marginBottom: vs(20) }}>
          {MENU.map((m) => (
            <TouchableOpacity
              key={m.label}
              onPress={m.onPress}
              style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                padding: rs(14), 
                borderRadius: R.md, 
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border
              }}
            >
              <Ionicons name={m.icon} size={fs(18)} color={theme.text} style={{ marginRight: rs(12) }} />
              <Text style={{ fontFamily: F.medium, fontSize: fs(14), color: theme.text, flex: 1 }}>{m.label}</Text>
              <Ionicons name="chevron-forward" size={fs(16)} color={theme.darkMode ? "#4E4B66" : "#C0BDD4"} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Session Expatriation Container */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={{ flexDirection: "row", alignItems: "center", padding: rs(14), borderRadius: R.md, backgroundColor: theme.darkMode ? "#2C141A" : C.redLight, borderWidth: theme.darkMode ? 1 : 0, borderColor: "#5C1D24" }}
        >
          <Ionicons name="log-out-outline" size={fs(18)} color={C.red} style={{ marginRight: rs(12) }} />
          <Text style={{ fontFamily: F.semibold, fontSize: fs(14), color: C.red }}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Dynamic Overlay Form */}
      <Sheet visible={editSheet} onClose={() => setEditSheet(false)} title="Edit profile" style={{ backgroundColor: theme.sheetBg }}>
        <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(5), letterSpacing: 0.5 }}>FULL NAME</Text>
        <TextInput
          value={editName}
          onChangeText={setEditName}
          placeholder="Your name"
          placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
          style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(13), fontSize: fs(14), color: theme.text, fontFamily: F.regular, marginBottom: vs(12) }}
        />
        <Text style={{ fontFamily: F.semibold, fontSize: fs(11), color: theme.textSub, marginBottom: vs(5), letterSpacing: 0.5 }}>CHURCH / COMMUNITY</Text>
        <TextInput
          value={editChurch}
          onChangeText={setEditChurch}
          placeholder="e.g. RCCG, Winners Chapel..."
          placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
          style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: R.md, padding: rs(13), fontSize: fs(14), color: theme.text, fontFamily: F.regular, marginBottom: vs(16) }}
        />
        <Btn label="Save changes" onPress={handleEditSave} loading={saving} />
      </Sheet>

      {/* General Configuration Dialog Drawer */}
      <Sheet visible={settingsSheet} onClose={() => setSettingsSheet(false)} title="Settings" style={{ backgroundColor: theme.sheetBg }}>
        <View style={{ gap: vs(6) }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: rs(14), backgroundColor: theme.inputBg, borderRadius: R.md, borderWidth: 1, borderColor: theme.border }}>
            <View>
              <Text style={{ fontFamily: F.semibold, fontSize: fs(14), color: theme.text }}>Push notifications</Text>
              <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: theme.textSub }}>Daily reminders & check-ins</Text>
            </View>
            <Switch value={notifs} onValueChange={setNotifs} trackColor={{ true: C.primary, false: "#4E4B66" }} thumbColor="#fff" />
          </View>
          
          {/* Universal Theme Swapper Control */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: rs(14), backgroundColor: theme.inputBg, borderRadius: R.md, borderWidth: 1, borderColor: theme.border }}>
            <View>
              <Text style={{ fontFamily: F.semibold, fontSize: fs(14), color: theme.text }}>Dark theme</Text>
              <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: theme.textSub }}>Dim screen colors for nights</Text>
            </View>
            <Switch 
              value={theme.darkMode} 
              onValueChange={theme.setDarkMode} // Fires global execution to convert every view instantly
              trackColor={{ true: C.primary, false: "#4E4B66" }} 
              thumbColor="#fff" 
            />
          </View>
        </View>
      </Sheet>
    </SafeAreaView>
  );
}