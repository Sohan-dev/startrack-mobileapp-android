import {APPOINTMENT} from '../store/TypeConstants';

export const getAppointmentList = () => ({
  type: APPOINTMENT.GET_APPOINTMENT_REQUEST.type,
});
export const createAppointment = payload => ({
  type: APPOINTMENT.CREATE_APPOINTMENT_REQUEST.type,
  payload,
});

export const getCountryListByProjectID = payload => ({
  type: APPOINTMENT.GET_COUNTRY_LIST_BY_ID_REQUEST.type,
  payload,
});

export const getStateListByProjectID = payload => ({
  type: APPOINTMENT.GET_STATE_LIST_BY_ID_REQUEST.type,
  payload,
});

export const getCityListByProjectID = payload => ({
  type: APPOINTMENT.GET_CITY_LIST_REQUEST.type,
  payload,
});

export const getAppointmentDetails = payload => ({
  type: APPOINTMENT.GET_APPOINTMENT_BY_ID_REQUEST.type,
  payload,
});

export const bookAppointment = payload => ({
  type: APPOINTMENT.BOOK_APPOINTMENT_REQUEST.type,
  payload,
});

export const getBookedAppointment = payload => ({
  type: APPOINTMENT.GET_BOOKED_APPOINTMENT_REQUEST.type,
  payload,
});
