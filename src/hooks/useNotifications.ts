import { useState, useEffect, useCallback } from "react";

type NotificationPermission = "default" | "granted" | "denied";

export function useNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    // Check initial permission state only on the client
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setPermission("granted");
        return true;
      }
      if (Notification.permission !== "denied") {
        const result = await Notification.requestPermission();
        setPermission(result);
        return result === "granted";
      }
    }
    setPermission("denied"); // If notifications not supported or denied
    return false;
  }, []);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission !== "granted") {
        console.warn("Notification permission not granted.");
        return null;
      }
      // Check if document is hidden (tab not active)
      if (document.hidden) {
        const notification = new Notification(title, options);

        // Add onclick handler to focus window and close notification
        notification.onclick = () => {
          window.focus(); // Focus the window/tab
          notification.close(); // Close the notification
        };

        return notification;
      } else {
        console.log("Document is visible, skipping notification:", title);
        return null; // Don't show if tab is active
      }
    },
    [permission]
  );

  return { permission, requestPermission, showNotification };
}
