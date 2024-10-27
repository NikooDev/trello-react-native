import CommonInterface from '@Type/common';
import { MembersInterface, PriorityEnum, ProjectInterface } from '@Type/project';
import { DateTime } from 'luxon';
import StatusStateInterface from '@Type/store';
import { UserInterface } from '@Type/user';

export interface TaskInterface extends CommonInterface {
	userUID: string;
	title: string;
	author: string;
	description: string | null;
	start: DateTime | null;
	end: DateTime | null;
	status: 'active' | 'end' | 'soon';
	contributors: MembersInterface[] | null;
	priority: PriorityEnum | null;
	order: number;
}

export type CreateTaskInterface = Omit<TaskInterface, 'uid'>;

export interface TaskStateInterface extends StatusStateInterface {
	tasks: TaskInterface[];
	task: TaskInterface | null;
}

export interface TaskItemInterface {
	task: TaskInterface;
	user: UserInterface;
	project: ProjectInterface;
	listUID: string;
}
