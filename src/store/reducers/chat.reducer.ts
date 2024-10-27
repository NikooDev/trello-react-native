import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatStateInterface } from '@Type/chat';
import { StateStatusEnum } from '@Type/store';
import { addMessage, removeMessage, setMessage } from '@Action/chat.action';

export const chatSlice = createSlice({
	name: 'chatReducer',
	initialState: {
		messages: [],
		chatProject: null,
		loading: false,
		status: StateStatusEnum.IDLE,
		error: null
	} as ChatStateInterface, reducers: {
		setChatProject: (state, action: PayloadAction<ChatStateInterface['chatProject']>) => {
			state.chatProject = action.payload;
		}, resetChats: (state) => {
			state.messages = [];
		}
	},
	extraReducers: (builder) => {
		builder.addCase(addMessage.pending, (state) => {
			state.loading = true;
			state.status = StateStatusEnum.LOADING;
			state.error = null;
		}).addCase(addMessage.fulfilled, (state, action) => {
			state.loading = false;
			state.status = StateStatusEnum.SUCCESS;

			const existingMessages = state.messages.filter((message) => message.uid !== action.payload.uid);

			state.messages = [action.payload, ...existingMessages];
		}).addCase(addMessage.rejected, (state, action) => {
			state.loading = false;
			state.status = StateStatusEnum.ERROR;
			state.error = action.payload as string;
		}).addCase(setMessage.pending, (state) => {
			state.loading = true;
			state.status = StateStatusEnum.LOADING;
			state.error = null;
		}).addCase(setMessage.fulfilled, (state, action) => {
			state.loading = false;
			state.status = StateStatusEnum.SUCCESS;

			state.messages = state.messages.map((message) => message.uid === action.meta.arg.message.uid ? {...message, ...action.payload} : message);
		}).addCase(setMessage.rejected, (state, action) => {
			state.loading = false;
			state.status = StateStatusEnum.ERROR;
			state.error = action.payload as string;
		}).addCase(removeMessage.pending, (state) => {
			state.loading = true;
			state.status = StateStatusEnum.LOADING;
			state.error = null;
		}).addCase(removeMessage.fulfilled, (state, action) => {
			state.loading = false;
			state.status = StateStatusEnum.SUCCESS;

			state.messages = state.messages.filter((message) => message.uid !== action.meta.arg.messageUID);
		}).addCase(removeMessage.rejected, (state, action) => {
			state.loading = false;
			state.status = StateStatusEnum.ERROR;
			state.error = action.payload as string;
		});
	}
});

export const { setChatProject, resetChats } = chatSlice.actions;
export default chatSlice.reducer;
