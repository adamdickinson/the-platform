import {v1 as uuid} from 'uuid';

import {User} from '../types/user';
import {createStore} from '../helpers/store';

const POLL_URL = 'http://vote.adamdickinson.com.au/poll/';

const store = createStore();

export const typeDefs = `
  type User {
    id: ID!
    code: String!
  }

  extend type Query {
    users: [User!]!
  }

  extend type Mutation {
    addUser: User!
    deleteUser(id: ID!): User!
  }
`;

export const resolvers = {
  Mutation: {
    addUser: () => {
      const users = store.get('users') || [];
      const user: User = {
        id: uuid(),
      };
      store.set('users', [...users, user]);
      return user;
    },

    deleteUser: (_: any, params: {id: string}, context: {user: User}) => {
      if (context.user.id !== 'adam') {
        return;
      }

      const users = store.get('users') || [];
      const user = users.find(({id}) => id === params.id);
      store.set(
        'users',
        users.filter(({id}) => id !== params.id),
      );
      return user;
    },
  },

  Query: {
    users: (_: any, __: any, context: {user: User}) => {
      if (context.user.id !== 'adam') {
        return [];
      }

      return store.get('users');
    },
  },
};
