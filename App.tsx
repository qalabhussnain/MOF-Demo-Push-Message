/**
 * MofDemo App
 * @format
 */

import React, {useEffect} from 'react';
import {StatusBar, useColorScheme, Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import {displayNotification, createNotificationChannel} from './src/utils/notifications';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Create notification channel for Android
    const initNotifications = async () => {
      await createNotificationChannel();
    };
    initNotifications();

    // Request notification permissions
    requestNotificationPermission();

    // Set up foreground message handler (when app is open)
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived (foreground)!', JSON.stringify(remoteMessage));
      // Display notification when app is in foreground
      await displayNotification(remoteMessage);
    });

    // Note: Background message handler is registered in index.js (must be at top level)

    // Check if app was opened from a notification (when app was closed)
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            JSON.stringify(remoteMessage),
          );
          // You can navigate to a specific screen here if needed
        }
      });

    // Handle notification when app is opened from background
    const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log(
          'Notification caused app to open from background state:',
          JSON.stringify(remoteMessage),
        );
      },
    );

    return () => {
      unsubscribeForeground();
      unsubscribeNotificationOpened();
    };
  }, []);

  const requestNotificationPermission = async () => {
    try {
      // Request Firebase messaging permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Firebase messaging authorization status:', authStatus);
      }

      // Request Notifee permission for Android (required for displaying notifications)
      if (Platform.OS === 'android') {
        await notifee.requestPermission();
        console.log('Notifee permission requested');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#000' : '#fff'}
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
