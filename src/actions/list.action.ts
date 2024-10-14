import { createAsyncThunk } from '@reduxjs/toolkit';
import { ListInterface } from '@Type/list';
import FirestoreService from '@Service/firebase/store';
import { isGuardAdmin } from '@Action/project.action';

export const addList = createAsyncThunk(
  'list/add',
  async (projectList: { list: ListInterface, projectUID: string }, {rejectWithValue}) => {
    const firestore = new FirestoreService<ListInterface>(`projects/${projectList.projectUID}/lists`);
		const firestoreProject = new FirestoreService<ListInterface>('projects');

		if (!projectList.projectUID) {
			return rejectWithValue('UID du projet manquant');
		}

		const error = await isGuardAdmin(projectList.projectUID, firestoreProject);

		if (error) {
			return rejectWithValue(error);
		}

    try {
      const listCreated = await firestore.createDocument<ListInterface>(projectList.list);

      if (!listCreated.valid) {
        return rejectWithValue(`Erreur lors de la création de la liste ${projectList.list.title}`);
      }

      return {
        ...projectList.list,
        uid: listCreated.uid,
      };
    } catch (err) {
      return rejectWithValue('Erreur lors de la création du projet');
    }
  },
);

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
			return rejectWithValue('Erreur lors de la récupération des projets');
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

		const error = await isGuardAdmin(updateList.projectUID, firestoreProject);

		if (error) {
			return rejectWithValue(error);
		}

		try {
			return await firestore.updateDocument(updateList.list.uid, { ...updateList.list });
		} catch (err) {
			return rejectWithValue('Erreur lors de la mise à jour du projet');
		}
	}
)
