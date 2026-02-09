import { useState, useEffect, useCallback } from "react";

export interface NotificationPreferences {
  nudges: boolean;
  shopping: boolean;
  meals: boolean;
  expenses: boolean;
  calendar: boolean;
}

const STORAGE_KEY = "notification_preferences";

const DEFAULT_PREFERENCES: NotificationPreferences = {
  nudges: true,
  shopping: true,
  meals: true,
  expenses: true,
  calendar: true,
};

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const togglePreference = useCallback((key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const isEnabled = useCallback(
    (key: keyof NotificationPreferences) => preferences[key],
    [preferences]
  );

  return { preferences, togglePreference, isEnabled };
};
