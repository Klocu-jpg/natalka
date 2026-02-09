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
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);

    if (supported) {
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
      const subscription = await registration.pushManager.getSubscription();
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

  const subscribe = async () => {
    if (!user || !isSupported) return false;

    try {
      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return false;

      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      let key = getVapidKey();
      if (!key) {
        // Try to fetch it
        const { data } = await supabase.functions.invoke("get-vapid-key");
        if (data?.vapidPublicKey) {
          setVapidKey(data.vapidPublicKey);
          key = data.vapidPublicKey;
        }
      }
      if (!key) {
        console.error("No VAPID public key available");
        return false;
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key).buffer as ArrayBuffer,
      });

      const subJson = subscription.toJSON();

      // Save to database
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: subJson.endpoint!,
          p256dh: subJson.keys!.p256dh!,
          auth: subJson.keys!.auth!,
        },
        { onConflict: "user_id,endpoint" }
      );

      if (error) throw error;

      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      return false;
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
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
