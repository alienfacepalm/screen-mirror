import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as actions from '../actions/screenMirrorActions';
import ScreenMirror from '../components/ScreenMirror';

export const ScreenMirrorPage = props => {
  return (
    <ScreenMirror 
      getDeviceInfo={props.getDeviceInfo}
    />
  );
};

ScreenMirrorPage.propTypes = {
  actions: PropTypes.object.isRequired,
  //device: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    device: state.device
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScreenMirrorPage);
