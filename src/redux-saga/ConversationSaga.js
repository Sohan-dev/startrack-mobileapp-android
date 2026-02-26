import {put, call, takeLatest} from 'redux-saga/effects';
import {CONVERSATION} from '../redux/store/TypeConstants';
import {
  POST_SET,
  GET,
  GET_SET,
  POST,
  getToken,
  json_data,
  form_data,
  POST_FORM,
} from './setup/method';

function* getConversationList() {
  try {
    let response = yield call(GET, `conversation-list`, yield getToken());

    yield put({
      type: CONVERSATION.CONVERSATION_LIST_SUCCESS.type,
      data: {
        [CONVERSATION.CONVERSATION_LIST_SUCCESS.value]: response,
      },
    });
  } catch (error) {
    yield put({
      type: CONVERSATION.CONVERSATION_LIST_FAILURE.type,
      data: {error: error},
    });
  }
}

function* getConversationDetails(action) {
  try {
    let response = yield call(
      GET,
      `conversation-details?conversation_id=${action.payload}`,
      yield getToken(),
    );

    yield put({
      type: CONVERSATION.CONVERSATION_DETAILS_SUCCESS.type,
      data: {
        [CONVERSATION.CONVERSATION_DETAILS_SUCCESS.value]: response,
      },
    });
  } catch (error) {
    yield put({
      type: CONVERSATION.CONVERSATION_DETAILS_FAILURE.type,
      data: {error: error},
    });
  }
}

function* saveConversationReply(action) {
  try {
    yield call(
      POST_FORM,
      CONVERSATION.CONVERSATION_REPLY_SUCCESS,
      CONVERSATION.CONVERSATION_REPLY_FAILURE,
      'conversation-reply',
      action.payload,
    );
  } catch (error) {
    yield put({
      type: CONVERSATION.CONVERSATION_REPLY_FAILURE,
      data: {error: error},
    });
  }
}

function* createConversation(action) {
  try {
    yield call(
      POST_SET,
      CONVERSATION.CREATE_CONVERSATION_SUCCESS,
      CONVERSATION.CREATE_CONVERSATION_FAILURE,
      'generate-new-conversation',
      action.payload,
    );
  } catch (error) {
    yield put({
      type: CONVERSATION.CREATE_CONVERSATION_FAILURE,
      data: {error: error},
    });
  }
}

function* selectedConversationdetails(action) {
  try {
    yield put({
      type: CONVERSATION.SELECTED_CONVERSATION_DETAILS_SUCCESS.type,
      data: {
        [CONVERSATION.SELECTED_CONVERSATION_DETAILS_SUCCESS.value]:
          action.payload,
      },
    });
  } catch (error) {
    yield put({
      type: CONVERSATION.SELECTED_CONVERSATION_DETAILS_FAILURE,
      data: {error: error},
    });
  }
}

export default {
  source: [
    (function* () {
      yield takeLatest(
        CONVERSATION.CONVERSATION_LIST_REQUEST.type,
        getConversationList,
      );
    })(),
    (function* () {
      yield takeLatest(
        CONVERSATION.CREATE_CONVERSATION_REQUEST.type,
        createConversation,
      );
    })(),
    (function* () {
      yield takeLatest(
        CONVERSATION.CONVERSATION_REPLY_REQUEST.type,
        saveConversationReply,
      );
    })(),
    (function* () {
      yield takeLatest(
        CONVERSATION.CONVERSATION_DETAILS_REQUEST.type,
        getConversationDetails,
      );
    })(),
    (function* () {
      yield takeLatest(
        CONVERSATION.SELECTED_CONVERSATION_DETAILS_REQUEST.type,
        selectedConversationdetails,
      );
    })(),
  ],
};
