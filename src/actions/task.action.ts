import { createAsyncThunk } from '@reduxjs/toolkit';
import FirestoreService from '@Service/firebase/store';
import { isProjectGuardAdmin } from '@Action/project.action';
import { CreateTaskInterface, TaskInterface } from '@Type/task';
import { ProjectInterface } from '@Type/project';
import { Timestamp } from 'firebase/firestore';

export const addTask = createAsyncThunk(
	'task/add',
	async (projectTask: { task: CreateTaskInterface, projectUID: string, listUID: string }, {rejectWithValue}) => {
		const firestore = new FirestoreService<TaskInterface>(`projects/${projectTask.projectUID}/lists/${projectTask.listUID}/tasks`);
		const firestoreProject = new FirestoreService<ProjectInterface>('projects');

		if (!projectTask.projectUID) {
			return rejectWithValue('UID du projet manquant');
		}

		const error = await isProjectGuardAdmin(projectTask.projectUID, firestoreProject);

		if (error) {
			return rejectWithValue(error);
		}

		const tasks = {
			...projectTask.task,
			start: projectTask.task.start ? projectTask.task.start.toJSDate() : null,
			end: projectTask.task.end ? projectTask.task.end.toJSDate() : null
		};

		try {
			const taskCreated = await firestore.createDocument<TaskInterface>(tasks as TaskInterface);

			if (!taskCreated.valid || !taskCreated.uid) {
				return rejectWithValue(`Erreur lors de la création de la tâche ${projectTask.task.title}`);
			}

			return {
				...projectTask.task,
				uid: taskCreated.uid,
			};
		} catch (err) {
			return rejectWithValue('Erreur lors de la création de la tâche');
		}
	}
)

export const getTasks = createAsyncThunk(
	'task/getAll',
	async (projectTask: { projectUID: string, listUID: string }, { rejectWithValue }) => {
		const firestore = new FirestoreService<TaskInterface>(`projects/${projectTask.projectUID}/lists/${projectTask.listUID}/tasks`);

		try {
			const tasks = await firestore.search<TaskInterface>([{
				sortBy: 'order',
				direction: 'asc'
			}]);

			tasks.map((task) => {
				if (task.start) {
					task.start = firestore.transformDate(task.start);
				}
				if (task.end) {
					task.end = firestore.transformDate(task.end);
				}

				return task
			})

			return tasks;
		} catch (err) {
			console.log(err);
			return rejectWithValue('Erreur lors de la récupération des tâches');
		}
	}
)

export const reorderTasks = async (reorderTask: { tasks: Partial<TaskInterface>[], projectUID: string, listUID: string }): Promise<boolean> => {
	const firestore = new FirestoreService<TaskInterface>(`projects/${reorderTask.projectUID}/lists/${reorderTask.listUID}/tasks`);

	const batchTasks = reorderTask.tasks
	.filter((task): task is { uid: string } => !!task.uid)
	.map((task, index) => ({
		uid: task.uid,
		order: index
	}))

	try {
		return await firestore.batchUpdate(batchTasks);
	} catch (err) {
		console.log(err);
		return false
	}
}

export const setTask = createAsyncThunk(
	'task/set',
	async (updateTask: { task: TaskInterface, projectUID: string, listUID: string }, { rejectWithValue }) => {
		const firestore = new FirestoreService<TaskInterface>(`projects/${updateTask.projectUID}/lists/${updateTask.listUID}/tasks`);
		const firestoreProject = new FirestoreService<ProjectInterface>('projects');

		if (!updateTask.projectUID) {
			return rejectWithValue('UID du projet manquant');
		}

		if (!updateTask.task.uid) {
			return rejectWithValue('UID de la tâche manquant');
		}

		const error = await isProjectGuardAdmin(updateTask.projectUID, firestoreProject);

		if (error) {
			return rejectWithValue(error);
		}

		const task = {
			...updateTask.task,
			start: updateTask.task.start ? Timestamp.fromDate(updateTask.task.start.toJSDate()) : null,
			end: updateTask.task.end ? Timestamp.fromDate(updateTask.task.end.toJSDate()) : null
		};

		try {
			const updatedTask = await firestore.updateDocument(updateTask.task.uid, { ...task as TaskInterface });

			if (updatedTask) {
				if (updatedTask.start) {
					updatedTask.start = firestore.transformDate(updatedTask.start);
				}

				if (updatedTask.end) {
					updatedTask.end = firestore.transformDate(updatedTask.end);
				}
			}

			return updatedTask;
		} catch (err) {
			console.log(err);
			return rejectWithValue('Erreur lors de la mise à jour de la tâche');
		}
	}
)

export const removeTask = createAsyncThunk(
	'task/remove',
	async ({ projectUID, listUID, taskUID }: { projectUID: string, listUID: string, taskUID: string }, { rejectWithValue }) => {
		const firestore = new FirestoreService<TaskInterface>(`projects/${projectUID}/lists/${listUID}/tasks`);
		const firestoreProject = new FirestoreService<ProjectInterface>('projects');

		if (!taskUID) {
			return rejectWithValue('UID de la tâche manquant.');
		}

		const error = await isProjectGuardAdmin(projectUID, firestoreProject);

		if (error) {
			return rejectWithValue(error);
		}

		try {
			return await firestore.deleteDocument(taskUID);
		} catch (err) {
			return rejectWithValue('Erreur lors de la suppression de la tâche.');
		}
	}
)
