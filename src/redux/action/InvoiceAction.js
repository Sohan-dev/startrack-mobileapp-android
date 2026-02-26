import {INVOICE} from '../store/TypeConstants';

export const getInvoiceList = () => ({
  type: INVOICE.GET_INVOICE_LIST_REQUEST.type,
});

export const makePayment = payload => ({
  type: INVOICE.MAKE_PAYMRNT_REQUEST.type,
  payload,
});

export const getInvoiceDetails = payload => ({
  type: INVOICE.GET_INVOICE_DETAILS_REQUEST.type,
  payload,
});
