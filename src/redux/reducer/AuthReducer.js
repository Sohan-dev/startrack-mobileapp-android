import {AUTH, Auth} from '../store/TypeConstants';

const initialState = {
  status: '',
  error: '',
  loading: false,
};

const AuthReducer = (state = initialState, action) => {
  if (AUTH[action.type]) {
    if (action.type.toString().endsWith('_REQUEST')) {
      return {
        ...state,
        loading: true,
        status: AUTH[action.type].type,
      };
    }
    return {
      ...state,
      loading: false,
      ...action.data,
      status: AUTH[action.type].type,
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

export default AuthReducer;
