import { createAsyncThunk } from '@reduxjs/toolkit';
import FirestoreService from '@Service/firebase/store';
import { TaskInterface } from '@Type/task';
import { ListInterface } from '@Type/list';
import { LimitSearchParameter, OrSearchParameter, SortSearchParameter, WhereSearchParameter } from '@Type/firestore';

export const getCalendarTasks = createAsyncThunk(
	'calendar/getAll',
	async (calendarTasks: { projectUID: string, start?: Date, end?: Date, userUID: string, isAll: boolean }, { rejectWithValue }) => {
		const firestoreLists = new FirestoreService<ListInterface>(`projects/${calendarTasks.projectUID}/lists`);

		try {
			const lists = (await firestoreLists.search([])) as ListInterface[];
			const allTasksPromises = lists.map(async (list) => {
				const firestoreTasks = new FirestoreService<TaskInterface>(`projects/${calendarTasks.projectUID}/lists/${list.uid}/tasks`);

				const isAll = calendarTasks.isAll ? [] : [
					{ where: 'start', operator: '<=', value: calendarTasks.end },
					{ where: 'end', operator: '>=', value: calendarTasks.start }
				] as (WhereSearchParameter | OrSearchParameter | SortSearchParameter | LimitSearchParameter)[];

				/**
				 * @description Get tasks for selected day
				 * Request filtered by start and end date
				 */
				const tasks = await firestoreTasks.search(isAll) as TaskInterface[];

				tasks.map((task) => {
					if (task.start) {
						task.start = firestoreTasks.transformDate(task.start);
					}
					if (task.end) {
						task.end = firestoreTasks.transformDate(task.end);
					}

					return task
				})

				return tasks;
			});

			return (await Promise.all(allTasksPromises)).flat() as TaskInterface[];
		} catch (err) {
			return rejectWithValue('Erreur lors de la récupération des tâches.');
		}
	}
)
