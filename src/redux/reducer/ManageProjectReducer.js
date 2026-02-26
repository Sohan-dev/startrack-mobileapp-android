import {MANAGE_PROJECT} from '../store/TypeConstants';

const initialState = {
  status: '',
  error: '',
  loading: false,
};

const ManageProjectReducer = (state = initialState, action) => {
  if (MANAGE_PROJECT[action.type]) {
    if (action.type.toString().endsWith('_REQUEST')) {
      return {
        ...state,
        loading: true,
        status: MANAGE_PROJECT[action.type].type,
      };
    }
    return {
      ...state,
      loading: false,
      ...action.data,
      status: MANAGE_PROJECT[action.type].type,
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
export default ManageProjectReducer;
