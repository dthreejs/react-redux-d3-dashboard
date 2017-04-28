import { CALL_API } from './../middleware/api';

export const GET_OVERVIEW_REQUEST: string = 'GET_OVERVIEW_REQUEST';
export const GET_OVERVIEW_SUCCESS: string = 'GET_OVERVIEW_SUCCESS';
export const GET_OVERVIEW_FAILURE: string = 'GET_OVERVIEW_FAILURE';

export function fetchOverview(): Object {
  return {
    [CALL_API]: {
      types: [GET_OVERVIEW_REQUEST, GET_OVERVIEW_SUCCESS, GET_OVERVIEW_FAILURE],
      endpoint: '/buildings',
      method: 'get',
    },
  };
}

export const GET_SPACES_REQUEST: string = 'GET_SPACES_REQUEST';
export const GET_SPACES_SUCCESS: string = 'GET_SPACES_SUCCESS';
export const GET_SPACES_FAILURE: string = 'GET_SPACES_FAILURE';

export function fetchSpaces(): Object {
  return {
    [CALL_API]: {
      types: [GET_SPACES_REQUEST, GET_SPACES_SUCCESS, GET_SPACES_FAILURE],
      endpoint: '/spaces',
      method: 'get',
      // params: { _limit: 50 },
    },
  };
}

export const GET_MAP_REQUEST: string = 'GET_MAP_REQUEST';
export const GET_MAP_SUCCESS: string = 'GET_MAP_SUCCESS';
export const GET_MAP_FAILURE: string = 'GET_MAP_FAILURE';

export function fetchMap(): Object {
  return {
    [CALL_API]: {
      types: [GET_MAP_REQUEST, GET_MAP_SUCCESS, GET_MAP_FAILURE],
      endpoint: '/map',
      method: 'get',
    },
  };
}

export const INIT_APP_REQUEST: string = 'INIT_APP_REQUEST';
export const INIT_APP_SUCCESS: string = 'INIT_APP_SUCCESS';
export const INIT_APP_FAILURE: string = 'INIT_APP_FAILURE';

export function initApp(): Object {
  return {
    [CALL_API]: {
      types: [INIT_APP_REQUEST, INIT_APP_SUCCESS, INIT_APP_FAILURE],
      endpoint: '/init',
      method: 'get',
    },
  };
}

export const TOGGLE_MODAL: string = 'TOGGLE_MODAL';

export function toggleModal(response: any = null): Object {
  return {
    type: TOGGLE_MODAL,
    response
  };
}

export const UPDATE_FILTERS: string = 'UPDATE_DATES';

export function updateFilters(response = Object): Object {
  return {
    type: UPDATE_FILTERS,
    response
  };
}

export const SEND_FEEDBACK: string = 'SEND_FEEDBACK';

export function sendFeedback(response = Object): Object {
  return {
    type: SEND_FEEDBACK,
    response
  };
}
