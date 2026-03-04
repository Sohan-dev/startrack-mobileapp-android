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
        '713806015170-8v61kilunb46omim0rg9iosigi5l5rdn.apps.googleusercontent.com', // 🔥 required
      offlineAccess: true,
      // forceCodeForRefreshToken: true,
      // scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
  }, []);

  const saveUserToFirestore = async user => {
    try {
      await firestore()
        .collection('users') // 🔁 change to your collection name if different
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
          },
          { merge: true }, // won't overwrite existing fields
        );
      onSuccess(user);
      console.log('User saved to Firestore ✅');
    } catch (error) {
      console.log('Firestore save error:', error);
    }
  };

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log('Google User ✌✌:', response);
      try {
        if (response) {
          console.log('inside response logic 👌', response?.data?.idToken);
          // props.navigation.navigate(DASHBOARD_NAVIGATION.app_grid_expense_screen);
          const idToken = response?.data?.idToken;

          if (!idToken) {
            console.log('inside not idToken ❌');
            Alert.alert('Error', 'Failed to get Google token');
            return;
          }

          // Step 2: Create Firebase credential from idToken
          const googleCredential = auth.GoogleAuthProvider.credential(idToken);

          // Step 3: Sign in to Firebase ← THIS was missing!
          const firebaseUser = await auth().signInWithCredential(
            googleCredential,
          );

          console.log('Firebase session created ✅', firebaseUser.user?._user);
          await saveUserToFirestore(firebaseUser.user);

          console.log({ userInfo: response.data });
          // await GoogleSignin.signOut();
        } else {
          // sign in was cancelled by user
        }
      } catch (error) {
        Alert.alert(error);
        console.log(error);
      }
    } catch (error) {
      console.log(error);
      // Alert.alert('Error', error);
      if (error) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            break;
          default:
          // some other error happened
        }
      } else {
        // an error that's not related to google sign in occurred
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('Google User:', userInfo);

      Alert.alert('Success', `Welcome ${userInfo.user.name}`);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Google Sign-In failed');
    }
  };

  return (
    // <TouchableOpacity style={styles.button} onPress={signInWithGoogle}>
    //   <Image
    //     source={Images.google}
    //     style={{ height: 25, width: 25 }}
    //     resizeMode="contain"
    //   />
    //   <Text style={styles.text}>Sign in with Google</Text>
    // </TouchableOpacity>
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={() => {
        signIn();
      }}
      // disabled={isInProgress}
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
