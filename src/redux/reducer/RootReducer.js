import {combineReducers} from 'redux';
import TokenReducer from './TokenReducer';
import AuthReducer from './AuthReducer';
import ProfileReducer from './ProfileReducer';
import EnquiryReducer from './EnquiryReducer';
import AppointmentReduer from './AppointmentReducer';
import InvoiceReducer from './InvoiceReducer';
import ManageProjectReducer from './ManageProjectReducer';
import ManageDocumentListReducer from './ManageDocumentReducer';
import ConversationReducer from './ConversationReducer';
import ChatReducer from './ChatReducer';
const allReducers = combineReducers({
  TokenReducer: TokenReducer,
  AuthReducer: AuthReducer,
  ProfileReducer: ProfileReducer,
  EnquiryReducer: EnquiryReducer,
  InvoiceReducer: InvoiceReducer,
  AppointmentReduer: AppointmentReduer,
  ManageProjectReducer: ManageProjectReducer,
  ManageDocumentListReducer: ManageDocumentListReducer,
  ChatReducer: ChatReducer,
  ConversationReducer: ConversationReducer,
});

export default rootReducer = (state, action) => {
  return allReducers(state, action);
};
