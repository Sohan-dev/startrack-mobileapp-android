/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Image, useColorScheme, Text } from 'react-native';
import { Images } from '../../Themes/Themes';
import normalise from '../../Utils/Dimen';
import Button from '../../Component/Button';
import { useDispatch } from 'react-redux';
import MyStatusBar from '../../Utils/StatusBar';

import { getSignIn } from '../../redux/action/AuthAction';
import { getProfile } from '../../redux/action/ProfileAction';
// import showErrorAlert from '../../Utils/Toast';
import { AUTH } from '../../redux/store/TypeConstants';
import Status from '../../Utils/Status';
import Loader from '../../Utils/Loader';
import {
  DASHBOARD_NAVIGATION,
  DEVICE_AUTH,
} from '../../Navigation/route_names';
// import EncryptedStorage from 'react-native-encrypted-storage';
import constants from '../../Utils/constants';
// import {generateDeviceToken} from '../../Utils/FirebaseToken';
// import crashlytics from '@react-native-firebase/crashlytics';
import GoogleLoginButton from '../../Utils/GoogleLogin';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function Login(props) {
  const [token, setToken] = useState('');

  const dispatch = useDispatch();
  const isDarkMode = useColorScheme() === 'dark';
  // const AuthReducer = useSelector(state => state.AuthReducer);

  // Status(
  //   AuthReducer.status,
  //   AUTH.LOGIN_REQUEST.type,
  //   () => {
  //     if (AuthReducer?.signinResponse?.data?.profile_update_allow === '1') {
  //       props.navigation.navigate('EditProfile');
  //     }
  //   },
  //   () => {
  //     showErrorAlert(AuthReducer?.error?.message);
  //   },
  // );

  // useEffect(() => {
  //   const unsuscribe = props.navigation.addListener('focus', payload => {
  //     generateDeviceToken().then(token => {
  //       console.log('Token :', token);
  //       setToken(token);
  //     });
  //   });
  //   return () => {
  //     unsuscribe();
  //   };
  // }, []);

  // const isValid = () => {
  //   // crashlytics().crash();
  //   if (!email) {
  //     showErrorAlert('Please enter Opportunity ID.');
  //   } else if (!password) {
  //     showErrorAlert('Please enter password.');
  //   } else {
  //     if (rememberMe) {
  //       storeUserSession();
  //     } else {
  //       removeUserSession();
  //     }

  //     let loginObj = {};
  //     loginObj.opportunity_id = email;
  //     loginObj.password = password;
  //     loginObj.firebase_token = token;

  //     dispatch(getSignIn(loginObj));
  //   }
  // };

  // async function storeUserSession() {
  //   try {
  //     await EncryptedStorage.setItem(
  //       constants.USER_SESSION,
  //       JSON.stringify({
  //         email: email,
  //         password: password,
  //       }),
  //     );
  //     console.log('Congrats first value!');

  //     // Congrats! You've just stored your first value!
  //   } catch (error) {
  //     console.log(error);
  //     // There was an error on the native side
  //   }
  // }

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
    console.log(data);
    if (data) {
      dispatch(getSignIn(data));
      dispatch(getProfile(data));
      props.navigation.replace(DASHBOARD_NAVIGATION.app_grid_expense_screen);
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
