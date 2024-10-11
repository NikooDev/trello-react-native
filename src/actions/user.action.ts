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
			const user = await firestore.getDocument(userUId);

      if (!user) {
        return rejectWithValue('Utilisateur non trouvé');
      }

      return user;
    } catch (error) {
      return rejectWithValue('Erreur lors de la récupération de l\'utilisateur');
    }
  }
);
