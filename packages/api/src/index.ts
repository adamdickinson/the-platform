import {ApolloServer} from 'apollo-server';

import {createStore} from './helpers/store';
import {resolvers, typeDefs} from './resolvers';

const POLL_URL = 'http://vote.adamdickinson.com.au/poll/';

const store = createStore();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: true,
  context: ({req}) => {
    const token = req.headers.authorization || '';
    const code = token.substr('Bearer '.length);
    const users = store.get('users') || [];
    const user =
      code === 'adam'
        ? {id: 'adam', name: 'Admin'}
        : users.find(({id}) => id === code);
    if (!user) {
      throw new Error('Invalid user');
    }
    return {user};
  },
});

server.listen().then(({url}) => console.log(`🚀  Server ready at ${url}`));
