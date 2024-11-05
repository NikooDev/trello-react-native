import FirestoreService from '@Service/firebase/store';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ChatInterface } from '@Type/chat';
import { Timestamp } from 'firebase/firestore';

export const addMessage = createAsyncThunk(
	'chat/add',
	async (projectChat: { message: ChatInterface, projectUID: string }, {rejectWithValue}) => {
		const firestore = new FirestoreService<ChatInterface>(`projects/${projectChat.projectUID}/chats`);

		if (!projectChat.projectUID) {
			return rejectWithValue('UID du projet manquant');
		}

		try {
			const chatCreated = await firestore.createDocument<ChatInterface>(projectChat.message);

			if (!chatCreated.valid || !chatCreated.uid) {
				return rejectWithValue(`Erreur lors de la création du message ${projectChat.message.content}`);
			}

			return {
				...projectChat.message,
				uid: chatCreated.uid
			};
		} catch (err) {
			return rejectWithValue('Erreur lors de la création du message');
		}
	}
)

export const setMessage = createAsyncThunk(
	'chat/set',
	async (updateMessage: { message: Partial<ChatInterface>, projectUID: string }, { rejectWithValue }) => {
		const firestore = new FirestoreService<ChatInterface>(`projects/${updateMessage.projectUID}/chats`);

		if (!updateMessage.projectUID) {
			return rejectWithValue('UID du projet manquant');
		}

		if (!updateMessage.message.uid) {
			return rejectWithValue('UID du message manquant');
		}

		const message = {
			...updateMessage.message,
			create: updateMessage.message.created ? Timestamp.fromDate(updateMessage.message.created.toJSDate()) : new Date()
		}

		try {
			return await firestore.updateDocument(updateMessage.message.uid, { ...message as ChatInterface }, true);
		} catch (err) {
			return rejectWithValue('Erreur lors de la mise à jour du projet');
		}
	}
)

/**
 * @description Remove a message by UID
 */
export const removeMessage = createAsyncThunk(
	'chat/remove',
	async ({ projectUID, messageUID }: { projectUID: string, messageUID: string }, { rejectWithValue }) => {
		const firestore = new FirestoreService<ChatInterface>(`projects/${projectUID}/chats`);

		if (!messageUID) {
			return rejectWithValue('UID du message manquant.');
		}

		try {
			return await firestore.deleteDocument(messageUID);
		} catch (err) {
			return rejectWithValue('Erreur lors de la suppression du message.');
		}
	}
)
