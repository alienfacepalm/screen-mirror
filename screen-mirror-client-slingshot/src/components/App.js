import React, {Component, PropTypes} from 'react';

import ScreenMirrorPage from '../containers/ScreenMirrorPage';

class App extends Component {
  render() {
    return (
        <ScreenMirrorPage />
    );
  }
}

App.propTypes = {
  children: PropTypes.element
};

export default App;
