import {TOKEN} from '../store/TypeConstants';

export const setToken = payload => ({
  type: TOKEN.SET_TOKEN_REQUEST.type,
  payload,
});

export const getToken = () => ({
  type: TOKEN.GET_TOKEN_REQUEST.type,
});
