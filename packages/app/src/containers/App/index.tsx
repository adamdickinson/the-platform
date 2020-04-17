import {BrowserRouter as Router} from 'react-router-dom';
import React from 'react';

import BaseStyle from '../../styles/BaseStyle';
import Vote from '../Vote';

export default () => {
  return (
    <>
      <BaseStyle />
      <Router>
        <Vote />
      </Router>
    </>
  );
};
