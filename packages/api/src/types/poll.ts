import { Option } from './option';

export interface Poll {
    id: string;
    name: string;
    options: Option[];
}
