import {put, call, takeLatest, take} from 'redux-saga/effects';
import EncryptedStorage from 'react-native-encrypted-storage';
import constants from '../Utils/constants';
import {AUTH, TOKEN, PROFILE, POLICY} from '../redux/store/TypeConstants';
import {
  POST_SET,
  GET,
  GET_SET,
  POST,
  getToken,
  json_data,
  form_data,
  PUT_SET,
  POST_FORM,
} from './setup/method';

function* getProfile() {
  try {
    let response = yield call(GET, `client-profile`, yield getToken());

    yield put({
      type: PROFILE.GET_PROFILE_SUCCESS.type,
      data: {
        [PROFILE.GET_PROFILE_SUCCESS.value]: response,
      },
    });
  } catch (error) {
    console.log(error);
    yield put({
      type: PROFILE.GET_PROFILE_FAILURE.type,
      data: {error: error},
    });
  }
}

function* getHomeData() {
  try {
    let response = yield call(GET, `home`, yield getToken());

    yield put({
      type: PROFILE.GET_HOME_SUCCESS.type,
      data: {
        [PROFILE.GET_HOME_SUCCESS.value]: response,
      },
    });
  } catch (error) {
    yield put({
      type: PROFILE.GET_HOME_FAILURE.type,
      data: {error: error},
    });
  }
}

function* getChatList() {
  try {
    let response = yield call(GET, `chat-list`, yield getToken());

    yield put({
      type: PROFILE.GET_CHAT_LIST_SUCCESS.type,
      data: {
        [PROFILE.GET_CHAT_LIST_SUCCESS.value]: response,
      },
    });
  } catch (error) {
    yield put({
      type: PROFILE.GET_CHAT_LIST_FAILURE.type,
      data: {error: error},
    });
  }
}

function* changePw(action) {
  try {
    let response = yield call(
      POST,
      'user/change-password',
      action.payload,
      yield getToken(),
    );
    console.log('reset pw res', response);
    yield put({
      type: PROFILE.CHANGE_PASSWORD_SUCCESS.type,
      data: {
        [PROFILE.CHANGE_PASSWORD_SUCCESS.value]: response.data,
        changepwmsg: response.message,
      },
    });
  } catch (error) {
    console.log(error);
    yield put({
      type: PROFILE.CHANGE_PASSWORD_FAILURE.type,
      data: {error: error},
    });
  }
}

function* getUpdateProfile(action) {
  try {
    yield call(
      POST_FORM,
      PROFILE.UPDATE_PROFILE_SUCCESS,
      PROFILE.UPDATE_PROFILE_FAILURE,
      `update-profile`,
      action.payload,
    );
  } catch (error) {
    yield put({
      type: PROFILE.UPDATE_PROFILE_FAILURE.type,
      data: {error: error},
    });
  }
}

function* getUpdatePayment(action) {
  try {
    yield call(
      POST_SET,
      PROFILE.GET_PAYMENT_UPDATE_SUCCESS,
      PROFILE.GET_PAYMENT_UPDATE_FAILURE,
      `user/payment/store`,
      action.payload,
    );
  } catch (error) {
    yield put({
      type: PROFILE.GET_PAYMENT_UPDATE_FAILURE.type,
      data: {error: error},
    });
  }
}

function* getStateList(action) {
  try {
    yield call(
      GET_SET,
      PROFILE.GET_STATE_LIST_SUCCESS,
      PROFILE.GET_STATE_LIST_FAILURE,
      `states?country_id=${action.payload}`,
    );
  } catch (error) {
    yield put({
      type: PROFILE.GET_STATE_LIST_REQUEST,
      data: {error: error},
    });
  }
}

function* getProfileUpdateRequest() {
  try {
    yield call(
      GET_SET,
      PROFILE.PROFILE_UPDATE_SUCCESS,
      PROFILE.PROFILE_UPDATE_SUCCESS,
      `request-profile-update`,
    );
  } catch (error) {
    yield put({
      type: PROFILE.PROFILE_UPDATE_FAILURE,
      data: {error: error},
    });
  }
}

export default {
  source: [
    (function* () {
      yield takeLatest(PROFILE.GET_PROFILE_REQUEST.type, getProfile);
    })(),
    (function* () {
      yield takeLatest(PROFILE.CHANGE_PASSWORD_REQUEST.type, changePw);
    })(),
    (function* () {
      yield takeLatest(PROFILE.UPDATE_PROFILE_REQUEST.type, getUpdateProfile);
    })(),
    (function* () {
      yield takeLatest(PROFILE.GET_STATE_LIST_REQUEST.type, getStateList);
    })(),
    (function* () {
      yield takeLatest(
        PROFILE.PROFILE_UPDATE_REQUEST.type,
        getProfileUpdateRequest,
      );
    })(),
    (function* () {
      yield takeLatest(
        PROFILE.GET_PAYMENT_UPDATE_REQUEST.type,
        getUpdatePayment,
      );
    })(),
    (function* () {
      yield takeLatest(PROFILE.GET_HOME_REQUEST.type, getHomeData);
    })(),
    (function* () {
      yield takeLatest(PROFILE.GET_CHAT_LIST_REQUEST.type, getChatList);
    })(),
  ],
};
