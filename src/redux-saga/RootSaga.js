import { all } from 'redux-saga/effects';

import TOKEN_SAGA from './TokenSaga';
import AUTH_SAGA from './AuthSaga';
import PROFILE_SAGA from './ProfileSaga';

function* RootSaga() {
  yield all([
    ...TOKEN_SAGA.source,
    ...AUTH_SAGA.source,
    ...PROFILE_SAGA.source,
  ]);
}

export default RootSaga;
