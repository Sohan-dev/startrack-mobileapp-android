import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

/**
 * Send notification to approver by their display name
 */
export const sendNotificationToApprover = async (
  approverEmail,
  title,
  body,
  data = {},
) => {
  try {
    // ✅ Query by email instead of displayName — exact match guaranteed
    const snapshot = await firestore()
      .collection('users')
      .where('email', '==', approverEmail) // ✅ email match
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.log('Approver not found with email:', approverEmail);
      return;
    }

    const approverData = snapshot.docs[0].data();
    const fcmToken = approverData?.fcmToken;

    if (!fcmToken) {
      console.log('Approver has no FCM token:', approverEmail);
      return;
    }

    await firestore()
      .collection('notifications')
      .add({
        to: fcmToken,
        toUid: approverData.uid,
        fromUid: auth().currentUser?.uid || '',
        fromName: auth().currentUser?.displayName || 'Someone',
        title,
        body,
        data,
        createdAt: Date.now(),
        sent: false,
      });

    console.log('Notification queued for approver ✅:', approverEmail);
  } catch (error) {
    console.log('Error sending notification to approver:', error);
  }
};
/**
 * Send notification to current user (self)
 */
export const sendNotificationToSelf = async (title, body, data = {}) => {
  try {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    const userDoc = await firestore().collection('users').doc(uid).get();
    const fcmToken = userDoc.data()?.fcmToken;

    if (!fcmToken) {
      console.log('No FCM token for current user');
      return;
    }

    await firestore().collection('notifications').add({
      to: fcmToken,
      toUid: uid,
      fromUid: uid,
      title,
      body,
      data,
      createdAt: Date.now(),
      sent: false,
    });

    console.log('Self notification queued ✅');
  } catch (error) {
    console.log('Error sending self notification:', error);
  }
};
