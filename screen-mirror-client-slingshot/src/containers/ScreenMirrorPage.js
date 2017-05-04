import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as actions from '../actions/screenMirrorActions';
import ScreenMirror from '../components/ScreenMirror';

export const ScreenMirrorPage = props => {
  return (
    <ScreenMirror 
      deviceInfo={props.deviceInfo}
      setDeviceInfo={props.actions.setDeviceInfo}
      swiping={props.swiping}
      setSwiping={props.actions.setSwiping}
      focused={props.focused}
      setFocused={props.actions.setFocused}
      shiftDown={props.shiftDown}
      setShiftDown={props.actions.setShiftDown}
    />
  );
};

ScreenMirrorPage.propTypes = {
  actions: PropTypes.object.isRequired,
  deviceInfo: PropTypes.object.isRequired
};

//!!!IMPORTANT!!!
const mapStateToProps = (state) => {
  return {
    deviceInfo: state.screenMirror.deviceInfo
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ScreenMirrorPage);
