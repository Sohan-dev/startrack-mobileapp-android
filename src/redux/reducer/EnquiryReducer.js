import {ENQUIRY} from '../store/TypeConstants';

const initialState = {
  status: '',
  error: '',
  loading: false,
};

const EnquiryReducer = (state = initialState, action) => {
  if (ENQUIRY[action.type]) {
    if (action.type.toString().endsWith('_REQUEST')) {
      return {
        ...state,
        loading: true,
        status: ENQUIRY[action.type].type,
      };
    }
    return {
      ...state,
      loading: false,
      ...action.data,
      status: ENQUIRY[action.type].type,
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
export default EnquiryReducer;
