import { createSlice } from '@reduxjs/toolkit';
import { getUser, setUser } from '@Action/user.action';
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
			})

		.addCase(setUser.pending, (state) => {
			state.loading = true;
			state.error = null;
		})
		.addCase(setUser.fulfilled, (state, action) => {
			state.loading = false;

			if (action.payload) {
				const {
					uid = state.user.uid,
					firstname = state.user.firstname,
					lastname = state.user.lastname,
					email = state.user.email,
					avatarConfig = state.user.avatarConfig,
					badgeChat = state.user.badgeChat
				} = action.payload;

				state.user = {
					uid,
					firstname,
					lastname,
					email,
					avatarConfig,
					badgeChat
				};
			}
		})
		.addCase(setUser.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		})
	}
});

export default userSlice.reducer;
