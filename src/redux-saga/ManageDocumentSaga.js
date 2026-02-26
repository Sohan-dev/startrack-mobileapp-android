import {put, call, takeLatest} from 'redux-saga/effects';
import {MANAGE_DOCUMENT} from '../redux/store/TypeConstants';
import {POST_SET, GET, GET_SET, POST, getToken} from './setup/method';

function* getDocumentList(action) {
  try {
    let response = yield call(
      GET,
      `users/?page=${action.payload ? action.payload : 1}`,
      yield getToken(),
    );

    if (response.next !== null) {
      let page_no = response.next.slice(response.next.length - 1);
      yield put({
        type: MANAGE_DOCUMENT.MANAGE_DOCUMENT_LIST_SUCCESS.type,
        data: {
          [MANAGE_DOCUMENT.MANAGE_DOCUMENT_LIST_SUCCESS.value]: response,
          currentPage: parseInt(page_no) - 1,
          nextPage: parseInt(page_no),
        },
      });
    } else {
      yield put({
        type: MANAGE_DOCUMENT.MANAGE_DOCUMENT_LIST_SUCCESS.type,
        data: {
          [MANAGE_DOCUMENT.MANAGE_DOCUMENT_LIST_SUCCESS.value]: response,
          nextPage: null,
        },
      });
    }
  } catch (error) {
    yield put({
      type: MANAGE_DOCUMENT.MANAGE_DOCUMENT_LIST_FAILURE.type,
      data: {error: error},
    });
  }
}

export default {
  source: [
    (function* () {
      yield takeLatest(
        MANAGE_DOCUMENT.MANAGE_DOCUMENT_LIST_REQUEST.type,
        getDocumentList,
      );
    })(),
  ],
};
