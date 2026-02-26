import {CONVERSATION} from '../store/TypeConstants';

export const getConversationList = () => ({
  type: CONVERSATION.CONVERSATION_LIST_REQUEST.type,
});
export const createConversation = payload => ({
  type: CONVERSATION.CREATE_CONVERSATION_REQUEST.type,
  payload,
});

export const getConversationReply = payload => ({
  type: CONVERSATION.CONVERSATION_REPLY_REQUEST.type,
  payload,
});
export const getConversationDetails = payload => ({
  type: CONVERSATION.CONVERSATION_DETAILS_REQUEST.type,
  payload,
});

export const getSelectedConversationDetails = payload => ({
  type: CONVERSATION.SELECTED_CONVERSATION_DETAILS_REQUEST.type,
  payload,
});
