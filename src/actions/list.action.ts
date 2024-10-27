import FirestoreService from '@Service/firebase/store';
import { isProjectGuardAdmin } from '@Action/project.action';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { CreateListInterface, ListInterface } from '@Type/list';
import { ProjectInterface } from '@Type/project';

export const addList = createAsyncThunk(
	'list/add',
	async (projectList: { list: CreateListInterface, projectUID: string }, {rejectWithValue}) => {
		const firestore = new FirestoreService<ListInterface>(`projects/${projectList.projectUID}/lists`);
		const firestoreProject = new FirestoreService<ProjectInterface>('projects');

		if (!projectList.projectUID) {
			return rejectWithValue('UID du projet manquant');
		}

		const error = await isProjectGuardAdmin(projectList.projectUID, firestoreProject);

		if (error) {
			return rejectWithValue(error);
		}

		try {
			const listCreated = await firestore.createDocument<ListInterface>(projectList.list as ListInterface);

			if (!listCreated.valid || !listCreated.uid) {
				return rejectWithValue(`Erreur lors de la création de la liste ${projectList.list.title}`);
			}

			return {
				...projectList.list,
				uid: listCreated.uid,
			};
		} catch (err) {
			return rejectWithValue('Erreur lors de la création de la liste');
		}
	}
)

export const getLists = createAsyncThunk(
	'list/getAll',
	async (projectUID: string, { rejectWithValue }) => {
		const firestore = new FirestoreService<ListInterface>(`projects/${projectUID}/lists`);

		try {
			return await firestore.search<ListInterface>([{
				sortBy: 'created',
				direction: 'asc'
			}]);
		} catch (err) {
			console.log(err);
			return rejectWithValue('Erreur lors de la récupération des listes');
		}
	}
)

export const setList = createAsyncThunk(
	'list/set',
	async (updateList: { list: Partial<ListInterface>, projectUID: string }, { rejectWithValue }) => {
		const firestore = new FirestoreService<ListInterface>(`projects/${updateList.projectUID}/lists`);
		const firestoreProject = new FirestoreService<ListInterface>('projects');

		if (!updateList.projectUID) {
			return rejectWithValue('UID du projet manquant');
		}

		if (!updateList.list.uid) {
			return rejectWithValue('UID de la liste manquant');
		}

		const error = await isProjectGuardAdmin(updateList.projectUID, firestoreProject);

		if (error) {
			return rejectWithValue(error);
		}

		try {
			return await firestore.updateDocument(updateList.list.uid, { ...updateList.list });
		} catch (err) {
			return rejectWithValue('Erreur lors de la mise à jour de la liste');
		}
	}
)

export const removeList = createAsyncThunk(
	'list/remove',
	async ({ projectUID, listUID }: { projectUID: string, listUID: string }, { rejectWithValue }) => {
		const firestore = new FirestoreService<ListInterface>(`projects/${projectUID}/lists`);
		const firestoreProject = new FirestoreService<ListInterface>('projects');

		if (!listUID) {
			return rejectWithValue('UID de la liste manquant.');
		}

		const error = await isProjectGuardAdmin(projectUID, firestoreProject);

		if (error) {
			return rejectWithValue(error);
		}

		try {
			return await firestore.deleteDocument(listUID);
		} catch (err) {
			return rejectWithValue('Erreur lors de la suppression de la liste.');
		}
	}
)
