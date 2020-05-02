import {User} from '../types/user';
import {Vote} from '../types/vote';
import {createStore} from '../helpers/store';

const POLL_URL = 'http://vote.adamdickinson.com.au/poll/';

const store = createStore();

export const typeDefs = `
  type Vote {
    createdAt: String!
    poll: Poll!
    preferences: [Option!]!
    user: User!
  }

  extend type Query {
    votes: [Vote!]!
  }

  extend type Mutation {
    vote(pollId: ID!, preferences: [ID!]!): Vote!
  }
`;

export const resolvers = {
  Mutation: {
    vote: (
      _: any,
      params: {pollId: string; preferences: string[]},
      context: {user: User},
    ) => {
      const polls = store.get('polls');
      const poll = polls.find(({id}) => params.pollId === id);

      let votes = store.get('votes') || [];
      let optionsToChoose = [...poll.options];

      const options = params.preferences.map(optionId => {
        const option = optionsToChoose.find(({id}) => optionId === id);
        if (!option) {
          throw new Error('Option not available');
        }

        optionsToChoose = optionsToChoose.filter(({id}) => id !== optionId);
        return option;
      });

      if (optionsToChoose.length) {
        throw new Error('Not all preferences chosen');
      }

      const vote: Vote = {
        userId: context.user.id,
        createdAt: new Date().toISOString(),
        pollId: params.pollId,
        preferences: options,
      };

      // Remove other votes by this person for this poll
      votes = votes.filter(
        ({userId, pollId}) =>
          !(userId === vote.userId && pollId === vote.pollId),
      );

      votes.push(vote);
      store.set('votes', votes);
      return vote;
    },
  },

  Vote: {
    user: (vote: Vote, _: any, context: {user: User}) => {
      if (context.user.id !== 'adam') {
        return;
      }

      const users = store.get('users');
      return users.find(({id}) => id === vote.userId);
    },
    poll: (vote: Vote, _: any, context: {user: User}) => {
      if (context.user.id !== 'adam') {
        return;
      }

      const polls = store.get('polls');
      return polls.find(({id}) => id === vote.pollId);
    },
  },

  Query: {
    votes: (_: any, __: any, context: {user: User}) =>
      context.user.id === 'adam' ? store.get('votes') || [] : [],
  },
};
