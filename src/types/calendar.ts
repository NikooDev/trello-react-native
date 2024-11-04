import { TaskInterface } from '@Type/task';
import StatusStateInterface from '@Type/store';

export interface DayInterface {
	day: number | null;
	disabled: boolean
}

export interface CalendarStateInterface extends StatusStateInterface {
	tasks: TaskInterface[];
	tasksAll: TaskInterface[];
	direction: 'left' | 'right';
	expand: boolean;
	heightDays: number | null;
	selectedDay: number | null;
	currentMonth: number;
	currentYear: number;
	days: DayInterface[];
}
