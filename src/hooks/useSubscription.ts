import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const STRIPE_TEST_MODE_KEY = "stripe_test_mode";

interface SubscriptionState {
  subscribed: boolean;
  isTrial: boolean;
  subscriptionEnd: string | null;
  loading: boolean;
}

export const useSubscription = () => {
  const { user, session } = useAuth();
  const [testMode, setTestMode] = useState(() => {
    const stored = localStorage.getItem(STRIPE_TEST_MODE_KEY);
    if (stored === null) return false; // default to live mode
    return stored === "true";
  });
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    isTrial: false,
    subscriptionEnd: null,
    loading: true,
  });

  const toggleTestMode = useCallback((enabled: boolean) => {
    setTestMode(enabled);
    localStorage.setItem(STRIPE_TEST_MODE_KEY, String(enabled));
  }, []);

  const checkSubscription = useCallback(async () => {
    if (!session) {
      setState({ subscribed: false, isTrial: false, subscriptionEnd: null, loading: false });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        body: { testMode },
      });
      if (error) throw error;

      setState({
        subscribed: data.subscribed ?? false,
        isTrial: data.is_trial ?? false,
        subscriptionEnd: data.subscription_end ?? null,
        loading: false,
      });
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [session, testMode]);

  useEffect(() => {
    checkSubscription();
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const startCheckout = async (priceId?: string) => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId, testMode },
    });
    if (error) throw error;
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  };

  const openPortal = async () => {
    const { data, error } = await supabase.functions.invoke("customer-portal", {
      body: { testMode },
    });
    if (error) throw error;
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  };

  return {
    ...state,
    testMode,
    toggleTestMode,
    checkSubscription,
    startCheckout,
    openPortal,
  };
};
