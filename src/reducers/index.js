import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import OverviewReducer from './overview';
import AuthReducer from './auth';

const rootReducer = combineReducers({
  form: formReducer,
  routing: routerReducer,
  overview: OverviewReducer,
  auth: AuthReducer,
});

export default rootReducer;
