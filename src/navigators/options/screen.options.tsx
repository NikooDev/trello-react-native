import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { BottomTabBarProps, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import Tabs from '@Component/navigator/tabs';
import Header from '@Component/navigator/header';

export const title = {
	home: 'Trello',
	projects: 'Projets',
	calendar: 'Calendrier',
	profile: 'Compte',
	upsertProject: 'Créer un projet',
	createTask: 'Créer une tâche',
	chat: 'Messagerie'
}

export const screenOptions: NativeStackNavigationOptions = {
	headerShown: false,
	animationTypeForReplace: 'pop'
};

export const modalOptions: NativeStackNavigationOptions = {
	animation: 'slide_from_bottom',
	presentation: 'modal'
}

export const tabOptions: BottomTabNavigationOptions = {
	animation: 'shift',
	headerShadowVisible: false,
	header: (props) => <Header {...props} />
}

export const subTabOptions: BottomTabNavigationOptions = {
	animation: 'shift',
	headerShown: true,
	header: (props) => <Header {...props}/>
}

export const addOptions: BottomTabNavigationOptions = {
	header: () => null,
	tabBarButton: () => null
}

export const tabBar = (props: BottomTabBarProps) => <Tabs {...props}/>;
