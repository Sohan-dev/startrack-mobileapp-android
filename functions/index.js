const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendPushNotification = functions
  .region('asia-south1')
  .firestore.document('notifications/{notifId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    if (data.sent) return null;

    const { to, title, body, data: payload } = data;

    if (!to) {
      await snap.ref.update({
        sent: false,
        error: 'No FCM token',
        sentAt: Date.now(),
      });
      return null;
    }

    const message = {
      token: to,
      notification: { title: title || 'StarTrack', body: body || '' },
      data: { screen: payload?.screen || '' },
      android: {
        priority: 'high',
        notification: { sound: 'default', channelId: 'startrack_channel' },
      },
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('✅ Notification sent:', response);
      await snap.ref.update({
        sent: true,
        sentAt: Date.now(),
        msgId: response,
      });
      return response;
    } catch (error) {
      console.log('❌ Error:', error);
      await snap.ref.update({
        sent: false,
        error: error.message,
        sentAt: Date.now(),
      });
      return null;
    }
  });
