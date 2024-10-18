import { DefaultTheme } from '@react-navigation/native';
import { StyleProp, TextStyle } from 'react-native';
import { DraxViewStyleProps } from 'react-native-drax';

export const theme = {
	primary: '#0065ff',
	default: '#f0f2f5'
}

export const NavigatorTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		background: '#f0f2f5',
	}
}

const shadow = {
	shadowColor: '#000',
	shadowOffset: {
		width: 0,
		height: 5
	},
	shadowOpacity: .5,
	shadowRadius: 5,
}

export const shadowButton = {
	...shadow,
	elevation: 10
}

export const shadowHeader = {
	...shadow,
	elevation: 5
}

export const shadowText = {
	textShadowColor: '#000',
	textShadowOffset: {
		width: 1,
		height: 1
	},
	textShadowOpacity: .5,
	textShadowRadius: 5
}

export const dragStyle: DraxViewStyleProps = {
	style: { backgroundColor: '#ffffff66', borderRadius: 10, paddingVertical: 13, paddingHorizontal: 16, marginVertical: 4 },
	dragInactiveStyle: { backgroundColor: '#ffffff33' },
	dragReleasedStyle: { backgroundColor: '#ffffff33' }
}
