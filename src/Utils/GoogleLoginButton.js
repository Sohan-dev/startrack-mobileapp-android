import React, { useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const GoogleLoginButton = props => {
  function onSuccess(data) {
    if (props.onSuccess) {
      props.onSuccess(data);
    }
  }

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '713806015170-8v61kilunb46omim0rg9iosigi5l5rdn.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const saveUserToFirestore = async user => {
    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .set(
          {
            uid: user.uid,
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            phoneNumber: user.phoneNumber || '',
            // ✅ FIX: user.metadata exists directly on the Firebase user object
            lastLogin: user.metadata?.lastSignInTime || null,
            createdAt: user.metadata?.creationTime || null,
          },
          { merge: true },
        );
      onSuccess(user);
      console.log('User saved to Firestore ✅');
    } catch (error) {
      console.log('Firestore save error:', error);
      // ✅ FIX: Show a readable error message instead of crashing
      Alert.alert(
        'Firestore Error',
        error?.message || 'Failed to save user data',
      );
    }
  };

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log('Google Sign-In response ✌✌:', response);

      // ✅ FIX: Guard against null/undefined response
      if (!response?.data) {
        Alert.alert('Error', 'Google Sign-In returned no data');
        return;
      }

      const idToken = response?.data?.idToken;

      console.log(idToken, '🤦‍♀️🙌🙌🤦‍♀️');

      if (!idToken) {
        console.log('No idToken received ❌');
        Alert.alert('Error', 'Failed to get Google token');
        return;
      }

      // Create Firebase credential from idToken
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign in to Firebase with the Google credential
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      const firebaseUser = userCredential.user; // ✅ FIX: Correctly extract user

      console.log('Firebase session created ✅', firebaseUser.uid);

      await saveUserToFirestore(firebaseUser);
    } catch (error) {
      console.log('Sign-in error:', error);

      if (error?.code) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // User cancelled — no need to show alert
            console.log('Sign-in cancelled by user');
            break;
          case statusCodes.IN_PROGRESS:
            Alert.alert('Please wait', 'Sign-in already in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert(
              'Error',
              'Google Play Services not available or outdated',
            );
            break;
          default:
            // ✅ FIX: Alert.alert requires strings, not error objects
            Alert.alert(
              'Sign-In Error',
              error?.message || 'An unexpected error occurred',
            );
        }
      } else {
        Alert.alert('Error', error?.message || 'An unexpected error occurred');
      }
    }
  };

  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={signIn} // ✅ FIX: Pass function reference directly (cleaner)
    />
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 6,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 5,
  },
  text: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleLoginButton;
