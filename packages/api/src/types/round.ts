export interface Round {
  pollId: string;
  loserIds: string[];
  minVotes: number;
  voteIds: string[];
  votesRequired: number;
}
