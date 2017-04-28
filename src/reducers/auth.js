const LOGIN: string = 'LOGIN';
const LOGOUT: string = 'LOGOUT';

const INITIAL_STATE: Object = {
  isLoggedIn: true,
  info: {
    email: '',
    firstName: '',
    lastName: '',
    lang: '',
    role: '',
  },
};

function newState(state: Object, info: Object, isLoggedIn: Boolean): Object {
  return { ...state, info, isLoggedIn };
}

export default function (state: Object = INITIAL_STATE, action: Object): Object {
  const isError = /.*_ERROR(.*?)$/;
  switch (action.type) {
    case `${LOGIN}_SUCCESS`:
      return newState(state, action.payload.data.user, true);
    case `${LOGIN}_ERROR`:
      return INITIAL_STATE;
    case `${LOGOUT}_SUCCESS`:
      return INITIAL_STATE;
    default:
      if (action.type.match(isError)) {
        if (action.payload.status === 401) {
          return INITIAL_STATE;
        }
      }
      return state;
  }
}
