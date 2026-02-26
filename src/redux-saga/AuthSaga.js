import { put, call, takeLatest } from 'redux-saga/effects';
import EncryptedStorage from 'react-native-encrypted-storage';
import constants from '../Utils/constants';
import { AUTH, TOKEN } from '../redux/store/TypeConstants';
import { GET, POST, getToken } from './setup/method';

function* getSignin(action) {
  try {
    let response = yield call(POST, 'client-login', action.payload, '');
    yield put({
      type: AUTH.LOGIN_SUCCESS.type,
      data: {
        [AUTH.LOGIN_SUCCESS.value]: action.payload,
        signinmessage: 'Login Successful',
      },
    });
    yield put({
      type: TOKEN.SET_TOKEN_SUCCESS.type,
      data: { [TOKEN.SET_TOKEN_SUCCESS.value]: action.payload },
    });

    yield call(
      EncryptedStorage.setItem,
      constants.TOKEN,
      JSON.stringify({ token: action.payload }),
    );
  } catch (error) {
    yield put({
      type: AUTH.LOGIN_FAILURE.type,
      data: { error: error },
    });
  }
}

function* userLogout(action) {
  try {
    console.log('token at saga', yield getToken());
    // let response = yield call(GET, 'user/logout', yield getToken());
    // console.log('logout res', response);
    yield call(EncryptedStorage.removeItem, constants.TOKEN);
    yield put({
      type: 'RESET',
    });
    yield put({
      type: AUTH.LOGOUT_SUCCESS.type,
    });
  } catch (err) {
    // console.log(err);
    yield put({
      type: AUTH.LOGOUT_FAILURE.type,
      // data: {error: error},
    });
  }
}

function* signUp(action) {
  try {
    console.log('Signup');
    let response = yield call(POST, 'client-rgstr', action.payload, '');
    console.log('res', response);
    yield put({
      type: AUTH.SIGNUP_SUCCESS.type,
      data: {
        [AUTH.SIGNUP_SUCCESS.value]: response.data,
        signupmessage: response.message,
      },
    });
  } catch (error) {
    yield put({
      type: AUTH.SIGNUP_FAILURE.type,
      data: { error: error },
    });
  }
}

function* verifyOTP(action) {
  try {
    let response = yield call(POST, 'verify-otp', action.payload, '');
    console.log('res', response);
    yield put({
      type: AUTH.OTP_VERIFY_SUCCESS.type,
      data: {
        [AUTH.OTP_VERIFY_SUCCESS.value]: response.data,
      },
    });
  } catch (error) {
    yield put({
      type: AUTH.OTP_VERIFY_FAILURE.type,
      data: { error: error },
    });
  }
}

function* resendOTP(action) {
  try {
    let response = yield call(POST, 'resend-otp', action.payload, '');
    console.log('res', response);
    yield put({
      type: AUTH.OTP_RESEND_SUCCESS.type,
      data: {
        [AUTH.OTP_RESEND_SUCCESS.value]: response.data,
      },
    });
  } catch (error) {
    yield put({
      type: AUTH.OTP_RESEND_FAILURE.type,
      data: { error: error },
    });
  }
}

function* forgotPassword(action) {
  try {
    let response = yield call(POST, 'forgot-password', action.payload, '');
    console.log('res', response);
    yield put({
      type: AUTH.FORGOT_PASSWORD_SUCCESS.type,
      data: {
        [AUTH.FORGOT_PASSWORD_SUCCESS.value]: response,
      },
    });
  } catch (error) {
    yield put({
      type: AUTH.FORGOT_PASSWORD_FAILURE.type,
      data: { error: error },
    });
  }
}

function* getCountryList() {
  try {
    let response = yield call(GET, `countries`, '');

    yield put({
      type: AUTH.GET_COUNTRY_LIST_SUCCESS.type,
      data: {
        [AUTH.GET_COUNTRY_LIST_SUCCESS.value]: response,
      },
    });
  } catch (error) {
    yield put({
      type: AUTH.GET_COUNTRY_LIST_FAILURE.type,
      data: { error: error },
    });
  }
}

export default {
  source: [
    (function* () {
      yield takeLatest(AUTH.LOGIN_REQUEST.type, getSignin);
    })(),
    (function* () {
      yield takeLatest(AUTH.LOGOUT_REQUEST.type, userLogout);
    })(),

    (function* () {
      yield takeLatest(AUTH.SIGNUP_REQUEST.type, signUp);
    })(),

    (function* () {
      yield takeLatest(AUTH.OTP_VERIFY_REQUEST.type, verifyOTP);
    })(),
    (function* () {
      yield takeLatest(AUTH.FORGOT_PASSWORD_REQUEST.type, forgotPassword);
    })(),
    (function* () {
      yield takeLatest(AUTH.GET_COUNTRY_LIST_REQUEST.type, getCountryList);
    })(),
    (function* () {
      yield takeLatest(AUTH.OTP_RESEND_REQUEST.type, resendOTP);
    })(),
  ],
};
