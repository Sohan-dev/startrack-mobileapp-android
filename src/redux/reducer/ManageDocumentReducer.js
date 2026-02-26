import {MANAGE_DOCUMENT} from '../store/TypeConstants';

const initialState = {
  status: '',
  error: '',
  loading: false,
};

const ManageDocumentListReducer = (state = initialState, action) => {
  if (MANAGE_DOCUMENT[action.type]) {
    if (action.type.toString().endsWith('_REQUEST')) {
      return {
        ...state,
        loading: true,
        status: MANAGE_DOCUMENT[action.type].type,
      };
    }
    return {
      ...state,
      loading: false,
      ...action.data,
      status: MANAGE_DOCUMENT[action.type].type,
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
export default ManageDocumentListReducer;
