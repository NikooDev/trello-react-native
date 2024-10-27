import FirestoreService from '@Service/firebase/store';
import Firebase from '@Service/firebase/init';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { CreateProjectInterface, MemberRoleEnum, ProjectInterface } from '@Type/project';


/**
 * @description Check if the user is an admin or a member admin of the project
 * @param projectUID
 * @param firestore
 */
export const isProjectGuardAdmin = async (projectUID: string, firestore: FirestoreService<ProjectInterface>): Promise<string | null> => {
	const projectExist = await firestore.getDocument<ProjectInterface>(projectUID);

	if (!projectExist) {
		return `Le projet ${projectUID} n'existe pas.`;
	}

	const auth = new Firebase().auth;

	if (!auth.currentUser) {
		return 'Votre session a expiré, veuillez vous reconnecter.';
	}

	const currentUser = auth.currentUser.uid;

	const isAdmin = projectExist.adminUID === currentUser;
	const isMemberAdmin = projectExist.members.some(member => member.uid === currentUser && member.role === MemberRoleEnum.ADMIN);

	if (!isAdmin && !isMemberAdmin) {
		return 'Vous devez être administrateur du projet pour effectuer cette action.';
	}

	return null;
}

/**
 * @description Add a project
 */
export const addProject = createAsyncThunk(
	'project/add',
	async (project: CreateProjectInterface, { rejectWithValue }) => {
		const firestore = new FirestoreService<ProjectInterface>('projects');

		try {
			const projectCreated = await firestore.createDocument<ProjectInterface>(project as ProjectInterface);

			if (!projectCreated.valid || !projectCreated.uid) {
				return rejectWithValue('Erreur lors de la création du projet.');
			}

			return {
				...project,
				uid: projectCreated.uid
			};
		} catch (err) {
			return rejectWithValue('Erreur lors de la création du projet.');
		}
	}
)

/**
 * @description Get all projects
 */
export const getProjects = createAsyncThunk(
	'project/getAll',
	async (userUID: string, { rejectWithValue }) => {
		const firestore = new FirestoreService<ProjectInterface>('projects');

		try {
			return await firestore.search<ProjectInterface>([{
				or: [{
					where: 'adminUID',
					operator: '==',
					value: userUID
				}, {
					where: 'membersUID',
					operator: 'array-contains',
					value: userUID
				}]
			}, {
				sortBy: 'created',
				direction: 'desc'
			}]);
		} catch (err) {
			console.log(err);
			return rejectWithValue('Erreur lors de la récupération des projets.');
		}
	}
)

/**
 * @description Get a project by UID
 */
export const getProject = createAsyncThunk(
	'project/get',
	async (projectUID: string, { rejectWithValue }) => {
		const firestore = new FirestoreService<ProjectInterface>('projects');

		try {
			return await firestore.getDocument<ProjectInterface>(projectUID);
		} catch (err) {
			return rejectWithValue(`Erreur lors de la récupération du projet : ${projectUID}.`);
		}
	}
)

/**
 * @description Set a project by UID
 */
export const setProject = createAsyncThunk(
	'project/set',
	async (project: Partial<ProjectInterface>, { rejectWithValue }) => {
		const firestore = new FirestoreService<ProjectInterface>('projects');

		if (!project.uid) {
			return rejectWithValue('UID du projet manquant.');
		}

		const error = await isProjectGuardAdmin(project.uid, firestore);

		if (error) {
			return rejectWithValue(error);
		}

		try {
			return await firestore.updateDocument(project.uid, { ...project });
		} catch (err) {
			return rejectWithValue('Erreur lors de la mise à jour du projet.');
		}
	}
)

/**
 * @description Remove a project by UID
 */
export const removeProject = createAsyncThunk(
	'project/remove',
	async (projectUID: string, { rejectWithValue }) => {
		const firestore = new FirestoreService<ProjectInterface>('projects');

		if (!projectUID) {
			return rejectWithValue('UID du projet manquant.');
		}

		const error = await isProjectGuardAdmin(projectUID, firestore);

		if (error) {
			return rejectWithValue(error);
		}

		try {
			return await firestore.deleteDocument(projectUID);
		} catch (err) {
			return rejectWithValue('Erreur lors de la suppression du projet.');
		}
	}
)
