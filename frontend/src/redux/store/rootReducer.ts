import authSlice from '../slices/authSlice';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
  auth: authSlice.reducer,
});

export default rootReducer;
