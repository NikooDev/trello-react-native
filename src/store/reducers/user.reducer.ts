import { createSlice } from '@reduxjs/toolkit';
import { getUser } from '@Action/user.action';
import { UserInterface, UserStateInterface } from '@Type/user';

export const userSlice = createSlice({
	name: 'userReducer',
	initialState: {
		user: {} as UserInterface,
		loading: false,
		error: null
	} as UserStateInterface,
	reducers: {},
	extraReducers: (builder) => {
		builder
		.addCase(getUser.pending, (state) => {
			state.loading = true;
			state.error = null;
		})
		.addCase(getUser.fulfilled, (state, action) => {
			state.loading = false;
			state.user = action.payload;
		})
		.addCase(getUser.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});
	}
});

export default userSlice.reducer;
