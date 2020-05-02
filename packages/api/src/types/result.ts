import { Option } from './option';
import { Round } from './round';

export interface Result {
  pollId: string;
  rounds: Round[];
  winners: Option[];
}
