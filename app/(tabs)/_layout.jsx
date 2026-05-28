// app/(tabs)/_layout.jsx
import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { C, F, fs, vs, rs } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";

function TabIcon({ IconComponent, iconName, label, focused }) {
  const { textSub } = useTheme();
  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: rs(68), paddingTop: vs(4) }}>
      <IconComponent 
        name={iconName} 
        size={fs(19)} 
        color={focused ? C.primary : textSub} 
      />
      <Text 
        numberOfLines={1} 
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={{ 
          fontFamily: focused ? F.semibold : F.medium, 
          fontSize: fs(9), 
          color: focused ? C.primary : textSub,
          marginTop: vs(2),
          textAlign: "center",
          width: "100%"
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function TabsContent() {
  const theme = useTheme();

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { 
        backgroundColor: theme.tabBar, 
        borderTopColor: theme.border, 
        borderTopWidth: 1, 
        height: vs(55),
        paddingBottom: vs(6),
        paddingTop: vs(6),
        elevation: 0,
        shadowOpacity: 0
      },
      tabBarShowLabel: false,
    }}>
      <Tabs.Screen name="home" options={{ 
        tabBarIcon: ({ focused }) => (
          <TabIcon IconComponent={Ionicons} iconName={focused ? "home" : "home-outline"} label="Home" focused={focused} />
        ) 
      }} />
      <Tabs.Screen name="journals" options={{ 
        tabBarIcon: ({ focused }) => (
          <TabIcon IconComponent={Ionicons} iconName={focused ? "book" : "book-outline"} label="Journals" focused={focused} />
        ) 
      }} />
      <Tabs.Screen name="community" options={{ 
        tabBarIcon: ({ focused }) => (
          <TabIcon IconComponent={Ionicons} iconName={focused ? "people" : "people-outline"} label="Community" focused={focused} />
        ) 
      }} />
      <Tabs.Screen name="progress" options={{ 
        tabBarIcon: ({ focused }) => (
          <TabIcon IconComponent={MaterialCommunityIcons} iconName={focused ? "target" : "target-account"} label="Goals" focused={focused} />
        ) 
      }} />
      <Tabs.Screen name="profile" options={{ 
        tabBarIcon: ({ focused }) => (
          <TabIcon IconComponent={Ionicons} iconName={focused ? "person" : "person-outline"} label="Profile" focused={focused} />
        ) 
      }} />
    </Tabs>
  );
}

export default function TabsLayout() {
  return <TabsContent />;
}