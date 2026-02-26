import {CHAT} from '../store/TypeConstants';

export const getChatDetailsReq = payload => ({
  type: CHAT.GET_CHAT_DETAILS_REQUEST.type,
  payload,
});

export const sendChatMessage = payload => ({
  type: CHAT.SEND_MESSAGE_REQUEST.type,
  payload,
});

export const createEnquiry = payload => ({
  type: CHAT.CREATE_ENQUIRY_REQUEST.type,
  payload,
});
