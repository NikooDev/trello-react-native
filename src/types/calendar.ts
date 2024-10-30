import React from 'react';
import { TaskInterface } from '@Type/task';
import StatusStateInterface from '@Type/store';
import { UserInterface } from '@Type/user';
import { ProjectInterface } from '@Type/project';

export interface DayInterface {
	day: number | null;
	disabled: boolean
}

export interface DaysInterface {
	days: DayInterface[];
	user: UserInterface;
	project: ProjectInterface | null;
	selectedDay: number | null;
	setSelectedDay: React.Dispatch<number | null>;
	currentDay: number;
	currentMonth: number;
	currentYear: number;
	calendarExpand: boolean;
	setCalendarExpand: React.Dispatch<boolean>;
}

export interface CalendarStateInterface extends StatusStateInterface {
	tasks: TaskInterface[];
	tasksAll: TaskInterface[];
}
