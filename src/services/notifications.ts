import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const CHANNEL_ID = 'daily-reminders';
const REMINDER_SOURCE = 'mymonthly-daily-reminder';

const reminders = [
  {
    hour: 9,
    minute: 0,
    title: '🌤️ Bom dia!',
    body: 'Já registrou as transações de hoje? Comece o dia com o controle total do seu bolso! 💰',
  },
  {
    hour: 13,
    minute: 0,
    title: 'Boa tarde! 👋',
    body: 'Atualize suas transações e mantenha o MyMonthly em dia. Organização é poder! 📊',
  },
  {
    hour: 20,
    minute: 0,
    title: '🌙 Boa noite!',
    body: 'Feche o dia registrando seus gastos e veja seu mês se transformar! ✅',
  },
] as const;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function configureDailyReminders(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Lembretes diários',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  if (!(await ensurePermission())) return false;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const existingReminders = scheduled.filter(
    ({ content }) => content.data?.source === REMINDER_SOURCE,
  );

  await Promise.all(
    existingReminders.map(({ identifier }) =>
      Notifications.cancelScheduledNotificationAsync(identifier),
    ),
  );

  await Promise.all(
    reminders.map((reminder) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          data: { source: REMINDER_SOURCE, hour: reminder.hour },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: reminder.hour,
          minute: reminder.minute,
          channelId: CHANNEL_ID,
        },
      }),
    ),
  );

  return true;
}
