import {all} from 'redux-saga/effects';

import TOKEN_SAGA from './TokenSaga';
import AUTH_SAGA from './AuthSaga';
import PROFILE_SAGA from './ProfileSaga';
import ENQUIRY_SAGA from './EnquirySaga';
import INVOICE_SAGA from './InvoiceSaga';
import APPOINTMENT_SAGA from './AppointmentSaga';
import MANAGE_PROJECT_SAGA from './ManageProjectSaga';
import MANAGE_DOCUMENT_SAGA from './ManageDocumentSaga';
import CHAT_SAGA from './ChatSaga';
import CONVERSATION_SAGA from './ConversationSaga';
function* RootSaga() {
  yield all([
    ...TOKEN_SAGA.source,
    ...AUTH_SAGA.source,
    ...PROFILE_SAGA.source,
    ...ENQUIRY_SAGA.source,
    ...INVOICE_SAGA.source,
    ...APPOINTMENT_SAGA.source,
    ...MANAGE_PROJECT_SAGA.source,
    ...MANAGE_DOCUMENT_SAGA.source,
    ...CHAT_SAGA.source,
    ...CONVERSATION_SAGA.source,
  ]);
}

export default RootSaga;
