import { createSlice } from '@reduxjs/toolkit';
import { ListStateInterface } from '@Type/list';
import { StateStatusEnum } from '@Type/store';
import { addList, getLists, removeList, setList } from '@Action/list.action';

export const listSlice = createSlice({
	name: 'listReducer',
	initialState: {
		lists: [],
		loading: false,
		status: StateStatusEnum.IDLE,
		error: null
	} as ListStateInterface,
	reducers: {
		resetLists: (state) => {
			state.lists = [];
		}
	},
	extraReducers: (builder) => {
		builder.addCase(addList.pending, (state) => {
			state.loading = true;
			state.error = null;
			state.status = StateStatusEnum.LOADING;
		}).addCase(addList.fulfilled, (state, action) => {
			state.loading = false;
			state.lists.push(action.payload);
			state.status = StateStatusEnum.SUCCESS;
		}).addCase(addList.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
			state.status = StateStatusEnum.ERROR;
		}).addCase(getLists.pending, (state) => {
			state.loading = true;
			state.error = null;
			state.status = StateStatusEnum.LOADING;
		}).addCase(getLists.fulfilled, (state, action) => {
			state.loading = false;
			state.lists = action.payload;
			state.status = StateStatusEnum.SUCCESS;
		}).addCase(getLists.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
			state.status = StateStatusEnum.ERROR;
		}).addCase(setList.pending, (state) => {
			state.loading = true;
			state.status = StateStatusEnum.LOADING;
			state.error = null;
		}).addCase(setList.fulfilled, (state, action) => {
			state.loading = false;

			state.lists = state.lists.map((list) => list.uid === action.meta.arg.list.uid ? {...list, ...action.payload} : list);

			state.status = StateStatusEnum.SUCCESS;
		}).addCase(setList.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
			state.status = StateStatusEnum.ERROR;
		}).addCase(removeList.pending, (state) => {
			state.loading = true;
			state.status = StateStatusEnum.LOADING;
			state.error = null;
		}).addCase(removeList.fulfilled, (state, action) => {
			state.loading = false;
			state.lists = state.lists.filter((list) => list.uid !== action.meta.arg.listUID);
			state.status = StateStatusEnum.SUCCESS;
		}).addCase(removeList.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
			state.status = StateStatusEnum.ERROR;
		});
	}
});

export const { resetLists } = listSlice.actions;
export default listSlice.reducer;
