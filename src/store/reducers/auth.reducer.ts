import {createSlice} from '@reduxjs/toolkit';
import {AuthEnum, AuthStateInterface} from '@Type/auth';

export const initialSignupState = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  avatarID: ''
}

export const authSlice = createSlice({
  name: 'authReducer',
  initialState: {
    isAuth: AuthEnum.LOGGED_LOADING
  } as AuthStateInterface,
  reducers: {
    setLoginSuccess: state => {
      state.isAuth = AuthEnum.LOGGED_IN;
    },
    setLogout: state => {
      state.isAuth = AuthEnum.LOGGED_OUT;
    },
    setLoginError: state => {
      state.isAuth = AuthEnum.LOGGED_ERROR;
    },
  },
});

export const { setLoginSuccess, setLogout, setLoginError } = authSlice.actions;

export default authSlice.reducer;
