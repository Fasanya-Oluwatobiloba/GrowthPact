// app/(auth)/login.jsx
import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { C, F, R, rs, vs, fs } from "../../constants/theme";
import { Input, Btn } from "../../components/UI";

export default function LoginScreen() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing info", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (e) {
      const msg = e.code === "auth/user-not-found" || e.code === "auth/wrong-password"
        ? "Incorrect email or password."
        : e.code === "auth/too-many-requests"
        ? "Too many attempts. Please try again later."
        : e.message;
      Alert.alert("Login failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex:1, backgroundColor:C.dark }} behavior={Platform.OS==="ios"?"padding":"height"}>
      <ScrollView contentContainerStyle={{ padding:rs(24), paddingTop:vs(70) }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems:"center", marginBottom:vs(36) }}>
          <View style={{ width:rs(52), height:rs(52), borderRadius:R.lg, backgroundColor:C.primary, alignItems:"center", justifyContent:"center", marginBottom:vs(14) }}>
            <Text style={{ fontSize:fs(28) }}>🌱</Text>
          </View>
          <Text style={{ fontFamily:F.bold, fontSize:fs(24), color:C.white, marginBottom:vs(4) }}>Welcome back</Text>
          <Text style={{ fontFamily:F.regular, fontSize:fs(13), color:C.muted }}>Sign in to continue your journey</Text>
        </View>

        <Input label="Email"    value={email}    onChangeText={setEmail}    placeholder="you@example.com" dark autoCapitalize="none" keyboardType="email-address" />
        <Input label="Password" value={password} onChangeText={setPassword} placeholder="Your password"   dark secureTextEntry />

        <Btn label="Sign in" onPress={handleLogin} loading={loading} style={{ marginTop:vs(8), marginBottom:vs(20) }} />

        <TouchableOpacity onPress={() => router.push("/(auth)/signup")} style={{ alignItems:"center" }}>
          <Text style={{ fontFamily:F.regular, fontSize:fs(13), color:C.muted }}>
            Don't have an account?{" "}
            <Text style={{ color:C.greenMint, fontFamily:F.semibold }}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
