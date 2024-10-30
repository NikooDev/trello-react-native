import { createSlice } from '@reduxjs/toolkit';
import { getCalendarTasks } from '@Action/calendar.action';
import { CalendarStateInterface } from '@Type/calendar';
import { StateStatusEnum } from '@Type/store';

export const calendarSlice = createSlice({
	name: 'calendarReducer',
	initialState: {
		tasks: [],
		tasksAll: [],
		loading: false,
		status: StateStatusEnum.IDLE,
		error: null
	} as CalendarStateInterface,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(getCalendarTasks.pending, (state) => {
			state.loading = true;
			state.status = StateStatusEnum.LOADING;
			state.error = null;
		}).addCase(getCalendarTasks.fulfilled, (state, action) => {
			state.loading = false;

			if (action.meta.arg.isAll) {
				state.tasksAll = action.payload;
			} else {
				const currentUserUID = action.meta.arg.userUID;

				state.tasks = action.payload.filter(task =>
					task.userUID === currentUserUID ||
					task.contributors && task.contributors.some(contributor => contributor.uid === currentUserUID)
				);
			}

			state.status = StateStatusEnum.SUCCESS;
		}).addCase(getCalendarTasks.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
			state.status = StateStatusEnum.ERROR;
		})
	}
})

export default calendarSlice.reducer;
