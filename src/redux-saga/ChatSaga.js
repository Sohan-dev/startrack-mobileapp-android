import {put, call, takeLatest} from 'redux-saga/effects';
import constants from '../Utils/constants';
import {AUTH, TOKEN, PROFILE, CHAT} from '../redux/store/TypeConstants';
import {
  POST_SET,
  GET,
  GET_SET,
  POST,
  getToken,
  json_data,
  form_data,
  DELETE_SET,
  PATCH_SET,
  POST_FORM,
} from './setup/method';

function* getChatDetails(action) {
  try {
    let response = yield call(
      GET,
      `chat-details?service_settlement_id=${action.payload}`,
      yield getToken(),
    );
    yield put({
      type: CHAT.GET_CHAT_DETAILS_SUCCESS.type,
      data: {
        [CHAT.GET_CHAT_DETAILS_SUCCESS.value]: response,
      },
    });
  } catch (error) {
    yield put({
      type: CHAT.GET_CHAT_DETAILS_FAILURE.type,
      data: {error: error},
    });
  }
}

function* sendMessage(action) {
  try {
    yield call(
      POST_FORM,
      CHAT.SEND_MESSAGE_SUCCESS,
      CHAT.SEND_MESSAGE_FAILURE,
      `chat-message-send`,
      action.payload,
    );
  } catch (error) {
    yield put({
      type: CHAT.SEND_MESSAGE_FAILURE.type,
      data: {error: error},
    });
  }
}

export default {
  source: [
    (function* () {
      yield takeLatest(CHAT.GET_CHAT_DETAILS_REQUEST.type, getChatDetails);
    })(),

    (function* () {
      yield takeLatest(CHAT.SEND_MESSAGE_REQUEST.type, sendMessage);
    })(),

    // (function* () {
    //   yield takeLatest(CHAT.GET_SERVICE_LIST_REQUEST.type, getServiceList);
    // })(),
    // (function* () {
    //   yield takeLatest(CHAT.DELETE_POST_REQUEST.type, deletePost);
    // })(),
    // (function* () {
    //   yield takeLatest(CHAT.EDIT_POST_REQUEST.type, editPost);
    // })(),
  ],
};
