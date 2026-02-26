import {CHAT} from '../store/TypeConstants';

const initialState = {
  status: '',
  error: '',
  loading: false,
};

const CHATReducer = (state = initialState, action) => {
  if (CHAT[action.type]) {
    if (action.type.toString().endsWith('_REQUEST')) {
      return {
        ...state,
        loading: true,
        status: CHAT[action.type].type,
      };
    }
    return {
      ...state,
      loading: false,
      ...action.data,
      status: CHAT[action.type].type,
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
export default CHATReducer;
