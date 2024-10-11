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
import ChatScreen from '@Screen/users/chat/chat.screen';
import ProjectScreen from '@Screen/users/project/project.screen';
import TaskScreen from '@Screen/users/task/task.screen';

const Tab = createBottomTabNavigator<RootStackParamList<RootStackUserType>>();

const UsersNavigator = () => {
  return (
		<BottomSheetModalProvider>
			<BottomSheetProvider>
				<EventProvider>
					<Tab.Navigator initialRouteName="Home" tabBar={tabBar} backBehavior="initialRoute" screenOptions={tabOptions}>
						<Tab.Screen name="Home" options={{ title: title.home }} initialParams={{ screen: 'Home' }} component={HomeScreen}/>
						<Tab.Screen name="Projects" options={{ title: title.projects }} initialParams={{ screen: 'Projects' }} component={ProjectsScreen}/>
						<Tab.Screen name="Menu" initialParams={{ screen: 'Menu' }} options={addOptions} component={MenuNavigator}/>
						<Tab.Screen name="Calendar" options={{ title: title.calendar }} initialParams={{ screen: 'Calendar' }} component={CalendarScreen}/>
						<Tab.Screen name="Profile" options={{ title: title.profile }} initialParams={{ screen: 'Profile' }} component={ProfileScreen}/>
					</Tab.Navigator>
				</EventProvider>
			</BottomSheetProvider>
		</BottomSheetModalProvider>
  );
}

const MenuNavigator = () => {
	return (
		<Tab.Navigator backBehavior="none" tabBar={() => null} screenOptions={subTabOptions}>
			<Tab.Screen name="CreateProject" options={{ title: title.createProject }} initialParams={{ screen: 'CreateProject' }} component={CreateProject}/>
			<Tab.Screen name="Project" options={{ headerShown: false }} initialParams={{ screen: 'Project' }} component={ProjectScreen}/>
			<Tab.Screen name="Task" options={{ headerShown: false }} initialParams={{ screen: 'Task' }} component={TaskScreen}/>
			<Tab.Screen name="Chat" options={{ title: title.chat }} initialParams={{ screen: 'Chat' }} component={ChatScreen}/>
		</Tab.Navigator>
	)
}

export default UsersNavigator;
