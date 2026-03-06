import React, { useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import showErrorAlert from './Toast';

// ── Approver emails ───────────────────────────────────────────────────────
// Users with these emails will automatically get 'approver' role
const APPROVER_EMAILS = [
  'aparesh@startrackautomation.in',
  'manoj@startrackautomation.in',
  'amit@startrackautomation.in',
  'shubhankarkoner.sta@gmail.com',
];

const GoogleLoginButton = props => {
  function onSuccess(data) {
    if (props.onSuccess) props.onSuccess(data);
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
      const role = APPROVER_EMAILS.includes(user.email?.toLowerCase())
        ? 'approver'
        : 'employee';

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
            lastLogin: user?.metadata?.lastSignInTime,
            createdAt: user?.metadata?.creationTime,
            role: role,
          },
          { merge: true },
        );
      // showErrorAlert("Fi")
      console.log('User saved ✅ Role:', role);
      onSuccess(user);
    } catch (error) {
      console.log('Firestore save error:', error);
    }
  };

  // const saveUserToFirestore = async user => {
  //   try {
  //     const existingUser = await firestore()
  //       .collection('users')
  //       .doc(user.uid)
  //       .get();

  //     console.log('User email from Google:', JSON.stringify(user.email));
  //     console.log('APPROVER_EMAILS list:', JSON.stringify(APPROVER_EMAILS));
  //     console.log(
  //       'Email match:',
  //       APPROVER_EMAILS.includes(user.email?.toLowerCase()),
  //     );

  //     let role = 'employee';
  //     if (existingUser.exists) {
  //       // Keep existing role — never overwrite
  //       role = existingUser.data()?.role || 'employee';
  //     } else {
  //       // New user — assign role by email
  //       role = APPROVER_EMAILS.includes(user.email?.toLowerCase())
  //         ? 'approver'
  //         : 'employee';
  //     }

  //     await firestore()
  //       .collection('users')
  //       .doc(user.uid)
  //       .set(
  //         {
  //           uid: user.uid,
  //           displayName: user.displayName || '',
  //           email: user.email || '',
  //           photoURL: user.photoURL || '',
  //           phoneNumber: user.phoneNumber || '',
  //           lastLogin: user?.metadata?.lastSignInTime,
  //           createdAt: user?.metadata?.creationTime,
  //           role: role, // ✅ role saved here
  //         },
  //         { merge: true },
  //       );

  //     console.log(`User saved ✅ Role: ${role}`);
  //     onSuccess(user);
  //   } catch (error) {
  //     console.log('Firestore save error:', error);
  //   }
  // };

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (!response?.data) {
        Alert.alert('Error', 'No data from Google');
        return;
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        Alert.alert('Error', 'Failed to get Google token');
        return;
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );

      showErrorAlert('Login Successful');

      console.log('Firebase session created ✅');
      await saveUserToFirestore(userCredential.user);
    } catch (error) {
      console.log('Sign-in error:', error);
      if (error?.code) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('Cancelled by user');
            break;
          case statusCodes.IN_PROGRESS:
            Alert.alert('Please wait', 'Sign-in already in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Error', 'Google Play Services not available');
            break;
          default:
            Alert.alert('Sign-In Error', error?.message || 'Unexpected error');
        }
      } else {
        Alert.alert('Error', error?.message || 'Unexpected error');
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
