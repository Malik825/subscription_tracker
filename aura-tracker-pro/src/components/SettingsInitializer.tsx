
import { useEffect, ReactNode } from 'react';
import { useSettings } from '@/hooks/use-settings';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/theme/theme-provider';

interface SettingsInitializerProps {
  children: ReactNode;
}

export default function SettingsInitializer({ children }: SettingsInitializerProps) {
  const { isAuthenticated } = useAuth();
  const { settings, preferences, isLoading } = useSettings();
  const { syncFromBackend } = useTheme();

  useEffect(() => {
    // Only sync when authenticated and settings are loaded
    if (!isAuthenticated || isLoading || !settings || !preferences) return;

    // ✅ Sync backend theme to local (one-way, on mount only)
    const isDarkMode = preferences.darkMode ?? true;
    syncFromBackend(isDarkMode);

    // Handle other preferences
    const currency = preferences.currency || 'USD';
    localStorage.setItem('preferred-currency', currency);

    const language = preferences.language || 'en';
    localStorage.setItem('preferred-language', language);
    document.documentElement.lang = language;

  }, [isAuthenticated, isLoading]); // ✅ Only run when auth/loading changes

  return <>{children}</>;
}
