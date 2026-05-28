// app/(auth)/signup.jsx
import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { createUserDoc } from "../../lib/firestore";
import { C, F, R, rs, vs, fs } from "../../constants/theme";
import { Input, Btn, Divider } from "../../components/UI";

export default function SignupScreen() {
  const router = useRouter();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [church,   setChurch]   = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Missing info", "Please fill in your name, email and password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      await createUserDoc(cred.user.uid, {
        name: name.trim(),
        email: email.trim(),
        church: church.trim(),
        photoURL: null,
      });
      router.replace("/(auth)/onboarding");
    } catch (e) {
      const msg = e.code === "auth/email-already-in-use"
        ? "An account with this email already exists."
        : e.code === "auth/invalid-email"
        ? "Please enter a valid email address."
        : e.message;
      Alert.alert("Sign up failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex:1, backgroundColor:C.dark }} behavior={Platform.OS==="ios"?"padding":"height"}>
      <ScrollView contentContainerStyle={{ padding:rs(24), paddingTop:vs(52) }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems:"center", marginBottom:vs(28) }}>
          <View style={{ width:rs(50), height:rs(50), borderRadius:R.lg, backgroundColor:C.primary, alignItems:"center", justifyContent:"center", marginBottom:vs(14) }}>
            <Text style={{ fontSize:fs(26) }}>🌱</Text>
          </View>
          <Text style={{ fontFamily:F.bold, fontSize:fs(22), color:C.white, marginBottom:vs(4) }}>Create your account</Text>
          <Text style={{ fontFamily:F.regular, fontSize:fs(13), color:C.muted }}>Join thousands growing intentionally</Text>
        </View>

        <Input label="Full name"   value={name}     onChangeText={setName}     placeholder="Your full name"           dark />
        <Input label="Email"       value={email}    onChangeText={setEmail}    placeholder="you@example.com"          dark autoCapitalize="none" keyboardType="email-address" />
        <Input label="Password"    value={password} onChangeText={setPassword} placeholder="Min. 6 characters"        dark secureTextEntry />
        <Input label="Church / Community (optional)" value={church} onChangeText={setChurch} placeholder="e.g. RCCG, Winners Chapel..." dark />

        <Btn label="Create account" onPress={handleSignup} loading={loading} style={{ marginTop:vs(8), marginBottom:vs(16) }} />

        <TouchableOpacity onPress={() => router.push("/(auth)/login")} style={{ alignItems:"center" }}>
          <Text style={{ fontFamily:F.regular, fontSize:fs(13), color:C.muted }}>
            Already have an account?{" "}
            <Text style={{ color:C.greenMint, fontFamily:F.semibold }}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
