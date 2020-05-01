import merge from 'lodash/merge';

import * as Poll from './poll';
import * as Result from './result';
import * as User from './user';
import * as Vote from './vote';

const entities = [
  {
    typeDefs: `
      type Query {
        test: Boolean!
      }
      type Mutation {
        test: Boolean!
      }
    `,
    resolvers: {
      Query: {test: () => true},
      Mutation: {test: () => true},
    },
  },
  Poll,
  Result,
  User,
  Vote,
];

const typeDefs = entities.map(({typeDefs}) => typeDefs);
const resolvers = merge(entities.map(({resolvers}) => resolvers));

export {typeDefs, resolvers};
