import { createSlice } from '@reduxjs/toolkit';
import { StateStatusEnum } from '@Type/store';
import { TaskStateInterface } from '@Type/task';
import { addTask, getTasks, removeTask, setTask } from '@Action/task.action';

export const taskSlice = createSlice({
	name: 'taskReducer',
	initialState: {
		tasks: [],
		task: null,
		loading: false,
		status: StateStatusEnum.IDLE,
		error: null
	} as TaskStateInterface,
	reducers: {
		setOrderTask: (state, action) => {
			state.loading = true;
			state.tasks = action.payload;
		},
		setHideLoading: (state) => {
			state.loading = false;
		},
		resetTasks: (state) => {
			state.tasks = [];
		},
		setLocalTask: (state, action) => {
			state.task = action.payload
		}
	},
	extraReducers: (builder) => {
		builder.addCase(addTask.pending, (state) => {
			state.loading = true;
			state.error = null;
			state.status = StateStatusEnum.LOADING;
		}).addCase(addTask.fulfilled, (state, action) => {
			state.loading = false;
			state.tasks.push(action.payload);
			state.status = StateStatusEnum.SUCCESS;
		}).addCase(addTask.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
			state.status = StateStatusEnum.ERROR;
		}).addCase(getTasks.pending, (state) => {
			state.loading = true;
			state.error = null;
			state.status = StateStatusEnum.LOADING;
		}).addCase(getTasks.fulfilled, (state, action) => {
			state.loading = false;
			state.tasks = action.payload;
			state.status = StateStatusEnum.SUCCESS;
		}).addCase(getTasks.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
			state.status = StateStatusEnum.ERROR;
		}).addCase(setTask.pending, (state) => {
			state.loading = true;
			state.status = StateStatusEnum.LOADING;
			state.error = null;
		}).addCase(setTask.fulfilled, (state, action) => {
			state.loading = false;

			state.tasks = state.tasks.map((task) => task.uid === action.meta.arg.task.uid ? {...task, ...action.payload} : task);

			state.status = StateStatusEnum.SUCCESS;
		}).addCase(setTask.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
			state.status = StateStatusEnum.ERROR;
		}).addCase(removeTask.pending, (state) => {
			state.loading = true;
			state.status = StateStatusEnum.LOADING;
			state.error = null;
		}).addCase(removeTask.fulfilled, (state, action) => {
			state.loading = false;
			state.tasks = state.tasks.filter((task) => task.uid !== action.meta.arg.taskUID);
			state.status = StateStatusEnum.SUCCESS;
		}).addCase(removeTask.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
			state.status = StateStatusEnum.ERROR;
		});
	}
});

export const { setOrderTask, resetTasks, setHideLoading, setLocalTask } = taskSlice.actions;
export default taskSlice.reducer;
