import React, { useEffect } from 'react';
import { AuthEnum } from '@Type/auth';
import { modalOptions, screenOptions } from '@Navigator/options/screen.options';
import { NavigatorTheme } from '@Asset/theme/trello';
import { RootStateType } from '@Type/store';
import { RootStackGuestType, RootStackParamList } from '@Type/stack';
import { shallowEqual, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoaderLayout from '@Component/layouts/loader.layout';
import useAuth from '@Hook/useAuth';
import HomeScreen from '@Screen/guest/home.screen';
import AuthScreen from '@Screen/guest/auth.screen';
import UsersNavigator from '@Navigator/users.navigator';

const Stack = createNativeStackNavigator<RootStackParamList<RootStackGuestType>>();

/**
 * @description Stack Navigator
 * @constructor
 */
const StackNavigator = () => {
  const { isAuth } = useSelector((state: RootStateType) => state.auth, shallowEqual);
  const { checkAuth } = useAuth();
  const isLoading = (isAuth === AuthEnum.LOGGED_LOADING);
  const unAuthencated = (isAuth === AuthEnum.LOGGED_OUT) || (isAuth === AuthEnum.LOGGED_ERROR);

  /**
   * @description Checks the user's authentication state
   */
  useEffect(() => checkAuth(), [checkAuth]);

  return (
   <LoaderLayout loading={isLoading}>
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
