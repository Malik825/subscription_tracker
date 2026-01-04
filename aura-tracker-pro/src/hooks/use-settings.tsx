import { useGetSettingsQuery } from '@/api/settingsApi';
import { useMemo } from 'react';

interface Settings {
  profile?: {
    fullName?: string;
    avatarUrl?: string;
  };
  preferences?: {
    darkMode?: boolean;
    currency?: string;
    language?: string;
  };
  notifications?: Record<string, boolean | any>;
  billing?: {
    plan?: string;
    billingCycle?: string;
    status?: string;
  };
}

/**
 * Custom hook to access user settings across the application
 * Provides centralized access to user preferences and settings
 */
export const useSettings = () => {
  const { data: settingsData, isLoading, error, refetch } = useGetSettingsQuery(undefined, {
    // Automatically refetch when component mounts or regains focus
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const settings = useMemo(() => settingsData?.data, [settingsData]);

  // Extract commonly used settings for easy access
  const profile = useMemo(() => settings?.profile || {}, [settings]);
  const preferences = useMemo(() => settings?.preferences || {}, [settings]);
  const notifications = useMemo(() => settings?.notifications || {}, [settings]);
  const billing = useMemo(() => settings?.billing || {}, [settings]);

  // Helper functions
  const getDarkMode = () => preferences?.darkMode ?? true;
  const getCurrency = () => preferences?.currency || 'USD';
  const getLanguage = () => preferences?.language || 'en';
  const getCurrencySymbol = () => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      NGN: '₦',
      GHS: '₵',
      KES: 'KSh',
      ZAR: 'R',
    };
    return symbols[getCurrency()] || '$';
  };

  const isNotificationEnabled = (type) => {
    return notifications?.[type] ?? false;
  };

  const getPlan = () => billing?.plan || 'free';
  const isPro = () => getPlan() === 'pro' || getPlan() === 'premium';
  const isTrial = () => billing?.status === 'trial';

  return {
    // Raw data
    settings,
    profile,
    preferences,
    notifications,
    billing,

    // Loading states
    isLoading,
    error,

    // Helper functions
    getDarkMode,
    getCurrency,
    getCurrencySymbol,
    getLanguage,
    isNotificationEnabled,
    getPlan,
    isPro,
    isTrial,

    // Refetch function
    refetch,
  };
};