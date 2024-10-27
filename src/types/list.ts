import CommonInterface from '@Type/common';
import StatusStateInterface from '@Type/store';
import { ProjectInterface } from '@Type/project';
import { TaskInterface } from '@Type/task';
import { UserInterface } from '@Type/user';

export interface ListInterface extends CommonInterface {
	title: string;
}

export type CreateListInterface = Omit<ListInterface, 'uid'>;

export interface ListStateInterface extends StatusStateInterface {
	lists: ListInterface[];
}

export interface ListItemInterface {
	list: ListInterface;
	listActive: string | null;
	user: UserInterface;
	loading: boolean;
	loadingTask: boolean;
	project: ProjectInterface;
}
