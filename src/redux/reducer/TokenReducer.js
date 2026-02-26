import {TOKEN} from '../store/TypeConstants';

const initailState = {
  status: '',
  error: '',
  token: null,
  loading: true,
};

export default TokenReducer = (state = initailState, action) => {
  if (TOKEN[action.type]) {
    if (action.type.toString().endsWith('_REQUEST')) {
      return {
        ...state,
        loading: true,
        status: TOKEN[action.type].type,
      };
    }
    return {
      ...state,
      ...action.data,
      loading: false,
      status: TOKEN[action.type].type,
    };
  } else if (action.type == 'RESET') {
    return {
      status: '',
      error: '',
      token: null,
      loading: false,
    };
  } else {
    return {
      ...state,
    };
  }
};
