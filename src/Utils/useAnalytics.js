// src/Utils/useAnalytics.js
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import auth from '@react-native-firebase/auth';

// ── Set user tracking ──────────────────────────────────────────────────
export const setUserTracking = async () => {
  try {
    const user = auth().currentUser;
    if (!user) return;

    // Analytics
    await analytics().setUserId(user.uid);
    await analytics().setUserProperties({
      email: user.email || '',
      name: user.displayName || '',
    });

    // Crashlytics
    await crashlytics().setUserId(user.uid);
    await crashlytics().setAttribute('email', user.email || '');
    await crashlytics().setAttribute('name', user.displayName || '');

    console.log('✅ User tracking set');
  } catch (error) {
    console.log('Tracking error:', error);
  }
};

// ── Log screen view ────────────────────────────────────────────────────
export const logScreen = async screenName => {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  } catch (error) {
    console.log('Screen log error:', error);
  }
};

// ── Log custom event ───────────────────────────────────────────────────
export const logEvent = async (eventName, params = {}) => {
  try {
    await analytics().logEvent(eventName, params);
  } catch (error) {
    console.log('Event log error:', error);
  }
};

// ── Log error to Crashlytics ───────────────────────────────────────────
export const logError = async (error, context = '') => {
  try {
    await crashlytics().log(context);
    await crashlytics().recordError(error);
  } catch (e) {
    console.log('Crashlytics error:', e);
  }
};

// ── Pre-built events for StarTrack ────────────────────────────────────
export const trackExpenseSubmit = amount =>
  logEvent('expense_submitted', { amount });
export const trackExpenseApproved = amount =>
  logEvent('expense_approved', { amount });
export const trackExpenseRejected = () => logEvent('expense_rejected');
export const trackAdvanceRequested = amount =>
  logEvent('advance_requested', { amount });
export const trackAdvanceApproved = amount =>
  logEvent('advance_approved', { amount });
export const trackReportGenerated = () => logEvent('report_generated');
export const trackLogin = role => logEvent('user_login', { role });
export const trackLogout = () => logEvent('user_logout');
