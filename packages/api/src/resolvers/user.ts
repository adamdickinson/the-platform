import {v1 as uuid} from 'uuid';

import {User} from '../types/user';
import {createStore} from '../helpers/store';

const POLL_URL = 'http://vote.adamdickinson.com.au/poll/';

const store = createStore();

export const typeDefs = `
  type User {
    id: ID!
    code: String!
    name: String!
  }

  extend type Query {
    users: [User!]!
  }

  extend type Mutation {
    addUser(name: String): User!
  }
`;

export const resolvers = {
  Mutation: {
    addUser: (_: any, params: {name: string}) => {
      const users = store.get('users') || [];
      const user: User = {
        id: uuid(),
        name: params.name,
      };
      store.set('users', [...users, user]);
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
