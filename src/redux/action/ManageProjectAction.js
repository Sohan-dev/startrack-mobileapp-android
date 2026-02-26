import {MANAGE_PROJECT} from '../store/TypeConstants';

export const getProjectList = () => ({
  type: MANAGE_PROJECT.MANAGE_PROJECT_LIST_REQUEST.type,
  
});

export const uploadProjectDoc = payload => ({
  type: MANAGE_PROJECT.PROJECT_UPLOAD_DOCUMENT_REQUEST.type,
  payload,
});

export const getDocByProjectId = payload => ({
  type: MANAGE_PROJECT.DOCUMENT_LIST_REQUEST.type,
  payload,
});
