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