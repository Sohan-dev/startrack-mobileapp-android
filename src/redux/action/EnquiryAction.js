import {ENQUIRY} from '../store/TypeConstants';

export const getEnquiryList = payload => ({
  type: ENQUIRY.GET_ENQUIRY_LIST_REQUEST.type,
  payload,
});

export const getServiceList = () => ({
  type: ENQUIRY.GET_SERVICE_LIST_REQUEST.type,
});

export const createEnquiry = payload => ({
  type: ENQUIRY.CREATE_ENQUIRY_REQUEST.type,
  payload,
});
