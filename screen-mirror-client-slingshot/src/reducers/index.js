import {combineReducers} from 'redux';
import screenMirror from './screenMirrorReducer';
import {routerReducer} from 'react-router-redux';

const rootReducer = combineReducers({
  screenMirror, 
  routing: routerReducer
});

export default rootReducer;
