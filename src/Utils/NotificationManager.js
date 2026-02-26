import {Platform} from 'react-native';
import notifee, {AndroidImportance} from '@notifee/react-native';

export default class NotificationService {
  static isAndroid = Platform.OS === 'android';

  static async displayNotification({type, ...rest}) {
    const notificationD = {...rest};
    if (this.isAndroid) {
      notificationD.android = {
        channelId: type,
      };
    } else {
      notificationD.ios = {
        categoryId: type,
      };
    }

    await notifee.displayNotification(notificationD);
  }

  static async createNotificationCategoriesOrChannel(id) {
    if (this.isAndroid) {
      await notifee.createChannel({
        id,
        name: 'United Investing Group',
        vibration: true,
        importance: AndroidImportance.HIGH,
      });
    } else {
      await notifee.setNotificationCategories([
        {
          id,
          allowAnnouncement: true,
          actions: [
            {
              id: 'enquiry',
              title: 'Enquiry Created',
              foreground: true,
            },
          ],
        },
      ]);
    }
  }

  static async resetNotificationCount() {
    try {
      await notifee.setBadgeCount(0);
    } catch (e) {
      console.log('resetNotificationCount_ERROR', e);
    }
  }

  static async incrementBadgeCount() {
    try {
      await notifee.incrementBadgeCount();
    } catch (e) {
      console.log('incrementBadgeCount_ERROR', e);
    }
  }
}
