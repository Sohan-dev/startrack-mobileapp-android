/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { View, Image, useColorScheme, Text } from 'react-native';
import { Images } from '../../Themes/Themes';
import normalise from '../../Utils/Dimen';
import Button from '../../Component/Button';
import { useDispatch } from 'react-redux';
import MyStatusBar from '../../Utils/StatusBar';

import { getSignIn } from '../../redux/action/AuthAction';
import { getProfile } from '../../redux/action/ProfileAction';
import showErrorAlert from '../../Utils/Toast';
import { getApp } from '@react-native-firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import EncryptedStorage from 'react-native-encrypted-storage';
import GoogleLoginButton from '../../Utils/GoogleLogin';
import { SafeAreaView } from 'react-native-safe-area-context';
import constants from '../../Utils/constants';
export default function Login(props) {
  const [token, setToken] = useState('');
  const app = getApp(); // gets default Firebase app
  const db = getFirestore(app); // Firestore instance

  const dispatch = useDispatch();
  const isDarkMode = useColorScheme() === 'dark';

  // async function retrieveUserSession() {
  //   try {
  //     const session = await EncryptedStorage.getItem(constants.USER_SESSION);

  //     if (session !== undefined) {
  //       // Congrats! You've just retrieved your first value!
  //       console.log(JSON.parse(session));
  //       let userData = JSON.parse(session);
  //       setEmail(userData.email);
  //       setPassword(userData.password);
  //       setRememberMe(true);
  //     }
  //   } catch (error) {
  //     // There was an error on the native side
  //   }
  // }

  // async function removeUserSession() {
  //   try {
  //     await EncryptedStorage.removeItem(constants.USER_SESSION);
  //     // Congrats! You've just removed your first value!
  //     console.log('removed your first value!');
  //   } catch (error) {
  //     console.log(error);
  //     // There was an error on the native side
  //   }
  // }

  // useEffect(() => {
  //   retrieveUserSession();
  // }, []);

  // const requestlocPermission = async () => {
  //   try {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS,
  //       {
  //         title: 'UIG Storage Permission',
  //         message: 'UIG needs to access your storage',
  //         buttonPositive: 'OK',
  //       },
  //     );

  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       console.log('location permission accepted');
  //     } else {
  //       console.log('location permission denied');
  //     }
  //   } catch (err) {
  //     console.warn(err);
  //   }
  // };

  const saveLoginResp = data => {
    if (data) {
      console.log(data?._user);
      dispatch(getSignIn(data?._user));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MyStatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          marginTop: normalise(50),
        }}
      >
        <Image
          source={Images.logo}
          resizeMode="contain"
          style={{
            height: normalise(200),
            width: normalise(200),
            alignSelf: 'center',
          }}
        />
        <View
          style={{
            // width: normalise(150),
            marginTop: normalise(100),
            // backgroundColor: 'tomato',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <GoogleLoginButton onSuccess={data => saveLoginResp(data)} />
          <GoogleLoginButton />

          {/* <Button
            title={'Login'}
            img={null}
            height={normalise(40)}
            width={normalise(150)}
            marginTop={normalise(40)}
            borderRadius={normalise(5)}
            backgroundColor={'#d0d2d6'}
            onPress={() =>
              props.navigation.navigate(
                DASHBOARD_NAVIGATION.app_grid_expense_screen,
              )
            }
          /> */}
          {/* <View style={{ position: 'absolute', marginBottom: 0 }}>
            <Text style={{ fontSize: 12, color: 'red' }}>
              🔥 NEW BUILD 1.0.0
            </Text>
          </View> */}
        </View>
      </View>
    </SafeAreaView>
  );
}
