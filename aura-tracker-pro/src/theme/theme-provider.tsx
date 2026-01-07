
import { useEffect, useState, useContext, useCallback } from "react";
import { Theme, ThemeProviderContext } from "./theme-context";
import { useUpdatePreferencesMutation } from "@/api/settingsApi";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "subtrack-theme",
  ...props
}: ThemeProviderProps) {
  // Initialize from localStorage
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");
  const [updatePreferences] = useUpdatePreferencesMutation();

  // Apply theme to DOM
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      setResolvedTheme(systemTheme);
      return;
    }

    root.classList.add(theme);
    setResolvedTheme(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const systemTheme = e.matches ? "dark" : "light";
      setResolvedTheme(systemTheme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(systemTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Set theme with backend sync
  const setTheme = useCallback(
    async (newTheme: Theme, syncToBackend = true) => {
      // Update local state immediately (optimistic update)
      setThemeState(newTheme);
      localStorage.setItem(storageKey, newTheme);

      // Sync to backend if authenticated and enabled
      if (syncToBackend) {
        try {
          const isDarkMode = newTheme === "dark" || 
            (newTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
          
          await updatePreferences({ darkMode: isDarkMode }).unwrap();
        } catch (error) {
          // Silently fail - local state is already updated
          console.warn("Failed to sync theme to backend:", error);
        }
      }
    },
    [storageKey, updatePreferences]
  );

  // Expose method to sync from backend without triggering backend update
  const syncFromBackend = useCallback((isDarkMode: boolean) => {
    const backendTheme: Theme = isDarkMode ? "dark" : "light";
    setThemeState(backendTheme);
    localStorage.setItem(storageKey, backendTheme);
  }, [storageKey]);

  const value = {
    theme,
    setTheme,
    resolvedTheme,
    syncFromBackend, // ✅ New method for backend sync
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
