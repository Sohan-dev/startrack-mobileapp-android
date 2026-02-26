export const TOKEN = {
  SET_TOKEN_REQUEST: {
    type: 'SET_TOKEN_REQUEST',
    value: 'token',
  },
  SET_TOKEN_SUCCESS: {
    type: 'SET_TOKEN_SUCCESS',
    value: 'token',
  },
  SET_TOKEN_FAILURE: {
    type: 'SET_TOKEN_FAILURE',
    value: 'token',
  },

  GET_TOKEN_REQUEST: {
    type: 'GET_TOKEN_REQUEST',
    value: 'token',
  },
  GET_TOKEN_SUCCESS: {
    type: 'GET_TOKEN_SUCCESS',
    value: 'token',
  },
  GET_TOKEN_FAILURE: {
    type: 'GET_TOKEN_FAILURE',
    value: 'token',
  },
};

export const AUTH = {
  LOGIN_REQUEST: {
    type: 'LOGIN_REQUEST',
    value: 'signinResponse',
  },
  LOGIN_SUCCESS: {
    type: 'LOGIN_SUCCESS',
    value: 'signinResponse',
  },
  LOGIN_FAILURE: {
    type: 'LOGIN_FAILURE',
    value: 'signinResponse',
  },

  LOGOUT_REQUEST: {
    type: 'LOGOUT_REQUEST',
    value: 'signinResponse',
  },
  LOGOUT_SUCCESS: {
    type: 'LOGOUT_SUCCESS',
    value: 'signinResponse',
  },
  LOGOUT_FAILURE: {
    type: 'LOGOUT_FAILURE',
    value: 'signinResponse',
  },

  SIGNUP_REQUEST: {
    type: 'SIGNUP_REQUEST',
    value: 'signUpResponse',
  },
  SIGNUP_SUCCESS: {
    type: 'SIGNUP_SUCCESS',
    value: 'signUpResponse',
  },
  SIGNUP_FAILURE: {
    type: 'SIGNUP_FAILURE',
    value: 'signUpResponse',
  },

  FORGOT_PASSWORD_REQUEST: {
    type: 'FORGOT_PASSWORD_REQUEST',
    value: 'forgotpwRes',
  },
  FORGOT_PASSWORD_SUCCESS: {
    type: 'FORGOT_PASSWORD_SUCCESS',
    value: 'forgotpwRes',
  },
  FORGOT_PASSWORD_FAILURE: {
    type: 'FORGOT_PASSWORD_FAILURE',
    value: 'forgotpwRes',
  },

  FORGOT_PW_VERIFY_REQUEST: {
    type: 'FORGOT_PW_VERIFY_REQUEST',
    value: 'forgotpwVerifyRes',
  },
  FORGOT_PW_VERIFY_SUCCESS: {
    type: 'FORGOT_PW_VERIFY_SUCCESS',
    value: 'forgotpwVerifyRes',
  },
  FORGOT_PW_VERIFY_FAILURE: {
    type: 'FORGOT_PW_VERIFY_FAILURE',
    value: 'forgotpwVerifyRes',
  },

  RESET_PW_REQUEST: {
    type: 'RESET_PW_REQUEST',
    value: 'resetpwRes',
  },
  RESET_PW_SUCCESS: {
    type: 'RESET_PW_SUCCESS',
    value: 'resetpwRes',
  },
  RESET_PW_FAILURE: {
    type: 'RESET_PW_FAILURE',
    value: 'resetpwRes',
  },

  GET_CMS_REQUEST: {
    type: 'GET_CMS_REQUEST',
    value: 'cmsList',
  },
  GET_CMS_SUCCESS: {
    type: 'GET_CMS_SUCCESS',
    value: 'cmsList',
  },
  GET_CMS_FAILURE: {
    type: 'GET_CMS_FAILURE',
    value: 'cmsList',
  },

  OTP_VERIFY_REQUEST: {
    type: 'OTP_VERIFY_REQUEST',
    value: 'otpResponse',
  },
  OTP_VERIFY_SUCCESS: {
    type: 'OTP_VERIFY_SUCCESS',
    value: 'otpResponse',
  },
  OTP_VERIFY_FAILURE: {
    type: 'OTP_VERIFY_FAILURE',
    value: 'otpResponse',
  },

  OTP_RESEND_REQUEST: {
    type: 'OTP_RESEND_REQUEST',
    value: 'resendOTP',
  },
  OTP_RESEND_SUCCESS: {
    type: 'OTP_RESEND_SUCCESS',
    value: 'resendOTP',
  },
  OTP_RESEND_FAILURE: {
    type: 'OTP_RESEND_FAILURE',
    value: 'resendOTP',
  },

  GET_COUNTRY_LIST_REQUEST: {
    type: 'GET_COUNTRY_LIST_REQUEST',
    value: 'countryList',
  },
  GET_COUNTRY_LIST_SUCCESS: {
    type: 'GET_COUNTRY_LIST_SUCCESS',
    value: 'countryList',
  },
  GET_COUNTRY_LIST_FAILURE: {
    type: 'GET_COUNTRY_LIST_FAILURE',
    value: 'countryList',
  },
};

