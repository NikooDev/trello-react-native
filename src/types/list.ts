import { TaskInterface } from '@Type/task';
import { CreatedInterface } from '@Type/firestore';

export interface ListInterface extends CreatedInterface {
	uid: string | null;
	title: string;
	tasks: TaskInterface[];
	created: Date;
}

export interface ListStateInterface {
	lists: ListInterface[];
	loading: boolean;
	loadingTask: boolean;
	error: string | null;
}

export interface ListProjectInterface {
	item: ListInterface | { [key: string]: any };
	nbTasks: number;
	projectUID: string;
}
