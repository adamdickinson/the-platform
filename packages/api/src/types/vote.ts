import { Option } from './option';

export interface Vote {
  userId: string;
  createdAt: string;
  pollId: string;
  preferences: Option[];
}
