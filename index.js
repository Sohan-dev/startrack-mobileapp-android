/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { Provider } from 'react-redux';
import store from './src/redux/store/index';
import notifee, { EventType } from '@notifee/react-native';

// ✅ Handle background/quit state notifications
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Background notification:', remoteMessage);
// });

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message:', remoteMessage);

  await notifee.createChannel({
    id: 'startrack_channel',
    name: 'StarTrack Notifications',
    importance: 4,
  });

  await notifee.displayNotification({
    title: remoteMessage.notification?.title || 'StarTrack',
    body: remoteMessage.notification?.body || '',
    data: remoteMessage.data || {},
    android: {
      channelId: 'startrack_channel',
      smallIcon: 'ic_notification',
      color: '#E8453C',
      pressAction: { id: 'default' },
    },
  });
});

// ✅ Handle background notifee events
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('Background notifee press:', detail.notification);
  }
});

function StarTrack() {
  // crashlytics().log('App mounted');
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

AppRegistry.registerComponent(appName, () => StarTrack);
