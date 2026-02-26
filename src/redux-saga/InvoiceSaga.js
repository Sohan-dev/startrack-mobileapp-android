import {put, call, takeLatest} from 'redux-saga/effects';
import {INVOICE} from '../redux/store/TypeConstants';
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
} from './setup/method';

function* getInvoiceList() {
  try {
    let response = yield call(GET, `invoices`, yield getToken());

    // if (response.next !== null) {
    //   yield put({
    //     type: INVOICE.GET_INVOICE_LIST_SUCCESS.type,
    //     data: {
    //       [INVOICE.GET_INVOICE_LIST_SUCCESS.value]: response,
    //     },
    //   });
    // } else {
    //   yield put({
    //     type: INVOICE.GET_INVOICE_LIST_SUCCESS.type,
    //     data: {
    //       [INVOICE.GET_INVOICE_LIST_SUCCESS.value]: response,
    //     },
    //   });
    // }

    yield put({
      type: INVOICE.GET_INVOICE_LIST_SUCCESS.type,
      data: {
        [INVOICE.GET_INVOICE_LIST_SUCCESS.value]: response,
      },
    });
  } catch (error) {
    yield put({
      type: INVOICE.GET_INVOICE_LIST_FAILURE.type,
      data: {error: error},
    });
  }
}

function* makePayment(action) {
  try {
    yield call(
      POST_SET,
      INVOICE.MAKE_PAYMRNT_SUCCESS,
      INVOICE.MAKE_PAYMRNT_FAILURE,
      'make-payment',
      action.payload,
    );
  } catch (error) {
    yield put({
      type: INVOICE.MAKE_PAYMRNT_FAILURE,
      data: {error: error},
    });
  }
}

function* getInvoiceDetails(action) {
  try {
    let response = yield call(
      GET,
      `invoice-details?invoice_id=${action.payload}`,
      yield getToken(),
    );

    yield put({
      type: INVOICE.GET_INVOICE_DETAILS_SUCCESS.type,
      data: {
        [INVOICE.GET_INVOICE_DETAILS_SUCCESS.value]: response,
      },
    });
  } catch (error) {
    yield put({
      type: INVOICE.GET_INVOICE_DETAILS_FAILURE.type,
      data: {error: error},
    });
  }
}

export default {
  source: [
    (function* () {
      yield takeLatest(INVOICE.GET_INVOICE_LIST_REQUEST.type, getInvoiceList);
    })(),
    (function* () {
      yield takeLatest(INVOICE.MAKE_PAYMRNT_REQUEST.type, makePayment);
    })(),

    (function* () {
      yield takeLatest(
        INVOICE.GET_INVOICE_DETAILS_REQUEST.type,
        getInvoiceDetails,
      );
    })(),
  ],
};
