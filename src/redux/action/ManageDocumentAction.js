import {MANAGE_DOCUMENT} from '../store/TypeConstants';

export const getDocumentList = payload => ({
  type: MANAGE_DOCUMENT.MANAGE_DOCUMENT_LIST_REQUEST.type,
  payload,
});
