import {AUTH} from '../store/TypeConstants';

export const getSignIn = payload => ({
  type: AUTH.LOGIN_REQUEST.type,
  payload,
});

export const getSignUp = payload => ({
  type: AUTH.SIGNUP_REQUEST.type,
  payload,
});

export const getLogout = payload => ({
  type: AUTH.LOGOUT_REQUEST.type,
  payload,
});

export const otpVerify = payload => ({
  type: AUTH.OTP_VERIFY_REQUEST.type,
  payload,
});

export const getForgotpassword = payload => ({
  type: AUTH.FORGOT_PASSWORD_REQUEST.type,
  payload,
});

export const resendOtp = payload => ({
  type: AUTH.OTP_RESEND_REQUEST.type,
  payload,
});
export const getCountryList = () => ({
  type: AUTH.GET_COUNTRY_LIST_REQUEST.type,
});
