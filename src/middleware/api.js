import axios from 'axios';
import { push } from 'react-router-redux';
import _ from 'lodash';

// TODO: Replace with prod/staging API
let API_ROOT: string = 'https://private-8d33ff-prelude.apiary-mock.com';
if (process.env.NODE_ENV !== 'production') {
  API_ROOT = 'http://localhost:3004';
}


// Fetches an API response and normalizes the result JSON according to schema.
// This makes every API response have the same shape, regardless of how nested it was.
function callApi(endpoint: any, method: any, params: Object, headers: any): Object {
  const url: any = (endpoint.indexOf(API_ROOT) === -1) ? API_ROOT + endpoint : endpoint;

  let query: Object = {method, url};
  if (headers) query.headers = headers;

  const methods: Array<string> = ['put', 'post', 'patch'];

  if (!_.isEmpty(params)) {
    if (methods.indexOf(method) === -1) {
      query.params = params;
    } else {
      query.data = params;
    }
  }
  if (params instanceof FormData) {
    query.data = params;
  }

  return axios(query)
    .then(response => response.data)
    .catch(error => Promise.reject(error))
}

// Action key that carries API call info interpreted by this Redux middleware.
export const CALL_API = Symbol('Call API');

const methods: Array<string> = ['get', 'post', 'put', 'patch', 'delete'];

// A Redux middleware that interprets actions with CALL_API info specified.
// Performs the call and promises when such actions are dispatched.
export default store => next => action => {
  const callAPI = action[CALL_API];
  if (typeof callAPI === 'undefined') {
    return next(action);
  }

  let { method, endpoint, params, headers } = callAPI;
  const { types } = callAPI;

  method = !!method ? method : 'get';

  if (typeof method !== 'string') {
    throw new Error('Specify a string endpoint URL.');
  }

  method = method.toLowerCase();

  if (methods.indexOf(method) === -1) {
    throw new Error(`method must be : ${methods.join(', ')}`);
  }

  if (typeof endpoint === 'function') {
    endpoint = endpoint(store.getState());
  }

  if (typeof endpoint !== 'string') {
    throw new Error('Specify a string endpoint URL.');
  }

  params = !!params ? params : {};

  if (!_.isObject(params)) {
    throw new Error('Params should be an object.');
  }
  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('Expected an array of three action types.');
  }
  if (!types.every(type => typeof type === 'string')) {
    throw new Error('Expected action types to be strings.');
  }

  function actionWith(data) {
    const finalAction = Object.assign({}, action, data);
    delete finalAction[CALL_API];
    return finalAction;
  }

  const [requestType, successType, failureType] = types;
  next(actionWith({type: requestType}));

  const token = store.getState().auth.token;
  if (token) {
    headers = headers ? Object.assign({}, headers, {Authorization: `Token ${token}`}) : {Authorization: `Token ${token}`};
  }

  return callApi(endpoint, method, params, headers).then(
      response => {
      if (typeof action.then === 'function') {
        next(actionWith({
          response,
          type: successType
        }));
        store.dispatch(action.then(response));
      } else {
        next(actionWith({
          response,
          type: successType
        }));
      }
    },
      error => {
      if (error.status === 401 || error.status === 403) {
        next(push('/'));
      } else {
        next(actionWith({
            type: failureType,
            status: error.status,
            error: error.data
          })
        );
      }
    }
  );
};
