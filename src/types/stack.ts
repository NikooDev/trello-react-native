import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackGuestType = {
	Home: undefined;
	Auth: { isLogin: boolean };
	Users: undefined;
};

interface RootStackUserTypeParams {
	screen?: string,
	params?: {
		[key: string]: any
	}
}

export type RootStackUserType = {
	Home: RootStackUserTypeParams;
	Projects: RootStackUserTypeParams;
	Menu: RootStackUserTypeParams;
	Calendar: RootStackUserTypeParams;
	Profile: RootStackUserTypeParams;
	UpsertProject: RootStackUserTypeParams;
	Project: RootStackUserTypeParams;
	Task: RootStackUserTypeParams;
	Chat: RootStackUserTypeParams;
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

export type TabBottomProps = { route: RouteProp<RootStackUserType>, navigation: BottomTabNavigationProp<RootStackUserType> }
