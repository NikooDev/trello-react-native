import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatStateInterface } from '@Type/chat';
import { StateStatusEnum } from '@Type/store';
import { addMessage, removeMessage, setMessage } from '@Action/chat.action';

export const chatSlice = createSlice({
	name: 'chatReducer',
	initialState: {
		chatProject: null,
		updateMessage: null,
		loading: false,
		status: StateStatusEnum.IDLE,
		error: null
	} as ChatStateInterface,
	reducers: {
		setChatProject: (state, action: PayloadAction<ChatStateInterface['chatProject']>) => {
			state.chatProject = action.payload;
		},
		setUpdateMessage: (state, action: PayloadAction<ChatStateInterface['updateMessage']>) => {
			state.updateMessage = action.payload;
		},
		setLoading: (state, action: PayloadAction<ChatStateInterface['loading']>) => {
			state.loading = action.payload;
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
			state.error = null
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
			state.error = null;
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
			state.error = null;
		}).addCase(removeMessage.rejected, (state, action) => {
			state.loading = false;
			state.status = StateStatusEnum.ERROR;
			state.error = action.payload as string;
		});
	}
});

export const { setChatProject, setUpdateMessage, setLoading } = chatSlice.actions;
export default chatSlice.reducer;
