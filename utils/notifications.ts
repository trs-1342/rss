// utils/notifications.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true, // Added property
        shouldShowList: false,   // Added property
    }),
});

export async function requestNotificationPermission() {
    if (!Device.isDevice) return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === "granted") return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
}

// Örnek: her gün belirli saatte
export async function scheduleDailyReminder(hour: number, minute: number) {
    const hasPerm = await requestNotificationPermission();
    if (!hasPerm) return null;

    // eski planları istersen temizle
    const all = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(all.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));

    const id = await Notifications.scheduleNotificationAsync({
        content: {
            title: "RSS okuma zamanı 📚",
            body: "Eklediğin kaynaklarda yeni yazılar var, göz atmak ister misin?",
        },
        trigger: {
            type: "daily",
            hour,
            minute,
        },
    });

    return id;
}

export async function cancelAllReminders() {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(all.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}
