/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { displayBackgroundNotification } from './src/utils/notifications';

// Register background handler - MUST be at top level, not inside any component
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', JSON.stringify(remoteMessage));
  
  // If message has notification payload, Firebase will auto-display it
  // So we only display with Notifee if it's data-only to avoid duplicates
  if (remoteMessage.notification) {
    console.log('Notification payload detected - Firebase will auto-display, skipping Notifee');
    return;
  }
  
  // Display notification in background/killed state (for data-only messages)
  await displayBackgroundNotification(remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
