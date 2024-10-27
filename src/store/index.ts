import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '@Store/reducers';

const store = configureStore({
	reducer: reducer,
	middleware: (getDefaultMiddleware) => getDefaultMiddleware({
		immutableCheck: false,
		serializableCheck: false
	})
});

export default store;
