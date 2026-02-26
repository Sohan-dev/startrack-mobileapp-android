import {put, call, takeLatest} from 'redux-saga/effects';
import constants from '../Utils/constants';
import {AUTH, TOKEN, PROFILE, ENQUIRY} from '../redux/store/TypeConstants';
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
} from './setup/method';

function* getEnquiry(action) {
  try {
    let response = yield call(
      GET,
      `enquiry-list`,
      yield getToken(),
    );

    // if (response.next !== null) {
    //   let sPgNo = response.next.split('=').pop();
    //   yield put({
    //     type: ENQUIRY.GET_ENQUIRY_LIST_SUCCESS.type,
    //     data: {
    //       [ENQUIRY.GET_ENQUIRY_LIST_SUCCESS.value]: response,
    //       currentPage: parseInt(sPgNo) - 1,
    //       totalPage: Math.ceil(response.count / 10),
    //     },
    //   });
    // } else {
    //   let sPgNo = response.previous.split('=').pop();
    //   yield put({
    //     type: ENQUIRY.GET_ENQUIRY_LIST_SUCCESS.type,
    //     data: {
    //       [ENQUIRY.GET_ENQUIRY_LIST_SUCCESS.value]: response,
    //       currentPage: parseInt(sPgNo) + 1,
    //       totalPage: Math.ceil(response.count / 10),
    //     },
    //   });
    // }

    yield put({
      type: ENQUIRY.GET_ENQUIRY_LIST_SUCCESS.type,
      data: {
        [ENQUIRY.GET_ENQUIRY_LIST_SUCCESS.value]: response,
      },
    });
  } catch (error) {
    yield put({
      type: ENQUIRY.GET_ENQUIRY_LIST_FAILURE.type,
      data: {error: error},
    });
  }
}

function* getServiceList() {
  try {
    let response = yield call(
      GET,
      `services`,
      yield getToken(),
    );

    yield put({
      type: ENQUIRY.GET_SERVICE_LIST_SUCCESS.type,
      data: {
        [ENQUIRY.GET_SERVICE_LIST_SUCCESS.value]: response,
        
      },
    });
  } catch (error) {
    yield put({
      type: ENQUIRY.GET_SERVICE_LIST_FAILURE.type,
      data: {error: error},
    });
  }
}

function* createEnquiry(action) {
  try {
    yield call(
      POST_SET,
      ENQUIRY.CREATE_ENQUIRY_SUCCESS,
      ENQUIRY.CREATE_ENQUIRY_FAILURE,
      'add-enquiry',
      action.payload,
    );
  } catch (error) {
    yield put({
      type: ENQUIRY.CREATE_ENQUIRY_FAILURE,
      data: {error: error},
    });
  }
}

// function* getEnquiryById(action) {
//   try {
//     yield call(
//       GET_SET,
//       ENQUIRY.GET_POST_BY_ID_SUCCESS,
//       ENQUIRY.GET_POST_BY_ID_FAILURE,
//       `posts/${action.payload}/`,
//     );
//   } catch (error) {
//     yield put({
//       type: ENQUIRY.GET_POST_BY_ID_FAILURE,
//       data: {error: error},
//     });
//   }
// }

// function* deletePost(action) {
//   try {
//     yield call(
//       DELETE_SET,
//       ENQUIRY.DELETE_POST_SUCCESS,
//       ENQUIRY.DELETE_POST_FAILURE,
//       `posts/${action.payload}/`,
//     );
//   } catch (error) {
//     yield put({
//       type: ENQUIRY.DELETE_POST_FAILURE,
//       data: {error: error},
//     });
//   }
// }

// function* editPost(action) {
//   try {
//     yield call(
//       PATCH_SET,
//       ENQUIRY.EDIT_POST_SUCCESS,
//       ENQUIRY.EDIT_POST_FAILURE,
//       `posts/${action.payload.id}/`,
//       action.payload,
//     );
//   } catch (error) {
//     yield put({
//       type: ENQUIRY.DELETE_POST_FAILURE,
//       data: {error: error},
//     });
//   }
// }

export default {
  source: [
    (function* () {
      yield takeLatest(ENQUIRY.GET_ENQUIRY_LIST_REQUEST.type, getEnquiry);
    })(),

    (function* () {
      yield takeLatest(ENQUIRY.CREATE_ENQUIRY_REQUEST.type, createEnquiry);
    })(),

    (function* () {
      yield takeLatest(ENQUIRY.GET_SERVICE_LIST_REQUEST.type, getServiceList);
    })(),
    // (function* () {
    //   yield takeLatest(ENQUIRY.DELETE_POST_REQUEST.type, deletePost);
    // })(),
    // (function* () {
    //   yield takeLatest(ENQUIRY.EDIT_POST_REQUEST.type, editPost);
    // })(),
  ],
};
