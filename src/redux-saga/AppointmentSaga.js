import {put, call, takeLatest} from 'redux-saga/effects';
import {APPOINTMENT} from '../redux/store/TypeConstants';
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

function* getAppointemntList() {
  try {
    let response = yield call(GET, `project-appointments`, yield getToken());

    // if (response.next !== null) {
    //   let page_no = response.next.slice(response.next.length - 1);

    //   yield put({
    //     type: APPOINTMENT.GET_APPOINTMENT_SUCCESS.type,
    //     data: {
    //       [APPOINTMENT.CREATE_APPOINTMENT_SUCCESS.value]: response,
    //       // currentPage: parseInt(page_no) - 1,
    //       // nextPage: parseInt(page_no),
    //     },
    //   });
    // } else {
    //   yield put({
    //     type: APPOINTMENT.GET_APPOINTMENT_SUCCESS.type,
    //     data: {
    //       [APPOINTMENT.GET_APPOINTMENT_SUCCESS.value]: response,
    //     },
    //   });
    // }

    yield put({
      type: APPOINTMENT.GET_APPOINTMENT_SUCCESS.type,
      data: {
        [APPOINTMENT.CREATE_APPOINTMENT_SUCCESS.value]: response,
      },
    });
  } catch (error) {
    yield put({
      type: APPOINTMENT.GET_APPOINTMENT_FAILURE.type,
      data: {error: error},
    });
  }
}

function* getCountryListByProjectID(action) {
  try {
    let response = yield call(
      GET,
      `appointment-countries?project_id=${action.payload}`,
      yield getToken(),
    );

    yield put({
      type: APPOINTMENT.GET_COUNTRY_LIST_BY_ID_SUCCESS.type,
      data: {
        [APPOINTMENT.GET_COUNTRY_LIST_BY_ID_SUCCESS.value]: response,
      },
    });
  } catch (error) {
    yield put({
      type: APPOINTMENT.GET_COUNTRY_LIST_BY_ID_FAILURE.type,
      data: {error: error},
    });
  }
}

function* getStateListByProjectID(action) {
  try {
    let response = yield call(
      GET,
      `appointment-states?country_id=${action.payload.countryId}&project_id=${action.payload.projectId}`,
      yield getToken(),
    );

    yield put({
      type: APPOINTMENT.GET_STATE_LIST_BY_ID_SUCCESS.type,
      data: {
        [APPOINTMENT.GET_STATE_LIST_BY_ID_SUCCESS.value]: response,
      },
    });
  } catch (error) {
    yield put({
      type: APPOINTMENT.GET_STATE_LIST_BY_ID_FAILURE.type,
      data: {error: error},
    });
  }
}

function* getCityListByProjectID(action) {
  try {
    let response = yield call(
      GET,
      `appointment-cities?state_id=${action.payload.state_id}&project_id=${action.payload.project_id}`,
      yield getToken(),
    );

    yield put({
      type: APPOINTMENT.GET_CITY_LIST_SUCCESS.type,
      data: {
        [APPOINTMENT.GET_CITY_LIST_SUCCESS.value]: response,
      },
    });
  } catch (error) {
    yield put({
      type: APPOINTMENT.GET_CITY_LIST_FAILURE.type,
      data: {error: error},
    });
  }
}

function* getAppointemntById(action) {
  try {
    let response = yield call(
      GET,
      `appointment-search?country_id=${action.payload.country_id}&state_id=${action.payload.state_id}&city_id=${action.payload.city_id}&project_id=${action.payload.project_id}`,
      yield getToken(),
    );

    yield put({
      type: APPOINTMENT.GET_APPOINTMENT_BY_ID_SUCCESS.type,
      data: {
        [APPOINTMENT.GET_APPOINTMENT_BY_ID_SUCCESS.value]: response,
      },
    });
  } catch (error) {
    yield put({
      type: APPOINTMENT.GET_APPOINTMENT_BY_ID_FAILURE.type,
      data: {error: error},
    });
  }
}

function* bookAppointment(action) {
  try {
    yield call(
      POST_FORM,
      APPOINTMENT.BOOK_APPOINTMENT_SUCCESS,
      APPOINTMENT.BOOK_APPOINTMENT_FAILURE,
      'book-appointment',
      action.payload,
    );
  } catch (error) {
    yield put({
      type: APPOINTMENT.BOOK_APPOINTMENT_FAILURE,
      data: {error: error},
    });
  }
}

function* getBookedAppointemntList(action) {
  try {
    let response = yield call(
      GET,
      `booked-appointments?project_id=${action.payload}`,
      yield getToken(),
    );

    // if (response.next !== null) {
    //   let page_no = response.next.slice(response.next.length - 1);

    //   yield put({
    //     type: APPOINTMENT.GET_APPOINTMENT_SUCCESS.type,
    //     data: {
    //       [APPOINTMENT.CREATE_APPOINTMENT_SUCCESS.value]: response,
    //       // currentPage: parseInt(page_no) - 1,
    //       // nextPage: parseInt(page_no),
    //     },
    //   });
    // } else {
    //   yield put({
    //     type: APPOINTMENT.GET_APPOINTMENT_SUCCESS.type,
    //     data: {
    //       [APPOINTMENT.GET_APPOINTMENT_SUCCESS.value]: response,
    //     },
    //   });
    // }

    yield put({
      type: APPOINTMENT.GET_BOOKED_APPOINTMENT_SUCCESS.type,
      data: {
        [APPOINTMENT.GET_BOOKED_APPOINTMENT_SUCCESS.value]: response,
      },
    });
  } catch (error) {
    yield put({
      type: APPOINTMENT.BOOK_APPOINTMENT_FAILURE.type,
      data: {error: error},
    });
  }
}
export default {
  source: [
    (function* () {
      yield takeLatest(
        APPOINTMENT.GET_APPOINTMENT_REQUEST.type,
        getAppointemntList,
      );
    })(),
    (function* () {
      yield takeLatest(
        APPOINTMENT.GET_APPOINTMENT_BY_ID_REQUEST.type,
        getAppointemntById,
      );
    })(),
    (function* () {
      yield takeLatest(
        APPOINTMENT.GET_COUNTRY_LIST_BY_ID_REQUEST.type,
        getCountryListByProjectID,
      );
    })(),

    (function* () {
      yield takeLatest(
        APPOINTMENT.GET_STATE_LIST_BY_ID_REQUEST.type,
        getStateListByProjectID,
      );
    })(),

    (function* () {
      yield takeLatest(
        APPOINTMENT.GET_CITY_LIST_REQUEST.type,
        getCityListByProjectID,
      );
    })(),
    (function* () {
      yield takeLatest(
        APPOINTMENT.GET_BOOKED_APPOINTMENT_REQUEST.type,
        getBookedAppointemntList,
      );
    })(),

    (function* () {
      yield takeLatest(
        APPOINTMENT.BOOK_APPOINTMENT_REQUEST.type,
        bookAppointment,
      );
    })(),
  ],
};
