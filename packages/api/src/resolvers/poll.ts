import {v1 as uuid} from 'uuid';

import {Option} from '../types/option';
import {Poll} from '../types/poll';
import {User} from '../types/user';
import { Vote } from '../types/vote';
import {createStore} from '../helpers/store';

const POLL_URL = 'http://vote.adamdickinson.com.au/poll/';

const store = createStore();

export const typeDefs = `
  type Option {
    id: ID!
    name: String!
  }

  type Link {
    url: String!
    user: User!
  }

  type Poll {
    id: ID!
    name: String!
    options: [Option!]!
    links: [Link!]
  }

  extend type Query {
    poll(id: ID!): Poll!
    polls: [Poll!]!
  }

  extend type Mutation {
    createPoll(name: String!, options: [String!]!): Poll!
    deletePoll(pollId: ID!): Poll!
    updatePoll(pollId: ID!, name: String, options: [String!]): Poll!
  }
`;

export const resolvers = {
  Mutation: {
    createPoll: (_: any, params: {name: string; options: string[]}) => {
      const options: Option[] = params.options.map((name: string) => {
        const option: Option = {
          id: uuid(),
          name,
        };

        return option;
      });

      const poll: Poll = {
        id: uuid(),
        name: params.name,
        options,
      };

      const polls = store.get('polls') || [];
      polls.push(poll);
      store.set('polls', polls);

      return poll;
    },

    deletePoll: (_: any, params: {pollId: string}, context: {user: User}) => {
      if (context.user.id === 'adam') {
        const polls: Poll[] = store.get('polls') || [];
        const poll = polls.find(({ id }) => id === params.pollId);
        store.set('polls', polls.filter(({ id }) => id !== params.pollId));

        const votes: Vote[] = store.get('votes') || [];
        store.set('votes', votes.filter(({ pollId }) => pollId !== params.pollId));

        return poll;
      }
    },

    updatePoll: (
      _: any,
      params: {pollId: string; name?: string; options?: string[]},
    ) => {
      const polls = store.get('polls');
      const poll = polls.find(({id}) => params.pollId);

      if (params.name) {
        poll.name = params.name;
      }

      if (params.options) {
        const newOptions: Option[] = params.options.map(name => ({
          id: uuid(),
          name,
        }));

        poll.options = newOptions;
      }

      store.set('polls', polls);
      return poll;
    },
  },

  Poll: {
    links: (poll: Poll, _: any, context: {user: User}) => {
      if (context.user.id !== 'adam') {
        return;
      }

      const users = store.get('users') || [];
      return users.map(user => ({
        url:
          POLL_URL +
          Buffer.from(`${poll.id}:${user.id}`, 'utf8').toString('base64'),
        user,
      }));
    },
  },

  Query: {
    poll: (_: any, params: {id: string}) => {
      const polls = store.get('polls') || [];
      return polls.find(({id}) => id === params.id);
    },

    polls: () => store.get('polls') || [],
  },
};
