import {CONVERSATION} from '../store/TypeConstants';

const initialState = {
  status: '',
  error: '',
  loading: false,
};

const ConversationReducer = (state = initialState, action) => {
  if (CONVERSATION[action.type]) {
    if (action.type.toString().endsWith('_REQUEST')) {
      return {
        ...state,
        loading: true,
        status: CONVERSATION[action.type].type,
      };
    }
    return {
      ...state,
      loading: false,
      ...action.data,
      status: CONVERSATION[action.type].type,
    };
  } else if (action.type == 'RESET') {
    return {
      status: '',
      error: '',
      loading: false,
    };
  } else {
    return {
      ...state,
    };
  }
};
export default ConversationReducer;
