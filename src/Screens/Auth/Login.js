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
// import GoogleLoginButton from '../../Utils/GoogleLogin';
import GoogleLoginButton from '../../Utils/GoogleLoginButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import constants from '../../Utils/constants';
export default function Login(props) {
  const [token, setToken] = useState('');
  const app = getApp(); // gets default Firebase app
  const db = getFirestore(app); // Firestore instance

  const dispatch = useDispatch();
  const isDarkMode = useColorScheme() === 'dark';

  const saveLoginResp = data => {
    if (data) {
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
        </View>
      </View>
    </SafeAreaView>
  );
}
