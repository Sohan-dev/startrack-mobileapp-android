import React, { useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { DASHBOARD_NAVIGATION } from '../Navigation/route_names';

const GoogleLoginButton = props => {
  function onSuccess(data) {
    if (props.onSuccess) {
      props.onSuccess(data);
    }
  }

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '472980189663-tqeg88dfb2qv0sm9n3b4ac0j55hrk8tv.apps.googleusercontent.com', // 🔥 required
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
  }, []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log('Google User:', response);
      if (response) {
        // props.navigation.navigate(DASHBOARD_NAVIGATION.app_grid_expense_screen);
        onSuccess(response);
        console.log({ userInfo: response.data });
        // await GoogleSignin.signOut();
      } else {
        // sign in was cancelled by user
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
