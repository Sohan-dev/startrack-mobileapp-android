import {INVOICE} from '../store/TypeConstants';

const initialState = {
  status: '',
  error: '',
  loading: false,
};

const InvoiceReducer = (state = initialState, action) => {
  if (INVOICE[action.type]) {
    if (action.type.toString().endsWith('_REQUEST')) {
      return {
        ...state,
        loading: true,
        status: INVOICE[action.type].type,
      };
    }
    return {
      ...state,
      loading: false,
      ...action.data,
      status: INVOICE[action.type].type,
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
export default InvoiceReducer;
