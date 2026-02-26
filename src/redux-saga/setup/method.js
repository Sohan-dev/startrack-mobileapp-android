import {select, call, put} from 'redux-saga/effects';
import {
  postApi,
  getApi,
  putApi,
  deleteApi,
  patchApi,
} from '../../Utils/ApiRequest';

export function* getToken() {
  const TokenReducer = yield select(state => state.TokenReducer);
  return TokenReducer?.token;
}

export const json_data = {
  Accept: 'application/json',
  contenttype: 'application/json',
};

export const form_data = {
  Accept: 'multipart/form-data',
  contentType: 'multipart/form-data',
};

export async function POST(URL, PAYLOAD, TOKEN, HEADER = json_data) {
  try {
    let response = await postApi(URL, PAYLOAD, TOKEN, HEADER);
    console.log('POST res', response);
    if (response?.status == 200) {
      return response?.data;
    } else {
      throw response?.data;
    }
  } catch (error) {
    console.log('err chck', error);
    throw error;
  }
}

export async function GET(URL, TOKEN, HEADER = json_data) {
  try {
    let response = await getApi(URL, TOKEN, HEADER);
    console.log(response, 'GET API RESPONSE');
    console.log('token at method', TOKEN);
    if (response?.status == 200) {
      return response?.data;
    } else {
      throw response?.data;
    }
  } catch (error) {
    console.log('ii', error);
    throw error;
  }
}

export function* GET_SET(_SUCCESS, _FAILD, URL, HEADER = json_data, TOKEN) {
  try {
    if (!TOKEN) {
      TOKEN = yield call(getToken);
    }
    let response = yield call(getApi, URL, TOKEN, HEADER);
    console.log(response);
    if (response?.status == 200) {
      yield put({
        type: _SUCCESS.type,
        data: {
          [_SUCCESS.value]: response.data,
        },
      });
    } else {
      yield put({
        type: _FAILD.type,
        data: {
          error: response.data,
        },
      });
    }
  } catch (error) {
    yield put({type: _FAILD.type, data: {error: error}});
  }
}

export function* POST_SET(
  _SUCCESS,
  _FAILD,
  URL,
  PAYLOAD,
  HEADER = json_data,
  TOKEN,
) {
  try {
    if (!TOKEN) {
      TOKEN = yield call(getToken);
    }
    let response = yield call(postApi, URL, PAYLOAD, TOKEN, HEADER);
    console.log(response, 'THE POST SET');
    if (response?.status == 200 || response?.status == 201) {
      yield put({
        type: _SUCCESS.type,
        data: {
          [_SUCCESS.value]: response.data.data
            ? response.data.data
            : response.data,
        },
      });
    } else {
      yield put({
        type: _FAILD.type,
        data: {
          error: response.data,
        },
      });
    }
  } catch (error) {
    yield put({type: _FAILD.type, data: {error: error}});
  }
}

export function* POST_FORM(
  _SUCCESS,
  _FAILD,
  URL,
  PAYLOAD,
  HEADER = form_data,
  TOKEN,
) {
  try {
    if (!TOKEN) {
      TOKEN = yield call(getToken);
    }
    let response = yield call(postApi, URL, PAYLOAD, TOKEN, HEADER);
    console.log(response, 'THE POST SET');
    if (response?.status == 200 || response?.status == 201) {
      yield put({
        type: _SUCCESS.type,
        data: {
          [_SUCCESS.value]: response.data.data
            ? response.data.data
            : response.data,
        },
      });
    } else {
      yield put({
        type: _FAILD.type,
        data: {
          error: response.data,
        },
      });
    }
  } catch (error) {
    yield put({type: _FAILD.type, data: {error: error}});
  }
}

export function* PUT_SET(
  _SUCCESS,
  _FAILD,
  URL,
  PAYLOAD,
  HEADER = json_data,
  TOKEN,
) {
  try {
    console.log('PUT SET');
    if (!TOKEN) {
      TOKEN = yield call(getToken);
    }
    let response = yield call(putApi, URL, PAYLOAD, TOKEN, HEADER);
    if (response?.status == 200 || response?.status == 201) {
      yield put({
        type: _SUCCESS.type,
        data: {
          [_SUCCESS.value]: response.data,
        },
      });
    } else {
      yield put({
        type: _FAILD.type,
        data: {
          error: response.data,
        },
      });
    }
  } catch (error) {
    yield put({type: _FAILD.type, data: {error: error}});
  }
}

export function* DELETE_SET(
  _SUCCESS,
  _FAILD,
  URL,
  PAYLOAD,
  HEADER = json_data,
  TOKEN,
) {
  try {
    console.log('DELETE SET');
    if (!TOKEN) {
      TOKEN = yield call(getToken);
    }
    let response = yield call(deleteApi, URL, TOKEN);
    console.log(response, 'line Delete 162');
    if (response?.status == 200 || response?.status == 201) {
      yield put({
        type: _SUCCESS.type,
        data: {
          [_SUCCESS.value]: response.data,
        },
      });
    } else {
      yield put({
        type: _FAILD.type,
        data: {
          error: response.data,
        },
      });
    }
  } catch (error) {
    yield put({type: _FAILD.type, data: {error: error}});
  }
}

export function* PATCH_SET(
  _SUCCESS,
  _FAILD,
  URL,
  PAYLOAD,
  HEADER = json_data,
  TOKEN,
) {
  try {
    console.log('PATCH SET');
    if (!TOKEN) {
      TOKEN = yield call(getToken);
    }
    let response = yield call(patchApi, URL, PAYLOAD, TOKEN, HEADER);
    if (response?.status == 200 || response?.status == 201) {
      yield put({
        type: _SUCCESS.type,
        data: {
          [_SUCCESS.value]: response.data,
        },
      });
    } else {
      yield put({
        type: _FAILD.type,
        data: {
          error: response.data,
        },
      });
    }
  } catch (error) {
    yield put({type: _FAILD.type, data: {error: error}});
  }
}
