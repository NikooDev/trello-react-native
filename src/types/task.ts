import { PriorityEnum } from '@Type/project';

export interface TaskInterface {
	uid: string;
	userUID: string;
	title: string;
	start: Date | null;
	end: Date | null;
	description: string | null;
	author: string;
	contributors: string[] | null;
	priority: PriorityEnum | null;
	created: Date;
}

export interface TaskProjectInterface {
	item: TaskInterface;
	index: number;
}
