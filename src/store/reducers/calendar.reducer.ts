import { StateStatusEnum } from '@Type/store';
import { currentDateTime } from '@Util/constants';
import { CalendarStateInterface, DayInterface } from '@Type/calendar';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getCalendarTasks } from '@Action/calendar.action';
import { getDays } from '@Util/functions';

export const calendarSlice = createSlice({
	name: 'calendarReducer',
	initialState: {
		tasks: [],
		tasksAll: [],
		selectedDay: currentDateTime.day,
		currentMonth: currentDateTime.month,
		currentYear: currentDateTime.year,
		direction: 'right',
		heightDays: 260,
		expand: false,
		days: [],
		loading: false,
		status: StateStatusEnum.IDLE,
		error: null
	} as CalendarStateInterface,
	reducers: {
		setSelectedDay(state, action: PayloadAction<number | null>) {
			state.selectedDay = action.payload;
		},
		setCurrentMonth(state, action: PayloadAction<number>) {
			state.currentMonth = action.payload;
			state.days = getDays(state.currentMonth, state.currentYear);
		},
		setCurrentYear(state, action: PayloadAction<number>) {
			state.currentYear = action.payload;
			state.days = getDays(state.currentMonth, state.currentYear);
		},
		setDays(state, action: PayloadAction<DayInterface[]>) {
			state.days = action.payload;
		},
		setDirection(state, action: PayloadAction<'left' | 'right'>) {
			state.direction = action.payload;
		},
		setExpand(state, action: PayloadAction<boolean>) {
			state.expand = action.payload;
		},
		setHeightDays(state, action: PayloadAction<number>) {
			state.heightDays = action.payload;
		}
	},
	extraReducers: (builder) => {
		builder.addCase(getCalendarTasks.pending, (state) => {
			state.loading = true;
			state.status = StateStatusEnum.LOADING;
			state.error = null;
		}).addCase(getCalendarTasks.fulfilled, (state, action) => {
			state.loading = false;

			const currentUserUID = action.meta.arg.userUID;

			if (action.meta.arg.isAll) {
				state.tasksAll = action.payload.filter(task =>
					task.userUID === currentUserUID ||
					task.contributors && task.contributors.some(contributor => contributor.uid === currentUserUID)
				);
			} else {
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

export const {
	setDays, setSelectedDay, setCurrentMonth,
	setCurrentYear, setDirection, setExpand, setHeightDays
} = calendarSlice.actions;

export default calendarSlice.reducer;
