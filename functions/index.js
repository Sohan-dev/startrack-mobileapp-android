/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
// setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setGlobalOptions } = require('firebase-functions');
const { onRequest } = require('firebase-functions/https');
const logger = require('firebase-functions/logger');
admin.initializeApp();

exports.sendPushNotification = functions.firestore
  .document('notifications/{notifId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();

    if (!data.to) {
      console.log('No FCM token found');
      return null;
    }

    const message = {
      token: data.to,
      notification: {
        title: data.title,
        body: data.body,
      },
      data: data.data || {},
      android: {
        priority: 'high',
        notification: {
          channelId: 'default_channel',
          sound: 'default',
        },
      },
    };

    try {
      await admin.messaging().send(message);
      await snap.ref.update({ sent: true, sentAt: Date.now() });
      console.log('Notification sent ✅');
    } catch (error) {
      console.log('Error sending notification:', error);
      await snap.ref.update({ error: error.message });
    }

    return null;
  });
