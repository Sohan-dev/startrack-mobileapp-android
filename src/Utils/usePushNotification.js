import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const usePushNotification = (navigation) => {

  // ── Request Permission ──────────────────────────────────────────────────
  const requestPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Notification permission granted ✅');
      getFCMToken();
    } else {
      console.log('Notification permission denied ❌');
    }
  };

  // ── Get & Save FCM Token ────────────────────────────────────────────────
  const getFCMToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      await saveFCMToken(token);
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
  };

  // ── Save token to Firestore ─────────────────────────────────────────────
  const saveFCMToken = async (token) => {
    try {
      const uid = auth().currentUser?.uid;
      if (!uid) return;

      await firestore().collection('users').doc(uid).update({
        fcmToken: token,
        tokenUpdatedAt: Date.now(),
      });
      console.log('FCM token saved to Firestore ✅');
    } catch (error) {
      console.log('Error saving FCM token:', error);
    }
  };

  // ── Handle notification tap (app in background) ─────────────────────────
  const handleNotificationNavigation = (remoteMessage) => {
    if (!remoteMessage?.data) return;
    const { screen, expenseId } = remoteMessage.data;

    if (screen && navigation) {
      navigation.navigate(screen, expenseId ? { expenseId } : undefined);
    }
  };

  useEffect(() => {
    // 1. Request permission on mount
    requestPermission();

    // 2. Foreground notification handler
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification:', remoteMessage);
      Alert.alert(
        remoteMessage.notification?.title || 'Notification',
        remoteMessage.notification?.body || '',
      );
    });

    // 3. App opened from background by tapping notification
    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('App opened from background notification:', remoteMessage);
      handleNotificationNavigation(remoteMessage);
    });

    // 4. App opened from quit state by tapping notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from quit state notification:', remoteMessage);
          handleNotificationNavigation(remoteMessage);
        }
      });

    // 5. Token refresh handler
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
      console.log('FCM token refreshed:', token);
      saveFCMToken(token);
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
      unsubscribeTokenRefresh();
    };
  }, []);
};

export default usePushNotification;