export const PROFILE = {
  GET_PROFILE_REQUEST: {
    type: 'GET_PROFILE_REQUEST',
    value: 'profileDetails',
  },
  GET_PROFILE_SUCCESS: {
    type: 'GET_PROFILE_SUCCESS',
    value: 'profileDetails',
  },
  GET_PROFILE_FAILURE: {
    type: 'GET_PROFILE_FAILURE',
    value: 'profileDetails',
  },

  GET_HOME_REQUEST: {
    type: 'GET_HOME_REQUEST',
    value: 'homeDetails',
  },
  GET_HOME_SUCCESS: {
    type: 'GET_HOME_SUCCESS',
    value: 'homeDetails',
  },
  GET_HOME_FAILURE: {
    type: 'GET_HOME_FAILURE',
    value: 'homeDetails',
  },

  GET_CHAT_LIST_REQUEST: {
    type: 'GET_CHAT_LIST_REQUEST',
    value: 'chatList',
  },
  GET_CHAT_LIST_SUCCESS: {
    type: 'GET_CHAT_LIST_SUCCESS',
    value: 'chatList',
  },
  GET_CHAT_LIST_FAILURE: {
    type: 'GET_CHAT_LIST_FAILURE',
    value: 'chatList',
  },

  CHANGE_PASSWORD_REQUEST: {
    type: 'CHANGE_PASSWORD_REQUEST',
    value: 'changepw',
  },
  CHANGE_PASSWORD_SUCCESS: {
    type: 'CHANGE_PASSWORD_SUCCESS',
    value: 'changepw',
  },
  CHANGE_PASSWORD_FAILURE: {
    type: 'CHANGE_PASSWORD_FAILURE',
    value: 'changepw',
  },

  UPDATE_PROFILE_REQUEST: {
    type: 'UPDATE_PROFILE_REQUEST',
    value: 'profileDetails',
  },
  UPDATE_PROFILE_SUCCESS: {
    type: 'UPDATE_PROFILE_SUCCESS',
    value: 'profileDetails',
  },
  UPDATE_PROFILE_FAILURE: {
    type: 'UPDATE_PROFILE_FAILURE',
    value: 'profileDetails',
  },

  PROFILE_UPDATE_REQUEST: {
    type: 'PROFILE_UPDATE_REQUEST',
    value: 'profileUpdateRes',
  },
  PROFILE_UPDATE_SUCCESS: {
    type: 'PROFILE_UPDATE_SUCCESS',
    value: 'profileUpdateRes',
  },
  PROFILE_UPDATE_FAILURE: {
    type: 'PROFILE_UPDATE_FAILURE',
    value: 'profileUpdateRes',
  },

  GET_STATE_LIST_REQUEST: {
    type: 'GET_STATE_LIST_REQUEST',
    value: 'stateList',
  },
  GET_STATE_LIST_SUCCESS: {
    type: 'GET_STATE_LIST_SUCCESS',
    value: 'stateList',
  },
  GET_STATE_LIST_FAILURE: {
    type: 'GET_STATE_LIST_FAILURE',
    value: 'stateList',
  },

  GET_PAYMENT_UPDATE_REQUEST: {
    type: 'GET_PAYMENT_UPDATE_REQUEST',
    value: 'paymentPreference',
  },
  GET_PAYMENT_UPDATE_SUCCESS: {
    type: 'GET_PAYMENT_UPDATE_SUCCESS',
    value: 'paymentPreference',
  },
  GET_PAYMENT_UPDATE_FAILURE: {
    type: 'GET_PAYMENT_UPDATE_FAILURE',
    value: 'paymentPreference',
  },
};

