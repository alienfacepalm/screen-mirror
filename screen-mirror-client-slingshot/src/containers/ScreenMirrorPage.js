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
      setSwiping={props.actions.setSwiping}
      setFocused={props.actions.setFocused}
      setShiftDown={props.actions.setShiftDown}
    />
  );
};

ScreenMirrorPage.propTypes = {
  actions: PropTypes.object.isRequired,
  deviceInfo: PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
  return {
    deviceInfo: state.screenMirror.deviceInfo
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ScreenMirrorPage);
