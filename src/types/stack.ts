import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackGuestType = {
  Home: undefined;
  Auth: { isLogin: boolean };
  Users: undefined;
};

export type RootStackUserType = {
	Home: undefined;
	Projects: undefined;
	Add: undefined;
	Calendar: undefined;
	Profile: undefined;
	CreateProject: undefined;
	Project: undefined;
	CreateTask: undefined;
	Task: undefined;
	Chat: undefined;
}

export type RootStackParamList<T> = T;
export type RootStackPropsGuest<T extends keyof RootStackParamList<RootStackGuestType>> = NativeStackScreenProps<RootStackParamList<RootStackGuestType>, T>;
export type RootStackPropsUser<T extends keyof RootStackParamList<RootStackUserType>> = NativeStackScreenProps<RootStackParamList<RootStackUserType>, T>;

export interface RootStackGuestNavigation {
	navigation: RootStackPropsGuest<keyof RootStackParamList<RootStackGuestType>>['navigation'];
}

export interface RootStackUserNavigation {
	navigation: RootStackPropsUser<keyof RootStackParamList<RootStackUserType>>['navigation'];
}