export const ENQUIRY = {
  GET_ENQUIRY_LIST_REQUEST: {
    type: 'GET_ENQUIRY_LIST_REQUEST',
    value: 'enquiryList',
  },
  GET_ENQUIRY_LIST_SUCCESS: {
    type: 'GET_ENQUIRY_LIST_SUCCESS',
    value: 'enquiryList',
  },
  GET_ENQUIRY_LIST_FAILURE: {
    type: 'GET_ENQUIRY_LIST_FAILURE',
    value: 'enquiryList',
  },

  GET_SERVICE_LIST_REQUEST: {
    type: 'GET_SERVICE_LIST_REQUEST',
    value: 'serviceList',
  },
  GET_SERVICE_LIST_SUCCESS: {
    type: 'GET_SERVICE_LIST_SUCCESS',
    value: 'serviceList',
  },
  GET_SERVICE_LIST_FAILURE: {
    type: 'GET_SERVICE_LIST_FAILURE',
    value: 'serviceList',
  },

  CREATE_ENQUIRY_REQUEST: {
    type: 'CREATE_ENQUIRY_REQUEST',
    value: 'createEnquiry',
  },
  CREATE_ENQUIRY_SUCCESS: {
    type: 'CREATE_ENQUIRY_SUCCESS',
    value: 'createEnquiry',
  },
  CREATE_ENQUIRY_FAILURE: {
    type: 'CREATE_ENQUIRY_FAILURE',
    value: 'createEnquiry',
  },

  VOTE_POST_REQUEST: {
    type: 'VOTE_POST_REQUEST',
    value: 'votePost',
  },
  VOTE_POST_SUCCESS: {
    type: 'VOTE_POST_SUCCESS',
    value: 'votePost',
  },
  VOTE_POST_FAILURE: {
    type: 'VOTE_POST_FAILURE',
    value: 'votePost',
  },

  REPORT_POST_REQUEST: {
    type: 'REPORT_POST_REQUEST',
    value: 'reportPost',
  },
  REPORT_POST_SUCCESS: {
    type: 'REPORT_POST_SUCCESS',
    value: 'reportPost',
  },
  REPORT_POST_FAILURE: {
    type: 'REPORT_POST_FAILURE',
    value: 'reportPost',
  },

  FAVOURITE_POST_REQUEST: {
    type: 'FAVOURITE_POST_REQUEST',
    value: 'favouritePost',
  },
  FAVOURITE_POST_SUCCESS: {
    type: 'FAVOURITE_POST_SUCCESS',
    value: 'favouritePost',
  },
  FAVOURITE_POST_FAILURE: {
    type: 'FAVOURITE_POST_FAILURE',
    value: 'favouritePost',
  },

  FAVOURITE_LIST_REQUEST: {
    type: 'FAVOURITE_LIST_REQUEST',
    value: 'favouriteList',
  },
  FAVOURITE_LIST_SUCCESS: {
    type: 'FAVOURITE_LIST_SUCCESS',
    value: 'favouriteList',
  },
  FAVOURITE_LIST_FAILURE: {
    type: 'FAVOURITE_LIST_FAILURE',
    value: 'favouriteList',
  },

  GET_POST_BY_ID_REQUEST: {
    type: 'GET_POST_BY_ID_REQUEST',
    value: 'postDetails',
  },
  GET_POST_BY_ID_SUCCESS: {
    type: 'GET_POST_BY_ID_SUCCESS',
    value: 'postDetails',
  },
  GET_POST_BY_ID_FAILURE: {
    type: 'GET_POST_BY_ID_FAILURE',
    value: 'postDetails',
  },

  REMOVE_FAVOURITE_REQUEST: {
    type: 'REMOVE_FAVOURITE_REQUEST',
    value: 'removeFavourite',
  },
  REMOVE_FAVOURITE_SUCCESS: {
    type: 'REMOVE_FAVOURITE_SUCCESS',
    value: 'removeFavourite',
  },
  REMOVE_FAVOURITE_FAILURE: {
    type: 'REMOVE_FAVOURITE_FAILURE',
    value: 'removeFavourite',
  },

  DELETE_POST_REQUEST: {
    type: 'DELETE_POST_REQUEST',
    value: 'deletePost',
  },
  DELETE_POST_SUCCESS: {
    type: 'DELETE_POST_SUCCESS',
    value: 'deletePost',
  },
  DELETE_POST_FAILURE: {
    type: 'DELETE_POST_FAILURE',
    value: 'deletePost',
  },
  EDIT_POST_REQUEST: {
    type: 'EDIT_POST_REQUEST',
    value: 'editPost',
  },
  EDIT_POST_SUCCESS: {
    type: 'EDIT_POST_SUCCESS',
    value: 'editPost',
  },
  EDIT_POST_FAILURE: {
    type: 'EDIT_POST_FAILURE',
    value: 'editPost',
  },
};

