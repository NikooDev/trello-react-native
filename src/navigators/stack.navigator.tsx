import React, { useEffect } from 'react';
import { AuthEnum } from '@Type/auth';
import { NavigatorTheme } from '@Asset/theme/default';
import { modalOptions, screenOptions } from '@Navigator/options/screen.options';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { shallowEqual, useSelector } from 'react-redux';
import { RootStackGuestType, RootStackParamList } from '@Type/stack';
import { RootStateType } from '@Type/store';
import LoaderLayout from '@Component/layouts/loader.layout';
import HomeScreen from '@Screen/guest/home.screen';
import AuthScreen from '@Screen/guest/auth.screen';
import UsersNavigator from '@Navigator/users.navigator';
import useAuth from '@Hook/useAuth';

const Stack = createNativeStackNavigator<RootStackParamList<RootStackGuestType>>();

const StackNavigator = () => {
	const { isAuth } = useSelector((state: RootStateType) => state.auth, shallowEqual);
	const { checkAuth } = useAuth();

	const isLoading = (isAuth === AuthEnum.LOGGED_LOADING);
	const unAuthencated = (isAuth === AuthEnum.LOGGED_OUT) || (isAuth === AuthEnum.LOGGED_ERROR);

	useEffect(() => checkAuth(), [checkAuth]);

  return (
   <LoaderLayout loading={isLoading} isAuth={isAuth}>
		 <NavigationContainer theme={NavigatorTheme}>
			 <Stack.Navigator initialRouteName={unAuthencated ? 'Home' : 'Users'} screenOptions={screenOptions}>
				 {
					 unAuthencated ? (
						 <Stack.Group>
							 <Stack.Screen name="Home" component={HomeScreen}/>
							 <Stack.Screen name="Auth" component={AuthScreen} options={modalOptions}/>
						 </Stack.Group>
					 ) : (
						 <Stack.Group>
							 <Stack.Screen name="Users" component={UsersNavigator}/>
						 </Stack.Group>
					 )
				 }
			 </Stack.Navigator>
		 </NavigationContainer>
   </LoaderLayout>
  );
}

export default StackNavigator;
