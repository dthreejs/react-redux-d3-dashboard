import moment from 'moment';
import {
  GET_OVERVIEW_REQUEST, GET_OVERVIEW_SUCCESS, GET_OVERVIEW_FAILURE,
  GET_SPACES_REQUEST, GET_SPACES_SUCCESS, GET_SPACES_FAILURE,
  GET_MAP_REQUEST, GET_MAP_SUCCESS, GET_MAP_FAILURE,
  INIT_APP_REQUEST, INIT_APP_SUCCESS, INIT_APP_FAILURE,
  TOGGLE_MODAL, UPDATE_FILTERS, SEND_FEEDBACK,
} from '../actions/overview';

type InitState = {
  users: Object,
  buildings: Array<Object>,
  spaces: Array<Object>,
  map: Object,
  init: Object,
  dates: Object,
  isFectching: boolean,
  error: Object
};

const filters: Object = {
  dates: {
    start: moment().subtract(112, 'days'),
    end: moment().subtract(110, 'days'),
    excludes: ['2017-02-03', '2017-02-04', '2017-02-07'],
  },
  time: {
    start: { h: 8, m: 0, meridian: 'AM' },
    end: { h: 6, m: 0, meridian: 'PM' },
  },
};

const INITIAL_STATE: InitState = {
  users: null,
  buildings: [],
  spaces: [],
  map: null,
  init: null,
  filters,
  showModal: false,
  isFetching: false,
  feedbackSuccess: false,
  error: {},
};

export default function (state: Object = INITIAL_STATE, action: Object): Object {
  switch (action.type) {
    case INIT_APP_REQUEST:
    case GET_OVERVIEW_REQUEST:
    case GET_SPACES_REQUEST:
      return Object.assign({}, state, {
        error: {},
        isFetching: true,
      });
    case GET_MAP_REQUEST:
      return Object.assign({}, state, {
        error: {},
        isFetching: true,
      });

    case GET_OVERVIEW_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        buildings: action.response,
      });

    case GET_SPACES_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        spaces: action.response,
      });

     case GET_MAP_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        map: action.response,
      });

    case INIT_APP_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        init: {
          knowledge: action.response.knowledge.reverse(),
        },
      });

    case INIT_APP_FAILURE:
    case GET_OVERVIEW_FAILURE:
    case GET_SPACES_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.response,
      });
    case GET_MAP_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.response,
      });

    case TOGGLE_MODAL: {
      const response = action.response ? action.response : ! state.showModal;
      // TODO: Finder better solution than setting element modification here...
      document.body.style.overflow = response ? 'hidden' : 'initial';
      return Object.assign({}, state, {
        showModal: response,
      });
    }

    case UPDATE_FILTERS:
      return Object.assign({}, state, {
        filters: Object.assign({}, state.filters, action.response),
      });

    case SEND_FEEDBACK:
      return Object.assign({}, state, {
        feedbackSuccess: action.response,
      });

    default:
      return state;
  }
}
