import { useGetSettingsQuery } from '@/api/settingsApi';
import { useMemo } from 'react';

// Define proper types for notification settings
interface NotificationSettings {
  emailDigest?: boolean;
  pushNotifications?: boolean;
  renewalReminders?: boolean;
  marketingEmails?: boolean;
  paymentAlerts?: boolean;
  spendingInsights?: boolean;
  priceChangeAlerts?: boolean;
  productUpdates?: boolean;
  deliveryMethods?: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  };
  renewalReminderTiming?: string;
  [key: string]: boolean | string | object | undefined; // Index signature for dynamic access
}

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
  notifications?: NotificationSettings;
  billing?: {
    plan?: string;
    billingCycle?: string;
    status?: string;
  };
}

type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'NGN' | 'GHS' | 'KES' | 'ZAR';

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

  const settings = useMemo(() => settingsData?.data as Settings | undefined, [settingsData]);

  // Extract commonly used settings for easy access
  const profile = useMemo(() => settings?.profile || {}, [settings]);
  const preferences = useMemo(() => settings?.preferences || {}, [settings]);
  const notifications = useMemo(() => settings?.notifications || {}, [settings]);
  const billing = useMemo(() => settings?.billing || {}, [settings]);

  // Helper functions
  const getDarkMode = () => preferences?.darkMode ?? true;
  const getCurrency = (): CurrencyCode => (preferences?.currency as CurrencyCode) || 'USD';
  const getLanguage = () => preferences?.language || 'en';
  const getCurrencySymbol = () => {
    const symbols: Record<CurrencyCode, string> = {
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

  const isNotificationEnabled = (type: string): boolean => {
    if (!notifications) return false;
    const value = notifications[type];
    return typeof value === 'boolean' ? value : false;
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