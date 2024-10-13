import { combineReducers, createSlice, PayloadAction } from '@reduxjs/toolkit';
import appReducer from '@Store/reducers/app.reducer';
import authReducer from '@Store/reducers/auth.reducer';
import userReducer from '@Store/reducers/user.reducer';
import projectReducer from '@Store/reducers/project.reducer';
import listReducer from '@Store/reducers/list.reducer';

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  user: userReducer,
  project: projectReducer,
  list: listReducer
});

const rootSlice = createSlice({
  name: 'root',
  initialState: {},
  reducers: {
    resetStore: () => {
      return {};
    },
  },
});

/**
 * @description Default Reducer -> Resets the state
 */
export const reducer = (state: ReturnType<typeof rootReducer> | undefined, action: PayloadAction) => {
  if (action.type === resetStore.type && state && state.auth) {
    return {
      ...rootReducer(undefined, action),
      auth: state.auth
    };
  }
  return rootReducer(state, action);
};

export const { resetStore } = rootSlice.actions;
