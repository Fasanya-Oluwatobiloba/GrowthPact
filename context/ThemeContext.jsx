// context/ThemeContext.jsx
import React, { createContext, useContext, useState } from "react";
import { C } from "../constants/theme";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  const theme = {
    darkMode,
    setDarkMode,
    // Fixes the "too whitish" issue by using a soft premium tint in light mode
    bg: darkMode ? "#12111A" : "#F8F9FC", 
    card: darkMode ? "#1A1926" : "#FFFFFF",
    text: darkMode ? "#FFFFFF" : C.text,
    textSub: darkMode ? "#A3A0BC" : C.textSub,
    border: darkMode ? "#262436" : "#EBE9F5",
    surface: darkMode ? "#222030" : C.surface,
    sheetBg: darkMode ? "#1A1926" : "#FFFFFF",
    inputBg: darkMode ? "#12111A" : C.surface,
    tabBar: darkMode ? "#1A1926" : "#FFFFFF",
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);