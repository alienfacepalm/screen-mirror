import {
  DEVICE_INFO, 
  SWIPING, 
  FOCUSED, 
  SHIFT_DOWN
} from '../constants/actionTypes';

const defaultState = {
  swiping: false, 
  focused: false, 
  shiftDown: false, 
  deviceInfo: {
    width: null,
    height: null,
    maxX: null,
    maxY:null,
    maxContacts: null,
    maxPressure: null
  }
};

export default function screenMirror(state=defaultState, action) {  

  switch(action.type){
    case DEVICE_INFO:
        let newState = {
          deviceInfo: {
            width: action.width,
            height: action.height,
            maxX: action.maxX,
            maxY: action.maxY,
            maxContacts: action.maxContacts,
            maxPressure: action.maxPressure
          }
        };
        return Object.assign({}, state, newState);
    case SWIPING: 
      return Object.assign({}, state, {swiping: action.state});
    case FOCUSED: 
      return Object.assign({}, state, {focused: action.state});
    case SHIFT_DOWN: 
      return Object.assign({}, state, {shiftDown: action.state});
    default: 
        return state;
  }

}