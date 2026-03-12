import { useState, useEffect, useCallback, useRef } from "react";
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
    if (stored === null) return false;
    return stored === "true";
  });
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    isTrial: false,
    subscriptionEnd: null,
    loading: true,
  });
  const lastCheckedSessionRef = useRef<string | null>(null);
  const checkInFlightRef = useRef(false);

  const toggleTestMode = useCallback((enabled: boolean) => {
    setTestMode(enabled);
    localStorage.setItem(STRIPE_TEST_MODE_KEY, String(enabled));
    lastCheckedSessionRef.current = null; // force recheck
  }, []);

  const checkSubscription = useCallback(async () => {
    if (!session) {
      if (!user) {
        setState({ subscribed: false, isTrial: false, subscriptionEnd: null, loading: false });
      }
      return;
    }

    // Deduplicate: skip if same session token already checked
    const tokenKey = session.access_token;
    if (checkInFlightRef.current) return;
    
    checkInFlightRef.current = true;
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        body: { testMode },
      });
      if (error) throw error;

      lastCheckedSessionRef.current = tokenKey;
      setState({
        subscribed: data.subscribed ?? false,
        isTrial: data.is_trial ?? false,
        subscriptionEnd: data.subscription_end ?? null,
        loading: false,
      });
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    } finally {
      checkInFlightRef.current = false;
    }
  }, [session, user, testMode]);

  const startCheckout = async (priceId?: string) => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId, testMode },
    });
    if (error) throw error;
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  const openPortal = async (): Promise<string | null> => {
    const { data, error } = await supabase.functions.invoke("customer-portal", {
      body: { testMode },
    });
    console.log("[openPortal] response:", JSON.stringify(data), "error:", error);
    if (error) throw error;
    if (data?.url) {
      return data.url;
    }
    return null;
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