export const INVOICE = {
  GET_INVOICE_LIST_REQUEST: {
    type: 'GET_INVOICE_LIST_REQUEST',
    value: 'invoiceList',
  },
  GET_INVOICE_LIST_SUCCESS: {
    type: 'GET_INVOICE_LIST_SUCCESS',
    value: 'invoiceList',
  },
  GET_INVOICE_LIST_FAILURE: {
    type: 'GET_INVOICE_LIST_FAILURE',
    value: 'invoiceList',
  },

  MAKE_PAYMRNT_REQUEST: {
    type: 'MAKE_PAYMRNT_REQUEST',
    value: 'paymentDetails',
  },
  MAKE_PAYMRNT_SUCCESS: {
    type: 'MAKE_PAYMRNT_SUCCESS',
    value: 'paymentDetails',
  },
  MAKE_PAYMRNT_FAILURE: {
    type: 'MAKE_PAYMRNT_FAILURE',
    value: 'paymentDetails',
  },

  GET_INVOICE_DETAILS_REQUEST: {
    type: 'GET_INVOICE_DETAILS_REQUEST',
    value: 'invoiceDetails',
  },
  GET_INVOICE_DETAILS_SUCCESS: {
    type: 'GET_INVOICE_DETAILS_SUCCESS',
    value: 'invoiceDetails',
  },
  GET_INVOICE_DETAILS_FAILURE: {
    type: 'GET_INVOICE_DETAILS_FAILURE',
    value: 'invoiceDetails',
  },
};

export const CHAT = {
  GET_CHAT_DETAILS_REQUEST: {
    type: 'GET_CHAT_DETAILS_REQUEST',
    value: 'chatDetails',
  },
  GET_CHAT_DETAILS_SUCCESS: {
    type: 'GET_CHAT_DETAILS_SUCCESS',
    value: 'chatDetails',
  },
  GET_CHAT_DETAILS_FAILURE: {
    type: 'GET_CHAT_DETAILS_FAILURE',
    value: 'chatDetails',
  },

  SEND_MESSAGE_REQUEST: {
    type: 'SEND_MESSAGE_REQUEST',
    value: 'sendMessage',
  },
  SEND_MESSAGE_SUCCESS: {
    type: 'SEND_MESSAGE_SUCCESS',
    value: 'sendMessage',
  },
  SEND_MESSAGE_FAILURE: {
    type: 'SEND_MESSAGE_FAILURE',
    value: 'sendMessage',
  },
};

