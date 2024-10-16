import { createSlice } from '@reduxjs/toolkit';
import { ListInterface, ListStateInterface } from '@Type/list';
import { addList, getLists, setList } from '@Action/list.action';

export const listSlice = createSlice({
	name: 'listReducer',
	initialState: {
		lists: [] as ListInterface[],
		loading: false,
		loadingTask: false,
		error: null
	} as ListStateInterface,
	reducers: {
		resetLists: (state) => {
			state.lists = [];
		}
	},
	extraReducers: (builder) => {
		builder
		.addCase(addList.pending, (state) => {
			state.loading = true;
			state.error = null;
		})
		.addCase(addList.fulfilled, (state, action) => {
			state.loading = false;
			state.lists.push(action.payload);
		})
		.addCase(addList.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		})

		.addCase(getLists.pending, (state) => {
			state.loading = true;
			state.error = null;
		})
		.addCase(getLists.fulfilled, (state, action) => {
			state.loading = false;
			state.lists = action.payload;
		})
		.addCase(getLists.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		})

		.addCase(setList.pending, (state, action) => {
			if (action.meta.arg.list.title) {
				state.loading = true;
			} else {
				state.loadingTask = true;
			}

			state.error = null;
		})
		.addCase(setList.fulfilled, (state, action) => {
			state.loading = false;
			state.loadingTask = false;

			state.lists = state.lists.map((list) =>
				list.uid === action.meta.arg.list.uid ? { ...list, ...action.payload } : list
			);
		})
		.addCase(setList.rejected, (state, action) => {
			state.loading = false;
			state.loadingTask = false;
			state.error = action.payload as string;
		})
	}
})

export const { resetLists } = listSlice.actions;

export default listSlice.reducer;
