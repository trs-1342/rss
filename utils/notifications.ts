// utils/notifications.ts
// utils/notifications.ts
import * as Notifications from "expo-notifications";
import type { NotificationTriggerInput } from "expo-notifications";
import * as Device from "expo-device";


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});



export async function requestNotificationPermission() {
    if (!Device.isDevice) return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === "granted") return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
}

// export async function scheduleDailyReminder(hour: number, minute: number) {
//     const hasPerm = await requestNotificationPermission();
//     if (!hasPerm) return null;

//     // Tüm eski bildirimleri iptal et
//     const all = await Notifications.getAllScheduledNotificationsAsync();
//     await Promise.all(
//         all.map((n) =>
//             Notifications.cancelScheduledNotificationAsync(n.identifier)
//         )
//     );

//     const id = await Notifications.scheduleNotificationAsync({
//         content: {
//             title: "RSS okuma zamanı 📚",
//             body: "Eklediğin kaynaklarda yeni yazılar var, göz atmak ister misin?",
//         },
//         trigger: {
//             type: "calendar",
//             hour,
//             minute,
//             repeats: true,
//         },
//     });

//     return id;
// }

export async function scheduleDailyReminder(hour: number, minute: number) {
    const hasPerm = await requestNotificationPermission();
    if (!hasPerm) return null;

    // Eski planları temizle (istersen)
    const all = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
        all.map((n) =>
            Notifications.cancelScheduledNotificationAsync(n.identifier)
        )
    );

    const trigger: NotificationTriggerInput = {
        // enum değeri bekliyor, string değil:
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
    };

    const id = await Notifications.scheduleNotificationAsync({
        content: {
            title: "RSS okuma zamanı 📚",
            body: "Eklediğin kaynaklarda yeni yazılar var, göz atmak ister misin?",
        },
        trigger,
    });

    return id;
}

export async function cancelAllReminders() {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(all.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

// ⬇ BUNU DOSYANIN SONUNA EKLE
export async function notifyNewItems(sourceName: string, count: number) {
    const hasPerm = await requestNotificationPermission();
    if (!hasPerm) return;

    const title =
        count === 1
            ? `${sourceName}: Yeni bir içerik var`
            : `${sourceName}: ${count} yeni içerik`;

    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body: "RSS Reader'da yeni yazılar var, göz atmak ister misin?",
        },
        // trigger: null ⇒ hemen göster
        trigger: null,
    });
}
