import { DefaultTheme } from '@react-navigation/native';
import { DraxViewStyleProps } from 'react-native-drax';

export const theme = {
	primary: '#0065ff',
	background: '#f0f2f5'
}

/**
 * Style of the navigator
 */
export const NavigatorTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		background: theme.background,
	}
}

export const shadow = (elevation: number) => {
	return {
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 5
		},
		shadowOpacity: .5,
		shadowRadius: 5,
		elevation: elevation
	}
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

/**
 * Style of draggable items
 */
export const dragStyle: DraxViewStyleProps = {
	style: {
		backgroundColor: '#ffffff66',
		borderRadius: 8,
		paddingVertical: 13,
		paddingHorizontal: 16,
		marginVertical: 4
	},
	dragInactiveStyle: { backgroundColor: '#ffffff33' },
	dragReleasedStyle: { backgroundColor: '#ffffff33' }
}
