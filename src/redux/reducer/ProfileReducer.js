import {PROFILE} from '../store/TypeConstants';

const initialState = {
  status: '',
  error: '',
  loading: false,
};

const ProfileReducer = (state = initialState, action) => {
  if (PROFILE[action.type]) {
    if (action.type.toString().endsWith('_REQUEST')) {
      return {
        ...state,
        loading: true,
        status: PROFILE[action.type].type,
      };
    }
    return {
      ...state,
      loading: false,
      ...action.data,
      status: PROFILE[action.type].type,
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

export default ProfileReducer;
