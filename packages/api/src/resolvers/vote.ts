import {Result} from '../types/result';
import {Round} from '../types/round';
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
    winners(pollId: ID!): [Option!]!
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

    winners: (_: any, params: {pollId: string}, context: {user: User}) => {
      if (context.user.id !== 'adam') {
        return [];
      }
      const poll = store.get('polls').find(({id}) => id === params.pollId);
      const options = poll.options;

      let results: Result[] = store.get('results') || [];
      results = results.filter(result => result.pollId !== params.pollId);

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
      const result: Result = {
        pollId: params.pollId,
        rounds: [],
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

        result.rounds.push(round);


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
            const winner = options.find(option => option.id === id);
            store.set('results', [...results, result]);
            return [winner];
          }
        }

        if (!Object.keys(tally).filter(id => tally[id]).length) {
          store.set('results', [...results, result]);
          return activeOptions.map(id =>
            options.find(option => option.id === id),
          );
        }
      }
    },
  },
};
