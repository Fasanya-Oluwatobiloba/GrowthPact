import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
export const W = width;
export const H = height;

// Scale sizes relative to a 375pt base (iPhone 12 mini)
export const rs = (size) => Math.round((width / 375) * size);
export const vs = (size) => Math.round((height / 812) * size);
export const fs = (size) => Math.round((width / 375) * size); // font scale

export const C = {
  primary:      "#534AB7",
  primaryDark:  "#3C3489",
  primaryLight: "#EEEDFE",
  dark:         "#0F0D2B",
  darkCard:     "#1A1740",
  green:        "#1D9E75",
  greenLight:   "#E1F5EE",
  greenMint:    "#9FE1CB",
  pink:         "#D4537E",
  pinkLight:    "#FBEAF0",
  amber:        "#EF9F27",
  amberLight:   "#FAEEDA",
  amberGold:    "#FAC775",
  muted:        "#AFA9EC",
  surface:      "#F9F8FC",
  border:       "#EEECF5",
  text:         "#1A1A2E",
  textSub:      "#888899",
  white:        "#FFFFFF",
  blue:         "#378ADD",
  blueLight:    "#E6F1FB",
  red:          "#D85A30",
  redLight:     "#FAECE7",
  sand:         "#F1EFE8",
  sandDark:     "#444441",
};

export const F = {
  bold:    "Sora_700Bold",
  semi:    "Sora_600SemiBold",
  regular: "PlusJakartaSans_400Regular",
  medium:  "PlusJakartaSans_500Medium",
  semibold:"PlusJakartaSans_600SemiBold",
};

export const R = { sm: 8, md: 12, lg: 16, xl: 20, full: 999 };
