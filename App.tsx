import React from 'react';
import Firebase from '@Service/firebase/init';
import { ReanimatedLogLevel, configureReanimatedLogger } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Provider } from 'react-redux';
import StackNavigator from '@Navigator/stack.navigator';
import store from '@Store/index';

configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false,
});

new Firebase().init();

const App = () => {
	return (
		<SafeAreaProvider>
			<GestureHandlerRootView className="flex-1">
				<KeyboardProvider statusBarTranslucent={true}>
					<Provider store={store}>
						<StackNavigator/>
					</Provider>
				</KeyboardProvider>
			</GestureHandlerRootView>
		</SafeAreaProvider>
	)
}

export default App;
