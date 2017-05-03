import * as types from '../constants/actionTypes';

export function setDeviceInfo(state){
  return (dispatch) => {
    return dispatch({
      type: types.DEVICE_INFO,
      modified: new Date().getTime(),
      ...state
    });
  };
}

export function setSwiping(state){
  return (dispatch) => {
    return dispatch({
      type: types.SWIPING,
      modified: new Date().getTime(),
      state
    });
  };
}

export function setShiftDown(state){
  return (dispatch) => {
    return dispatch({
      type: types.SHIFT_DOWN,
      modified: new Date().getTime(),
      state
    });
  };
}

export function setFocused(state){
  return (dispatch) => {
    return dispatch({
      type: types.FOCUSED,
      modified: new Date().getTime(),
      state
    });
  };
}