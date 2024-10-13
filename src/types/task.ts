import { PriorityEnum } from '@Type/project';

export interface TaskInterface {
	uid: string;
	userUID: string;
	projectUID: string;
	title: string;
	start: Date;
	end: Date;
	description: string;
	author: string;
	contributors: string[];
	priority: PriorityEnum;
	created: Date;
}
