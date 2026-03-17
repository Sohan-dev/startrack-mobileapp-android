import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

const usePushNotification = navigation => {
  const requestPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      console.log('Notification permission granted ✅');
      getFCMToken();
    }
    // ✅ Also request notifee permission for iOS
    await notifee.requestPermission();
  };

  const getFCMToken = async () => {
    try {
      const token = await messaging().getToken();
      await saveFCMToken(token);
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
  };

  const saveFCMToken = async token => {
    try {
      const uid = auth().currentUser?.uid;
      if (!uid) return;
      await firestore().collection('users').doc(uid).update({
        fcmToken: token,
        tokenUpdatedAt: Date.now(),
      });
      console.log('FCM token saved ✅');
    } catch (error) {
      console.log('Error saving FCM token:', error);
    }
  };

  // ✅ Create notification channel (Android only)
  const createChannel = async () => {
    await notifee.createChannel({
      id: 'startrack_channel',
      name: 'StarTrack Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
  };

  // ✅ Display foreground notification using notifee
  // const displayNotification = async remoteMessage => {
  //   await createChannel();

  //   console.log('📲 Displaying notification...');

  //   await notifee.displayNotification({
  //     title: remoteMessage.notification?.title || 'StarTrack',
  //     body: remoteMessage.notification?.body || '',
  //     data: remoteMessage.data || {},
  //     android: {
  //       channelId: 'startrack_channel',
  //       importance: AndroidImportance.HIGH,
  //       smallIcon: 'ic_notification', // make sure this exists in drawable
  //       color: '#E8453C',
  //       pressAction: { id: 'default' },
  //       sound: 'default',
  //     },
  //     ios: {
  //       sound: 'default',
  //     },
  //   });
  // };

  const displayNotification = async remoteMessage => {
    try {
      await createChannel();
      console.log('📲 Displaying notification...');

      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'StarTrack',
        body: remoteMessage.notification?.body || '',
        data: remoteMessage.data || {},
        android: {
          channelId: 'startrack_channel',
          importance: AndroidImportance.HIGH,
          smallIcon: 'ic_notification', // ⚠️ this is likely the issue
          color: '#E8453C',
          pressAction: { id: 'default' },
          sound: 'default',
        },
      });

      console.log('✅ Notifee display called');
    } catch (error) {
      console.log('❌ Notifee error:', error); // ← this will show the real error
    }
  };

  const handleNotificationNavigation = data => {
    if (!data) return;
    const { screen, expenseId } = data;
    if (screen && navigation) {
      navigation.navigate(screen, expenseId ? { expenseId } : undefined);
    }
  };

  useEffect(() => {
    requestPermission();
    createChannel();

    // ✅ Foreground — display banner via notifee
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('🔔 onMessage triggered!'); // ✅ add this
      console.log('Message data:', JSON.stringify(remoteMessage));
      console.log('Foreground notification received:', remoteMessage);
      await displayNotification(remoteMessage);
    });

    // ✅ Foreground notifee event — handle tap while app is open
    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('Notifee notification pressed:', detail.notification);
        handleNotificationNavigation(detail.notification?.data);
      }
    });

    // ✅ Background — app opened from notification tap
    const unsubscribeBackground = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('App opened from background:', remoteMessage);
        handleNotificationNavigation(remoteMessage.data);
      },
    );

    // ✅ Quit state — app opened from notification tap
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from quit state:', remoteMessage);
          handleNotificationNavigation(remoteMessage.data);
        }
      });

    // ✅ Token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
      console.log('FCM token refreshed');
      saveFCMToken(token);
    });

    return () => {
      unsubscribeForeground();
      unsubscribeNotifee();
      unsubscribeBackground();
      unsubscribeTokenRefresh();
    };
  }, []);
};

export default usePushNotification;
