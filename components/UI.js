// components/UI.js
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { C, F, R, rs, vs, fs } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

// ── Button ────────────────────────────────────────────────────────
export function Btn({ label, onPress, color = C.primary, textColor = "#fff", loading = false, outline = false, style, icon }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
      style={[{
        backgroundColor: outline ? "transparent" : color,
        borderRadius: R.lg,
        paddingVertical: vs(14),
        paddingHorizontal: rs(20),
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        borderWidth: outline ? 1.5 : 0,
        borderColor: outline ? color : "transparent",
      }, style]}
    >
      {icon && !loading && <Text style={{ fontSize: fs(18) }}>{icon}</Text>}
      {loading
        ? <ActivityIndicator color={textColor} size="small" />
        : <Text style={{ fontFamily: F.bold, fontSize: fs(14), color: outline ? color : textColor }}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

// ── Input ─────────────────────────────────────────────────────────
export function Input({ label, value, onChangeText, placeholder, secureTextEntry, multiline, minHeight, keyboardType, autoCapitalize, dark = false, style }) {
  return (
    <View style={{ marginBottom: vs(12) }}>
      {label && (
        <Text style={{ fontFamily: F.semibold, fontSize: fs(10), color: dark ? C.muted : C.textSub, marginBottom: vs(5), letterSpacing: 0.5 }}>
          {label.toUpperCase()}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={dark ? "rgba(175,169,236,0.4)" : "#C0BDD4"}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "sentences"}
        style={[{
          backgroundColor: dark ? "rgba(255,255,255,0.07)" : C.surface,
          borderWidth: 1,
          borderColor: dark ? "rgba(255,255,255,0.14)" : C.border,
          borderRadius: R.md,
          paddingVertical: vs(12),
          paddingHorizontal: rs(14),
          fontSize: fs(14),
          color: dark ? C.white : C.text,
          fontFamily: F.regular,
          minHeight: minHeight ? vs(minHeight) : undefined,
          textAlignVertical: multiline ? "top" : "center",
        }, style]}
      />
    </View>
  );
}

// ── Card ──────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <View style={[{
      backgroundColor: C.white,
      borderRadius: R.lg,
      borderWidth: 1,
      borderColor: C.border,
      padding: rs(14),
    }, style]}>
      {children}
    </View>
  );
}

// ── Pill / Tag ────────────────────────────────────────────────────
export function Tag({ label, bg, color }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: R.full, paddingVertical: vs(3), paddingHorizontal: rs(10) }}>
      <Text style={{ fontFamily: F.semibold, fontSize: fs(10), color }}>{label}</Text>
    </View>
  );
}

// ── Section Title ─────────────────────────────────────────────────
export function SectionTitle({ title, action, onAction }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: vs(10), marginTop: vs(4) }}>
      <Text style={{ fontFamily: F.bold, fontSize: fs(14), color: theme.text }}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ fontFamily: F.semibold, fontSize: fs(12), color: C.primary }}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Empty State ───────────────────────────────────────────────────
export function Empty({ emoji, title, sub, onAction, actionLabel }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: vs(40), paddingHorizontal: rs(24) }}>
      <Text style={{ fontSize: fs(48), marginBottom: vs(12) }}>{emoji}</Text>
      <Text style={{ fontFamily: F.bold, fontSize: fs(16), color: theme.text, marginBottom: vs(6), textAlign: "center" }}>{title}</Text>
      <Text style={{ fontFamily: F.regular, fontSize: fs(13), color: theme.textSub, textAlign: "center", lineHeight: vs(20), marginBottom: vs(20) }}>{sub}</Text>
      {onAction && (
        <Btn label={actionLabel} onPress={onAction} color={C.primary} style={{ paddingHorizontal: rs(28) }} />
      )}
    </View>
  );
}

// ── Bottom Sheet Modal ────────────────────────────────────────────
export function Sheet({ visible, onClose, title, children, style }) {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <View style={[{ backgroundColor: theme.sheetBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: rs(20), paddingBottom: vs(36) }, style]}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: theme.border, alignSelf: "center", marginBottom: vs(16) }} />
          {title && <Text style={{ fontFamily: F.bold, fontSize: fs(17), color: theme.text, marginBottom: vs(16) }}>{title}</Text>}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────
export function ProgressBar({ pct, color, bg, height = 6 }) {
  return (
    <View style={{ height, borderRadius: R.full, backgroundColor: bg || C.border, overflow: "hidden" }}>
      <View style={{ width: `${Math.min(pct, 100)}%`, height: "100%", borderRadius: R.full, backgroundColor: color }} />
    </View>
  );
}

// ── Avatar initials ───────────────────────────────────────────────
export function Avatar({ name = "", size = 40, bg = C.primaryLight, color = C.primary }) {
  const initials = name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size/2, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontFamily: F.bold, fontSize: fs(size * 0.36), color }}>{initials || "?"}</Text>
    </View>
  );
}

// ── Divider ───────────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: rs(10), marginVertical: vs(10) }}>
      <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
      {label && <Text style={{ fontFamily: F.regular, fontSize: fs(12), color: C.textSub }}>{label}</Text>}
      <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
    </View>
  );
}

// ── Time ago ──────────────────────────────────────────────────────
export function timeAgo(ts) {
  if (!ts) return "";
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}
