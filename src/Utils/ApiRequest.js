import axios from 'axios';
import constants from './constants';

export async function getApi(
  url,
  accesstoken,
  header = {
    Accept: 'application/json',
    contenttype: 'application/json',
  },
) {
  console.log('GetApi: ', `${constants.BASE_URL}/${url}`);
  console.log('accesstoken ', accesstoken);
  return await axios.get(`${constants.BASE_URL}/${url}`, {
    headers: {
      Accept: header.Accept,
      'Content-Type': header.contenttype,
      // 'x-access-token': `${accesstoken}`,
      authorization: `Bearer ${accesstoken ? accesstoken : ''}`,
    },
  });
}

export async function getApiWithParam(
  url,
  param,
  accesstoken,
  header = {
    Accept: 'application/json',
    contenttype: 'application/json',
  },
) {
  console.log('getApiWithParam: ', `${constants.BASE_URL}/${url}`);

  return await axios({
    method: 'GET',
    baseURL: constants.BASE_URL,
    url: url,
    params: param,
    headers: {
      Accept: header.Accept,
      'Content-type': header.contenttype,
      Authorization: `Bearer ${accesstoken ? accesstoken : ''}`,
    },
  });
}

// export async function postApi(
//   url,
//   payload,
//   accesstoken,
//   header = {
//     Accept: 'application/json',
//     contenttype: 'application/json',
//   },
// ) {
//   console.log('PostApi: ', `${constants.BASE_URL}/${url}`, payload, header);

//   return await axios.post(`${constants.BASE_URL}/${url}`, payload, {
//     headers: {
//       Accept: header.Accept,
//       'Content-Type': header.contenttype,
//       Authorization: `Bearer ${accesstoken ? accesstoken : ''}`,
//     },
//   });
// }

export async function postApi(url, payload, accesstoken, header) {
  console.log('PostApi: ', `${constants.BASE_URL}/${url}`, payload);

  return await axios.post(`${constants.BASE_URL}/${url}`, payload, {
    headers: {
      Accept: header.Accept,
      'Content-Type': header.contenttype,
      Authorization: `Bearer ${accesstoken ? accesstoken : ''}`,
    },
  });
}

export async function putApi(
  url,
  payload,
  accesstoken,
  header = {
    Accept: 'application/json',
    contenttype: 'application/json',
  },
) {
  console.log('Put Api: ', `${constants.BASE_URL}/${url}`, payload, header);

  return await axios.put(`${constants.BASE_URL}/${url}`, payload, {
    headers: {
      Accept: header.Accept,
      'Content-Type': header.contenttype,
      // 'x-access-token': `${header.authorxization}`,
      // 'x-access-token': `${accesstoken}`,
      Authorization: `token ${accesstoken ? accesstoken : ''}`,
    },
  });
}
export async function patchApi(
  url,
  payload,
  accesstoken,
  header = {
    Accept: 'application/json',
    contenttype: 'application/json',
  },
) {
  console.log('Patch Api: ', `${constants.BASE_URL}/${url}`, payload, header);

  return await axios.patch(`${constants.BASE_URL}/${url}`, payload, {
    headers: {
      Accept: header.Accept,
      'Content-Type': header.contenttype,
      Authorization: `token ${accesstoken ? accesstoken : ''}`,
    },
  });
}

export async function deleteApi(url, accesstoken) {
  console.log('DeleteApi: ', `${constants.BASE_URL}/${url}`);

  return await axios.delete(`${constants.BASE_URL}/${url}`, {
    headers: {
      Authorization: `token ${accesstoken ? accesstoken : ''}`,
    },
  });
}
