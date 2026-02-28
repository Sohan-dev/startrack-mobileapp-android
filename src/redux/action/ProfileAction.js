import { PROFILE } from '../store/TypeConstants';

export const getProfile = payload => ({
  type: PROFILE.GET_PROFILE_REQUEST.type,
  payload,
});

export const getHomeData = () => ({
  type: PROFILE.GET_HOME_REQUEST.type,
});

export const getChatList = () => ({
  type: PROFILE.GET_CHAT_LIST_REQUEST.type,
});

export const requestProfileUpdate = () => ({
  type: PROFILE.PROFILE_UPDATE_REQUEST.type,
});

export const changePw = payload => ({
  type: PROFILE.CHANGE_PASSWORD_REQUEST.type,
  payload,
});

export const updateProfile = payload => ({
  type: PROFILE.UPDATE_PROFILE_REQUEST.type,
  payload,
});
export const getStateList = payload => ({
  type: PROFILE.GET_STATE_LIST_REQUEST.type,
  payload,
});

export const getPaymentUpdatePreference = payload => ({
  type: PROFILE.GET_PAYMENT_UPDATE_REQUEST.type,
  payload,
});
