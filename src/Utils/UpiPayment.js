import { Linking, Alert } from 'react-native';

// ── Open UPI Payment ──────────────────────────────────────────────────────
export const openUpiPayment = async ({
  upiId,
  name,
  amount,
  note = '',
  onSuccess,
  onFailure,
}) => {

  // ✅ Check if UPI ID exists
  if (!upiId || upiId.trim() === '') {
    Alert.alert(
      '❌ UPI ID Missing',
      `${name} has not added their UPI ID yet.\n\nAsk them to add it in their Profile → UPI ID.`,
      [{ text: 'OK' }]
    );
    onFailure && onFailure('no_upi_id');
    return;
  }

  // ✅ Validate amount
  const parsedAmount = parseFloat(amount);
  if (!parsedAmount || parsedAmount <= 0) {
    Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
    onFailure && onFailure('invalid_amount');
    return;
  }

  // ✅ Build UPI deep link
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId.trim())}&pn=${encodeURIComponent(name)}&am=${parsedAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;

  console.log('UPI URL:', upiUrl);

  try {
    const supported = await Linking.canOpenURL(upiUrl);

    if (supported) {
      // ✅ Open UPI app
      await Linking.openURL(upiUrl);
      onSuccess && onSuccess();
    } else {
      // ✅ No UPI app found — show install options
      Alert.alert(
        'No UPI App Found',
        'Please install Google Pay, PhonePe or Paytm to make UPI payments.',
        [
          {
            text: 'Install Google Pay',
            onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user'),
          },
          {
            text: 'Install PhonePe',
            onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.phonepe.app'),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      onFailure && onFailure('no_app');
    }
  } catch (error) {
    console.log('UPI error:', error);
    Alert.alert('UPI Error', 'Something went wrong while opening UPI app.');
    onFailure && onFailure('error');
  }
};

// ── Show Payment Confirmation Alert ──────────────────────────────────────
export const showPaymentConfirmation = ({
  name,
  amount,
  paymentMethod,
  onConfirm,
  onCancel,
}) => {
  Alert.alert(
    '💰 Confirm Payment',
    `Did you successfully pay ₹${parseFloat(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })} to ${name} via ${paymentMethod}?`,
    [
      {
        text: 'No, Cancel',
        style: 'cancel',
        onPress: () => onCancel && onCancel(),
      },
      {
        text: '✅ Yes, Done',
        onPress: () => onConfirm && onConfirm(),
      },
    ]
  );
};

// ── Open UPI and then confirm ─────────────────────────────────────────────
export const openUpiAndConfirm = ({
  upiId,
  name,
  amount,
  note = '',
  onConfirm,
}) => {
  openUpiPayment({
    upiId,
    name,
    amount,
    note,
    onSuccess: () => {
      // ✅ UPI app opened — wait for user to come back and confirm
      setTimeout(() => {
        showPaymentConfirmation({
          name,
          amount,
          paymentMethod: 'UPI',
          onConfirm,
          onCancel: () => {
            Alert.alert(
              'Payment Cancelled',
              'Payment was not confirmed. The advance will not be marked as paid.',
            );
          },
        });
      }, 1000); // small delay so UPI app opens first
    },
    onFailure: (reason) => {
      if (reason === 'no_upi_id') return; // already alerted

      // ✅ UPI failed — ask if paid manually
      Alert.alert(
        'UPI App Not Opened',
        'Could not open UPI app. Did you complete the payment manually?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Paid',
            onPress: () => onConfirm && onConfirm(),
          },
        ]
      );
    },
  });
};
