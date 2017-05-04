import {DEVICE_INFO} from '../constants/actionTypes';

const defaultState = {
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
        return Object.assign({}, state, {
          deviceInfo: {
            width: action.width,
            height: action.height,
            maxX: action.maxX,
            maxY: action.maxY,
            maxContacts: action.maxContacts,
            maxPressure: action.maxPressure
          }
        });
    default: 
        return state;
  }

}