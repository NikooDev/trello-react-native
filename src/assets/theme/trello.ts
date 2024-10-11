import { DefaultTheme } from '@react-navigation/native';
import { StyleProp, TextStyle } from 'react-native';

export const theme = {
	primary: '#0065ff'
}

export const NavigatorTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		background: '#f0f2f5',
	}
}

export const textShadow: StyleProp<TextStyle> = {
	textShadowColor: 'rgba(0, 0, 0, 0.5)',
	textShadowOffset: {width: 0, height: 0},
	textShadowRadius: 10
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
