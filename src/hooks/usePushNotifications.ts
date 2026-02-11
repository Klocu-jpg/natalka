import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// This will be set from the VAPID_PUBLIC_KEY secret via edge function
// For client-side, we need the public key available
const VAPID_PUBLIC_KEY_STORAGE = "vapid_public_key";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // On iOS standalone PWA, PushManager may exist even if window.PushManager isn't directly on window
    const supported = "serviceWorker" in navigator && "Notification" in window;
    setIsSupported(supported);

    if (supported && user) {
      checkSubscription();
      fetchVapidKey();
    }
  }, [user]);

  const fetchVapidKey = async () => {
    const cached = getVapidKey();
    if (cached) return;
    try {
      const { data } = await supabase.functions.invoke("get-vapid-key");
      if (data?.vapidPublicKey) {
        setVapidKey(data.vapidPublicKey);
      }
    } catch (err) {
      console.error("Failed to fetch VAPID key:", err);
    }
  };

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch {
      setIsSubscribed(false);
    }
  };

  const getVapidKey = (): string | null => {
    return localStorage.getItem(VAPID_PUBLIC_KEY_STORAGE);
  };

  const setVapidKey = (key: string) => {
    localStorage.setItem(VAPID_PUBLIC_KEY_STORAGE, key);
  };

  const subscribe = async (): Promise<{ success: boolean; reason?: string }> => {
    if (!user) return { success: false, reason: "no_user" };

    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
      return { success: false, reason: "not_supported" };
    }

    try {
      console.log("[PUSH DEBUG] Starting subscribe flow...");
      console.log("[PUSH DEBUG] Notification.permission:", Notification.permission);
      
      // Request permission
      let perm: NotificationPermission;
      try {
        perm = await Notification.requestPermission();
      } catch {
        perm = await new Promise<NotificationPermission>((resolve) => {
          Notification.requestPermission((p) => resolve(p));
        });
      }
      console.log("[PUSH DEBUG] Permission result:", perm);
      setPermission(perm);
      if (perm !== "granted") return { success: false, reason: "denied" };

      // Register service worker
      console.log("[PUSH DEBUG] Registering service worker...");
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      console.log("[PUSH DEBUG] SW ready. pushManager exists:", !!(registration as any).pushManager);

      if (!(registration as any).pushManager) {
        return { success: false, reason: "no_push_manager" };
      }

      let key = getVapidKey();
      console.log("[PUSH DEBUG] Cached VAPID key:", key ? "yes" : "no");
      if (!key) {
        console.log("[PUSH DEBUG] Fetching VAPID key from server...");
        const { data, error: fnError } = await supabase.functions.invoke("get-vapid-key");
        console.log("[PUSH DEBUG] VAPID response:", JSON.stringify(data), "error:", fnError);
        if (data?.vapidPublicKey) {
          setVapidKey(data.vapidPublicKey);
          key = data.vapidPublicKey;
        }
      }
      if (!key) return { success: false, reason: "no_vapid" };

      console.log("[PUSH DEBUG] Subscribing to push...");
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key).buffer as ArrayBuffer,
      });
      console.log("[PUSH DEBUG] Push subscription created:", subscription.endpoint);

      const subJson = subscription.toJSON();

      console.log("[PUSH DEBUG] Saving to database...");
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: subJson.endpoint!,
          p256dh: subJson.keys!.p256dh!,
          auth: subJson.keys!.auth!,
        },
        { onConflict: "user_id,endpoint" }
      );

      if (error) {
        console.error("[PUSH DEBUG] DB error:", error);
        throw error;
      }

      console.log("[PUSH DEBUG] Success!");
      setIsSubscribed(true);
      return { success: true };
    } catch (err) {
      console.error("[PUSH DEBUG] Failed at step:", err);
      return { success: false, reason: "error" };
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error("Unsubscribe failed:", err);
    }
  };

  const sendPushToPartner = async (
    recipientId: string,
    title: string,
    body: string,
    emoji?: string
  ) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return;

      await supabase.functions.invoke("send-push", {
        body: { recipientId, title, body, emoji },
      });
    } catch (err) {
      console.error("Send push failed:", err);
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    sendPushToPartner,
  };
};
