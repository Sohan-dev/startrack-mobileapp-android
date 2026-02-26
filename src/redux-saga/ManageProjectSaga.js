import {put, call, takeLatest} from 'redux-saga/effects';
import {MANAGE_PROJECT} from '../redux/store/TypeConstants';
import {
  POST_SET,
  GET,
  GET_SET,
  POST,
  getToken,
  json_data,
  form_data,
  DELETE_SET,
  PUT_SET,
  POST_FORM
} from './setup/method';

function* getManageProjectList(action) {
  try {
    let response = yield call(
      GET,
      `projects`,
      yield getToken(),
    );

    yield put({
      type: MANAGE_PROJECT.MANAGE_PROJECT_LIST_SUCCESS.type,
      data: {
        [MANAGE_PROJECT.MANAGE_PROJECT_LIST_SUCCESS.value]: response,
      },
    });

    // if (response.next !== null) {
    //   // let sPgNo = response.next.split('=').pop();
    //   yield put({
    //     type: MANAGE_PROJECT.MANAGE_PROJECT_LIST_SUCCESS.type,
    //     data: {
    //       [MANAGE_PROJECT.MANAGE_PROJECT_LIST_SUCCESS.value]: response,
    //       // currentPage: parseInt(sPgNo) - 1,
    //       // totalPage: Math.ceil(response.count / 10),
    //     },
    //   });
    // } else {
    //   // let sPgNo = response.previous.split('=').pop();
    //   yield put({
    //     type: MANAGE_PROJECT.MANAGE_PROJECT_LIST_SUCCESS.type,
    //     data: {
    //       [MANAGE_PROJECT.MANAGE_PROJECT_LIST_SUCCESS.value]: response,
    //       // currentPage: parseInt(sPgNo) + 1,
    //       // totalPage: Math.ceil(response.count / 10),
    //     },
    //   });
    // }
  } catch (error) {
    yield put({
      type: MANAGE_PROJECT.MANAGE_PROJECT_LIST_FAILURE.type,
      data: {error: error},
    });
  }
}

function* getProjectDocList(action) {
 
  try {
    yield call(
      GET_SET,
      MANAGE_PROJECT.DOCUMENT_LIST_SUCCESS,
      MANAGE_PROJECT.DOCUMENT_LIST_FAILURE,
      `project-document-list`,
    );
  } catch (error) {
    yield put({
      type: MANAGE_PROJECT.DOCUMENT_LIST_FAILURE,
      data: {error: error},
    });
  }
}

function* projectUploadDocuments(action) {
  try {
    yield call(
      POST_FORM,
      MANAGE_PROJECT.PROJECT_UPLOAD_DOCUMENT_SUCCESS,
      MANAGE_PROJECT.PROJECT_UPLOAD_DOCUMENT_FAILURE,
      `project-upload-document`,
      action.payload,
    );
  } catch (error) {
    yield put({
      type: MANAGE_PROJECT.PROJECT_UPLOAD_DOCUMENT_FAILURE.type,
      data: {error: error},
    });
  }
}

export default {
  source: [
    (function* () {
      yield takeLatest(
        MANAGE_PROJECT.MANAGE_PROJECT_LIST_REQUEST.type,
        getManageProjectList,
      );
    })(),
    (function* () {
      yield takeLatest(
        MANAGE_PROJECT.DOCUMENT_LIST_REQUEST.type,
        getProjectDocList,
      );
    })(),

    (function* () {
      yield takeLatest(
        MANAGE_PROJECT.PROJECT_UPLOAD_DOCUMENT_REQUEST.type,
        projectUploadDocuments,
      );
    })(),
  ],
  
};
