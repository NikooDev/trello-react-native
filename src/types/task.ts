import React from 'react';
import CommonInterface from '@Type/common';
import { MembersInterface, PriorityEnum, ProjectInterface } from '@Type/project';
import { DateTime } from 'luxon';
import StatusStateInterface from '@Type/store';
import { UserInterface } from '@Type/user';

export interface TaskInterface extends CommonInterface {
	userUID: string;
	listUID: string;
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
	updated: boolean;
}

export interface TaskItemInterface {
	task: TaskInterface;
}

export interface TaskEditInterface {
	originalTask: TaskInterface;
	updateTask: TaskInterface;
	setEditTask: React.Dispatch<React.SetStateAction<boolean>>;
	setUpdateTask: React.Dispatch<React.SetStateAction<TaskInterface>>;
	listUID: string;
	project: ProjectInterface | null;
	loading: boolean;
	isAdmin: boolean;
}
