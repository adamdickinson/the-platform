import {ApolloProvider} from '@apollo/react-hooks';
import {Route, BrowserRouter as Router} from 'react-router-dom';
import ApolloClient from 'apollo-boost';
import React from 'react';

import BaseStyle from '../../styles/BaseStyle';
import Vote from '../Vote';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  request: operation => {
    const {userId} = operation.variables;
    delete operation.variables.userId;
    operation.setContext({
      headers: {
        authorization: `Bearer ${userId}`,
      },
    });
  },
});

export default () => {
  return (
    <ApolloProvider client={client}>
      <BaseStyle />
      <Router>
        <Route path="/poll/:code" component={Vote} />
      </Router>
    </ApolloProvider>
  );
};
