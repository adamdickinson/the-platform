import {Poll} from '../types/poll';
import {Result} from '../types/result';
import {Round} from '../types/round';
import {createStore} from '../helpers/store';

const store = createStore();

export const typeDefs = `
  type Round {
    losers: [Option!]!
    minVotes: Int!
    votes: [Option!]!
    votesRequired: Int!
  }

  type Result {
    poll: Poll!
    rounds: [Round!]!
  }

  extend type Query {
    result(pollId: String!): Result!
  }
`;

export const resolvers = {
  Result: {
    poll: (result: Result) => {
      const polls: Poll[] = store.get('polls') || [];
      return polls.find(({id}) => id === result.pollId);
    },
  },

  Round: {
    losers: (round: Round) => {
      const polls: Poll[] = store.get('polls') || [];
      const poll = polls.find(({id}) => id === round.pollId);
      const options = poll.options;
      return options.filter(option => round.loserIds.includes(option.id));
    },

    votes: (round: Round) => {
      const polls: Poll[] = store.get('polls') || [];
      const poll = polls.find(({id}) => id === round.pollId);
      const options = poll.options;
      return round.voteIds.map(id => options.find(option => option.id === id));
    },
  },

  Query: {
    result: (_: any, params: {pollId: string}) => {
      const results: Result[] = store.get('results') || [];
      return results.find(({pollId}) => pollId === params.pollId);
    },
  },
};