export const APPOINTMENT = {
  GET_APPOINTMENT_REQUEST: {
    type: 'GET_APPOINTMENT_REQUEST',
    value: 'getAppointmentList',
  },
  GET_APPOINTMENT_SUCCESS: {
    type: 'GET_APPOINTMENT_SUCCESS',
    value: 'getAppointmentList',
  },
  GET_APPOINTMENT_FAILURE: {
    type: 'GET_APPOINTMENT_FAILURE',
    value: 'getAppointmentList',
  },

  GET_BOOKED_APPOINTMENT_REQUEST: {
    type: 'GET_BOOKED_APPOINTMENT_REQUEST',
    value: 'getBookedAppointment',
  },
  GET_BOOKED_APPOINTMENT_SUCCESS: {
    type: 'GET_BOOKED_APPOINTMENT_SUCCESS',
    value: 'getBookedAppointment',
  },
  GET_BOOKED_APPOINTMENT_FAILURE: {
    type: 'GET_BOOKED_APPOINTMENT_FAILURE',
    value: 'getBookedAppointment',
  },

  CREATE_APPOINTMENT_REQUEST: {
    type: 'CREATE_APPOINTMENT_REQUEST',
    value: 'createAppointmen',
  },
  CREATE_APPOINTMENT_SUCCESS: {
    type: 'CREATE_APPOINTMENT_SUCCESS',
    value: 'createAppointmen',
  },
  CREATE_APPOINTMENT_FAILURE: {
    type: 'CREATE_APPOINTMENT_FAILURE',
    value: 'createAppointmen',
  },

  GET_COUNTRY_LIST_BY_ID_REQUEST: {
    type: 'GET_COUNTRY_LIST_BY_ID_REQUEST',
    value: 'countryListByID',
  },
  GET_COUNTRY_LIST_BY_ID_SUCCESS: {
    type: 'GET_COUNTRY_LIST_BY_ID_SUCCESS',
    value: 'countryListByID',
  },
  GET_COUNTRY_LIST_BY_ID_FAILURE: {
    type: 'GET_COUNTRY_LIST_BY_ID_FAILURE',
    value: 'countryListByID',
  },

  GET_STATE_LIST_BY_ID_REQUEST: {
    type: 'GET_STATE_LIST_BY_ID_REQUEST',
    value: 'stateListByID',
  },
  GET_STATE_LIST_BY_ID_SUCCESS: {
    type: 'GET_STATE_LIST_BY_ID_SUCCESS',
    value: 'stateListByID',
  },
  GET_STATE_LIST_BY_ID_FAILURE: {
    type: 'GET_STATE_LIST_BY_ID_FAILURE',
    value: 'stateListByID',
  },

  GET_CITY_LIST_REQUEST: {
    type: 'GET_CITY_LIST_REQUEST',
    value: 'cityList',
  },
  GET_CITY_LIST_SUCCESS: {
    type: 'GET_CITY_LIST_SUCCESS',
    value: 'cityList',
  },
  GET_CITY_LIST_FAILURE: {
    type: 'GET_CITY_LIST_FAILURE',
    value: 'cityList',
  },

  GET_APPOINTMENT_BY_ID_REQUEST: {
    type: 'GET_APPOINTMENT_BY_ID_REQUEST',
    value: 'appointmentDetails',
  },
  GET_APPOINTMENT_BY_ID_SUCCESS: {
    type: 'GET_APPOINTMENT_BY_ID_SUCCESS',
    value: 'appointmentDetails',
  },
  GET_APPOINTMENT_BY_ID_FAILURE: {
    type: 'GET_APPOINTMENT_BY_ID_FAILURE',
    value: 'appointmentDetails',
  },

  BOOK_APPOINTMENT_REQUEST: {
    type: 'BOOK_APPOINTMENT_REQUEST',
    value: 'bookAppointmentDetails',
  },
  BOOK_APPOINTMENT_SUCCESS: {
    type: 'BOOK_APPOINTMENT_SUCCESS',
    value: 'bookAppointmentDetails',
  },
  BOOK_APPOINTMENT_FAILURE: {
    type: 'GET_APPOINTMENT_BY_ID_FAILURE',
    value: 'bookAppointmentDetails',
  },
};

