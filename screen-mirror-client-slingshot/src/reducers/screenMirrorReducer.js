import {
  DEVICE_INFO, 
  SWIPING, 
  FOCUSED, 
  SHIFT_DOWN
} from '../constants/actionTypes';

const defaultDeviceInfo = {
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

export default function screenMirror(state=defaultDeviceInfo, action) {  

  let newState;

  switch(action.type){
    case DEVICE_INFO:
        newState = {
          deviceInfo: {
            width: action.width,
            height: action.height,
            maxX: action.maxX,
            maxY: action.maxY,
            maxContacts: action.maxContacts,
            maxPressure: action.maxPressure
          }
        };
        return newState;
    case SWIPING: 
      console.log(`SWIPING ACTION`, action);
      newState = action.state;
      return newState;
    case FOCUSED: 
      console.log(`FOCUSED ACTION`, action);
      newState = action.state;
      return newState;
    case SHIFT_DOWN: 
      console.log(`SHIFT DOWN ACTION`, action);
      newState = action.state;
      return newState;
    default: 
        return state;
  }

}