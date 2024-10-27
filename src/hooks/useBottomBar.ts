import { useEffect } from 'react';
import { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { NavigationRoute, ParamListBase } from '@react-navigation/native';

const UseBottomBar = (menuOpen: boolean) => {
	const mode = useSharedValue(0);
	const overlayOpacity = useSharedValue(0);

	useEffect(() => {
		if (menuOpen) {
			mode.value = withTiming(1, {
				duration: 300,
				easing: Easing.in(Easing.elastic(1.1)),
			});
		} else {
			mode.value = withTiming(0, {
				duration: 300,
				easing: Easing.out(Easing.elastic(1.1)),
			});
		}
	}, [menuOpen, mode]);

	const buttonCreateProject = useAnimatedStyle(() => {
		const thermometerX = interpolate(mode.value, [0, 1], [-27, -90]);
		const thermometerY = interpolate(mode.value, [0, 1], [30, -40]);
		const opacity = interpolate(mode.value, [0, 1], [0, 1]);

		return {
			position: 'absolute',
			left: thermometerX,
			top: thermometerY,
			opacity
		};
	});

	const buttonMessagerie = useAnimatedStyle(() => {
		const pulseX = interpolate(mode.value, [0, 1], [-27, 37]);
		const pulseY = interpolate(mode.value, [0, 1], [30, -40]);
		const opacity = interpolate(mode.value, [0, 1], [0, 1]);

		return {
			position: 'absolute',
			left: pulseX,
			top: pulseY,
			opacity
		};
	});

	const overlayStyle = useAnimatedStyle(() => {
		return {
			opacity: overlayOpacity.value,
		};
	});

	const displayIcon = (route: NavigationRoute<ParamListBase, string>) => {
		let icon: string, title: string;

		switch (route.name) {
			case 'Home':
				icon = 'home';
				title = 'Accueil';
				break;
			case 'Projects':
				icon = 'layers';
				title = 'Projets';
				break;
			case 'Menu':
				icon = 'add';
				title = '';
				break;
			case 'Calendar':
				icon = 'calendar';
				title = 'Calendrier';
				break;
			case 'Profile':
				icon = 'person';
				title = 'Compte';
				break;
			default:
				icon = 'help';
				title = 'Invalid'
				break;
		}

		return {
			icon, title
		}
	}

	return {
		displayIcon,
		overlayOpacity,
		overlayStyle,
		buttonCreateProject,
		buttonMessagerie
	}
}

export default UseBottomBar;
