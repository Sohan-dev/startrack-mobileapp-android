import {APPOINTMENT} from '../store/TypeConstants';

const initialState = {
  status: '',
  error: '',
  loading: false,
};

const AppointmentReduer = (state = initialState, action) => {
  if (APPOINTMENT[action.type]) {
    if (action.type.toString().endsWith('_REQUEST')) {
      return {
        ...state,
        loading: true,
        status: APPOINTMENT[action.type].type,
      };
    }
    return {
      ...state,
      loading: false,
      ...action.data,
      status: APPOINTMENT[action.type].type,
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
export default AppointmentReduer;
