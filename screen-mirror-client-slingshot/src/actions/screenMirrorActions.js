import * as types from '../constants/actionTypes';

export function setDeviceInfo(data){
  return (dispatch) => {
    return dispatch({
      type: types.DEVICE_INFO,
      modified: new Date().getTime(),
      ...data
    });
  };
}

export function setSwiping(data){
  console.log(`Set swiping`, data);
  return (dispatch) => {
    return dispatch({
      type: types.SWIPING,
      modified: new Date().getTime(),
      data
    });
  };
}

export function setShiftDown(data){
  return (dispatch) => {
    console.log(`Set shift down`, data);
    return dispatch({
      type: types.SHIFT_DOWN,
      modified: new Date().getTime(),
      data
    });
  };
}

export function setFocused(data){
  console.log(`Set focused`, data);
  return (dispatch) => {
    return dispatch({
      type: types.FOCUSED,
      modified: new Date().getTime(),
      data
    });
  };
}