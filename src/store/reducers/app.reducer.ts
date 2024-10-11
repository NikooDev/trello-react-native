import { createSlice } from '@reduxjs/toolkit';
import { AppStateInterface, AppStateActionsInterface } from '@Type/app';

const initialAppState = {
	chatBadge: 0,
	bottomSheet: {
		open: false,
		enablePanDownToClose: true,
		handleStyle: false,
		height: 50,
		name: null
	}
};

export const appSlice = createSlice({
	name: 'appReducer',
	initialState: initialAppState as AppStateInterface,
	reducers: {
		setChatBadge(state, action) {
			state.chatBadge = action.payload;
		},
		openBottomSheet(state, action: AppStateActionsInterface) {
			state.bottomSheet = {
				...initialAppState.bottomSheet,
				...action.payload.bottomSheet,
				open: true
			};
		},
		closeBottomSheet(state) {
			state.bottomSheet = {
				...initialAppState.bottomSheet,
				open: false
			}
		}
	}
});

export const {
	setChatBadge, openBottomSheet, closeBottomSheet
} = appSlice.actions;

export default appSlice.reducer;
