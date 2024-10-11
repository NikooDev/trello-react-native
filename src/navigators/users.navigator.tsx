import React from 'react';
import { addOptions, subTabOptions, tabOptions, title, tabBar } from '@Navigator/options/screen.options';
import { RootStackParamList, RootStackUserType } from '@Type/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { EventProvider } from 'react-native-outside-press';
import BottomSheetProvider from '@Context/bottomSheet.context';
import HomeScreen from '@Screen/users/home.screen';
import ProjectsScreen from '@Screen/users/projects.screen';
import CalendarScreen from '@Screen/users/calendar.screen';
import ProfileScreen from '@Screen/users/profile.screen';
import CreateProject from '@Screen/users/project/create.project';
import CreateTask from '@Screen/users/task/create.task';
import ChatScreen from '@Screen/users/chat/chat.screen';

const Tab = createBottomTabNavigator<RootStackParamList<RootStackUserType>>();

const UsersNavigator = () => {
  return (
		<BottomSheetModalProvider>
			<BottomSheetProvider>
				<EventProvider>
					<Tab.Navigator initialRouteName="Home" tabBar={tabBar} backBehavior="initialRoute" screenOptions={tabOptions}>
						<Tab.Screen name="Home" options={{ title: title.home }} component={HomeScreen}/>
						<Tab.Screen name="Projects" options={{ title: title.projects }} component={ProjectsScreen}/>
						<Tab.Screen name="Add" component={MenuNavigator} options={addOptions}/>
						<Tab.Screen name="Calendar" options={{ title: title.calendar }} component={CalendarScreen}/>
						<Tab.Screen name="Profile" options={{ title: title.profile }} component={ProfileScreen}/>
					</Tab.Navigator>
				</EventProvider>
			</BottomSheetProvider>
		</BottomSheetModalProvider>
  );
}

const MenuNavigator = () => {
	return (
		<Tab.Navigator backBehavior="none" tabBar={() => null} screenOptions={subTabOptions}>
			<Tab.Screen name="CreateProject" options={{ title: title.createProject }} component={CreateProject}/>
			<Tab.Screen name="CreateTask" options={{ title: title.createTask }} component={CreateTask}/>
			<Tab.Screen name="Chat" options={{ title: title.chat }} component={ChatScreen}/>
		</Tab.Navigator>
	)
}

export default UsersNavigator;
