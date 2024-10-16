import { createSlice } from '@reduxjs/toolkit';
import { AppStateInterface, AppStateActionsInterface } from '@Type/app';

const initialAppState = {
	bottomSheet: {
		open: false,
		enablePanDownToClose: true,
		handleStyle: false,
		height: 50,
		name: null,
		data: null
	}
};

export const appSlice = createSlice({
	name: 'appReducer',
	initialState: initialAppState as AppStateInterface,
	reducers: {
		openBottomSheet(state, action: AppStateActionsInterface) {
			state.bottomSheet = {
				...initialAppState.bottomSheet,
				...action.payload.bottomSheet,
				open: true
			};
		},
		setBottomSheetData(state, action: AppStateActionsInterface) {
			state.bottomSheet = {
				...initialAppState.bottomSheet,
				data: action.payload.bottomSheet.data
			}
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
	openBottomSheet, closeBottomSheet, setBottomSheetData
} = appSlice.actions;

export default appSlice.reducer;