export const MANAGE_PROJECT = {
  MANAGE_PROJECT_LIST_REQUEST: {
    type: 'MANAGE_PROJECT_LIST_REQUEST',
    value: 'manageProjectList',
  },
  MANAGE_PROJECT_LIST_SUCCESS: {
    type: 'MANAGE_PROJECT_LIST_SUCCESS',
    value: 'manageProjectList',
  },
  MANAGE_PROJECT_LIST_FAILURE: {
    type: 'MANAGE_PROJECT_LIST_FAILURE',
    value: 'manageProjectList',
  },

  DOCUMENT_LIST_REQUEST: {
    type: 'DOCUMENT_LIST_REQUEST',
    value: 'manageProjectDocumentList',
  },
  DOCUMENT_LIST_SUCCESS: {
    type: 'DOCUMENT_LIST_SUCCESS',
    value: 'manageProjectDocumentList',
  },
  DOCUMENT_LIST_FAILURE: {
    type: 'DOCUMENT_LIST_FAILURE',
    value: 'manageProjectDocumentList',
  },

  PROJECT_UPLOAD_DOCUMENT_REQUEST: {
    type: 'PROJECT_UPLOAD_DOCUMENT_REQUEST',
    value: 'projectUploadDocs',
  },
  PROJECT_UPLOAD_DOCUMENT_SUCCESS: {
    type: 'PROJECT_UPLOAD_DOCUMENT_SUCCESS',
    value: 'projectUploadDocs',
  },
  PROJECT_UPLOAD_DOCUMENT_FAILURE: {
    type: 'PROJECT_UPLOAD_DOCUMENT_FAILURE',
    value: 'projectUploadDocs',
  },
};

export const MANAGE_DOCUMENT = {
  MANAGE_DOCUMENT_LIST_REQUEST: {
    type: 'MANAGE_DOCUMENTLIST_REQUEST',
    value: 'manageDocumentList',
  },
  MANAGE_DOCUMENT_LIST_SUCCESS: {
    type: 'MANAGE_DOCUMENTLIST_SUCCESS',
    value: 'manageDocumentList',
  },
  MANAGE_DOCUMENT_LIST_FAILURE: {
    type: 'MANAGE_DOCUMENT_LIST_FAILURE',
    value: 'manageDocumentList',
  },
};

export const CONVERSATION = {
  CREATE_CONVERSATION_REQUEST: {
    type: 'CREATE_CONVERSATION_REQUEST',
    value: 'createConversation',
  },
  CREATE_CONVERSATION_SUCCESS: {
    type: 'CREATE_CONVERSATION_SUCCESS',
    value: 'createConversation',
  },
  CREATE_CONVERSATION_FAILURE: {
    type: 'CREATE_CONVERSATION_FAILURE',
    value: 'createConversation',
  },

  CONVERSATION_LIST_REQUEST: {
    type: 'CONVERSATION_LIST_REQUEST',
    value: 'conversationList',
  },
  CONVERSATION_LIST_SUCCESS: {
    type: 'CONVERSATION_LIST_SUCCESS',
    value: 'conversationList',
  },
  CONVERSATION_LIST_FAILURE: {
    type: 'CONVERSATION_LIST_FAILURE',
    value: 'conversationList',
  },

  CONVERSATION_REPLY_REQUEST: {
    type: 'CONVERSATION_REPLY_REQUEST',
    value: 'conversation',
  },
  CONVERSATION_REPLY_SUCCESS: {
    type: 'CONVERSATION_REPLY_SUCCESS',
    value: 'conversation',
  },
  CONVERSATION_REPLY_FAILURE: {
    type: 'CONVERSATION_REPLY_FAILURE',
    value: 'conversation',
  },

  CONVERSATION_DETAILS_REQUEST: {
    type: 'CONVERSATION_DETAILS_REQUEST',
    value: 'conversationDetails',
  },
  CONVERSATION_DETAILS_SUCCESS: {
    type: 'CONVERSATION_DETAILS_SUCCESS',
    value: 'conversationDetails',
  },
  CONVERSATION_DETAILS_FAILURE: {
    type: 'CONVERSATION_DETAILS_FAILURE',
    value: 'conversationDetails',
  },

  SELECTED_CONVERSATION_DETAILS_REQUEST: {
    type: 'SELECTED_CONVERSATION_DETAILS_REQUEST',
    value: 'selectedConversationDetails',
  },
  SELECTED_CONVERSATION_DETAILS_SUCCESS: {
    type: 'SELECTED_CONVERSATION_DETAILS_SUCCESS',
    value: 'selectedConversationDetails',
  },
  SELECTED_CONVERSATION_DETAILS_FAILURE: {
    type: 'SELECTED_CONVERSATION_DETAILS_FAILURE',
    value: 'selectedConversationDetails',
  },
};
