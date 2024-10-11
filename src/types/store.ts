import Store from '@Store/index';

export type RootStateType = ReturnType<typeof Store.getState>;
export type RootDispatch = typeof Store.dispatch;
