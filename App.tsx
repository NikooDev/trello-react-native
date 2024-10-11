import React from 'react';
import Firebase from '@Service/firebase/init';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Provider } from 'react-redux';
import StackNavigator from '@Navigator/stack.navigator';
import store from '@Store/index';

new Firebase().init();

const App = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <KeyboardProvider>
          <Provider store={store}>
            <StackNavigator/>
          </Provider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}

export default App;
