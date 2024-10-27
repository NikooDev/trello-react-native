import FirestoreService from '@Service/firebase/store';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { UserInterface } from '@Type/user';

/**
 * @description Get user
 */
export const getUser = createAsyncThunk(
	'user/get',
	async (userUId: string, { rejectWithValue }) => {
		const firestore = new FirestoreService<UserInterface>('users');

		try {
			const user = await firestore.getDocument<UserInterface>(userUId);

			if (!user) {
				return rejectWithValue('Utilisateur non trouvé');
			}

			return user;
		} catch (error) {
			return rejectWithValue('Erreur lors de la récupération de l\'utilisateur');
		}
	}
);

/**
 * @description Set user
 */
export const setUser = createAsyncThunk(
	'user/set',
	async (user: Partial<UserInterface>, { rejectWithValue }) => {
		const firestore = new FirestoreService<UserInterface>('users');

		if (!user || !user.uid) {
			return rejectWithValue('Votre session a expiré, veuillez vous reconnecter');
		}

		try {
			return await firestore.updateDocument(user.uid, { ...user });
		} catch (error) {
			return rejectWithValue('Erreur lors de la mise à jour de l\'utilisateur');
		}
	}
)
