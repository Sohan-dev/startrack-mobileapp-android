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

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '472980189663-tqeg88dfb2qv0sm9n3b4ac0j55hrk8tv.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
  }, []);

  // ── Save user to Firestore ─────────────────────────────────────────────────
  const saveUserToFirestore = async (user) => {
    try {
      await firestore()
        .collection('users')   // 🔁 change to your collection name if different
        .doc(user.uid)
        .set(
          {
            uid:         user.uid,
            displayName: user.displayName || '',
            email:       user.email || '',
            photoURL:    user.photoURL || '',
            phoneNumber: user.phoneNumber || '',
            lastLogin:   firestore.FieldValue.serverTimestamp(),
            createdAt:   firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }  // won't overwrite existing fields
        );
      console.log('User saved to Firestore ✅');
    } catch (error) {
      console.log('Firestore save error:', error);
    }
  };

  // ── Main Sign-In ───────────────────────────────────────────────────────────
  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();

      // Step 1: Google Sign-In → get idToken
      const response = await GoogleSignin.signIn();
      const idToken = response?.data?.idToken || response?.idToken;

      if (!idToken) {
        Alert.alert('Error', 'Failed to get Google token');
        return;
      }

      // Step 2: Create Firebase credential from idToken
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Step 3: Sign in to Firebase ← THIS was missing!
      const firebaseUser = await auth().signInWithCredential(googleCredential);

      console.log('Firebase session created ✅', firebaseUser.user.uid);

      // Step 4: Save user data to Firestore
      await saveUserToFirestore(firebaseUser.user);

      // Step 5: Callback to parent (LoginScreen)
      if (props.onSuccess) {
        props.onSuccess(firebaseUser.user);
      }

    } catch (error) {
      console.log('Sign-In Error:', error);
      if (error.code) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            Alert.alert('Please wait', 'Sign in already in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Error', 'Google Play Services not available');
            break;
          default:
            Alert.alert('Error', 'Google Sign-In failed');
        }
      }
    }
  };

  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={signIn}
    />
  );
};

export default GoogleLoginButton;
