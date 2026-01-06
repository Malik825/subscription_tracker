import { useEffect, ReactNode } from 'react';
import { useSettings } from '@/hooks/use-settings';
import { useAuth } from '@/hooks/useAuth';

interface SettingsInitializerProps {
  children: ReactNode;
}

/**
 * Component that initializes and synchronizes user settings
 * Should be placed high in the component tree (e.g., in App.jsx)
 */
export default function SettingsInitializer({ children }: SettingsInitializerProps) {
  const { isAuthenticated } = useAuth();
  const { settings, preferences, isLoading } = useSettings();

  useEffect(() => {
    // Only apply settings if user is authenticated and settings are loaded
    if (!isAuthenticated || isLoading || !settings) return;

    // Apply dark mode
    const isDarkMode = preferences?.darkMode ?? true;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Store currency in localStorage for quick access
    const currency = preferences?.currency || 'USD';
    localStorage.setItem('preferred-currency', currency);

    // Store language preference
    const language = preferences?.language || 'en';
    localStorage.setItem('preferred-language', language);
    document.documentElement.lang = language;

  }, [isAuthenticated, settings, preferences, isLoading]);

  return <>{children}</>;
}