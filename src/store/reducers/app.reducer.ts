import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toggleBottomSheet } from '@Util/functions';
import { AppStateInterface } from '@Type/app';

export const appSlice = createSlice({
	name: 'appReducer',
	initialState: {
		calendarProject: null,
		bottomSheet: {
			open: false,
			enablePanDownToClose: true,
			handleStyle: true,
			height: 50,
			name: null,
			data: null
		}
	} as AppStateInterface,
	reducers: {
		openBottomSheet: toggleBottomSheet(true),
		closeBottomSheet: toggleBottomSheet(false),
		setCalendarProject: (state, action: PayloadAction<AppStateInterface['calendarProject']>) => {
			state.calendarProject = action.payload;
		}
	}
});

export const { openBottomSheet, closeBottomSheet, setCalendarProject } = appSlice.actions;
export default appSlice.reducer;
