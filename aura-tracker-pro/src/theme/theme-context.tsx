
import { createContext } from "react";

export type Theme = "dark" | "light" | "system";

export type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme, syncToBackend?: boolean) => void;
  resolvedTheme: "dark" | "light";
  syncFromBackend: (isDarkMode: boolean) => void; // ✅ New method
};

export const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "dark",
  syncFromBackend: () => null,
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
