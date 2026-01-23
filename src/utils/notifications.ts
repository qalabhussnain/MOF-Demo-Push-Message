import {Platform, Alert} from 'react-native';
import notifee, {AndroidImportance} from '@notifee/react-native';

/**
 * Create notification channel for Android (required for Android 8.0+)
 */
export const createNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
    console.log('Notification channel created:', channelId);
    return channelId;
  }
};

/**
 * Display notification using Notifee (works in all app states)
 * In foreground: Always use Notifee (Firebase doesn't auto-display in foreground)
 * In background/killed: Only use Notifee for data-only messages (Firebase auto-displays notification payload)
 */
export const displayNotification = async (remoteMessage: any) => {
  const {notification, data} = remoteMessage;
  
  const title = notification?.title || data?.title || 'Notification';
  const body = notification?.body || data?.body || data?.message || 'You have a new message';

  if (Platform.OS === 'android') {
    // In foreground, always display with Notifee (Firebase doesn't auto-display in foreground)
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: 'default',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        sound: 'default',
      },
      data: data || {},
    });
  } else {
    // For iOS, use Alert in foreground, system handles background/killed
    if (notification) {
      Alert.alert(
        notification.title || 'Notification',
        notification.body || 'You have a new message',
        [{text: 'OK'}],
      );
    }
  }
};

/**
 * Display notification in background/killed state
 * Only displays if message doesn't have notification payload (to avoid duplicates)
 */
export const displayBackgroundNotification = async (remoteMessage: any) => {
  const {notification, data} = remoteMessage;
  
  // If message has notification payload, Firebase will auto-display it
  // So we only display with Notifee if it's data-only
  if (notification && Platform.OS === 'android') {
    // Firebase will auto-display, so we don't need to display again
    console.log('Notification payload detected in background - Firebase will auto-display');
    return;
  }
  
  const title = notification?.title || data?.title || 'Notification';
  const body = notification?.body || data?.body || data?.message || 'You have a new message';

  if (Platform.OS === 'android') {
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: 'default',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        sound: 'default',
      },
      data: data || {},
    });
  }
};
