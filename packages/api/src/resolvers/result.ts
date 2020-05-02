import {Poll} from '../types/poll';
import {Result} from '../types/result';
import {Round} from '../types/round';
import {User} from '../types/user';
import {Vote} from '../types/vote';
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
    winners: [Option!]!
  }

  extend type Query {
    result(pollId: ID!): Result!
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
    result: (_: any, params: {pollId: string}, context: {user: User}) => {
      if (context.user.id !== 'adam') {
        return [];
      }

      const poll = store.get('polls').find(({id}) => id === params.pollId);
      const options = poll.options;

      const votes: Vote[] = store
        .get('votes')
        .filter(vote => vote.pollId === params.pollId);

      const tally: Record<string, number> = {};
      let votePreferences = votes.map(({preferences}) => [...preferences]);

      const losers: string[] = [];
      options.forEach(({id}) => {
        tally[id] = 0;
      });

      const votesCast = votePreferences.length;
      const votesRequired = votesCast / 2;
      const newResult: Result = {
        pollId: params.pollId,
        rounds: [],
        winners: []
      };

      while (true) {
        // Clear tally
        Object.keys(tally).forEach(id => {
          tally[id] = 0;
        });

        const round: Round = {
          pollId: params.pollId,
          voteIds: [],
          minVotes: 0,
          votesRequired,
          loserIds: [...losers],
        };

        newResult.rounds.push(round);

        // Count top non-excluded preferences
        votePreferences.forEach(preferences => {
          if (preferences.length) {
            const nextPreference = preferences.find(
              ({id}) => !losers.includes(id),
            );
            round.voteIds.push(nextPreference.id);
            tally[nextPreference.id]++;
          }
        });

        const activeOptions = Object.keys(tally).filter(
          id => !losers.includes(id),
        );

        // Get minimum votes for any option
        const minVotes = Object.values(tally).reduce(
          (min, count) => Math.min(min, count),
          Infinity,
        );
        round.minVotes = minVotes;

        // Determine losers
        losers.push(...Object.keys(tally).filter(id => tally[id] === minVotes));
        losers.forEach(id => {
          delete tally[id];
        });

        // Find winner
        for (const id of Object.keys(tally)) {
          if (tally[id] > votesRequired) {
            newResult.winners = [options.find(option => option.id === id)];
            return newResult;
          }
        }

        if (!Object.keys(tally).filter(id => tally[id]).length) {
          newResult.winners = activeOptions.map(id =>
            options.find(option => option.id === id),
          );
          return newResult;
        }
      }
    },
  },
};
