import Animated from 'react-native-reanimated';
import { Pressable } from 'react-native';

export const isEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

export const BottomSheetStyles = {
	index: -1,
	style: {
		backgroundColor: '#fff',
		zIndex: 50,
		paddingBottom: 120,
		borderRadius: 10,
		shadowRadius: 10,
		shadowColor: '#000',
		shadowOpacity: 0.2,
		shadowOffset: {width: 0, height: 0},
	},
	handleIndicatorStyle: {width: 40, backgroundColor: '#d4d7dd'},
};

export const queryThemesPexels = [
	'forest',
	'mountain',
	'ocean',
	'river',
	'sky',
	'space',
	'moon',
	'stars',
	'galaxy',
	'beach',
	'coastline',
	'cliff',
	'lake',
	'sunset',
	'landscape',
	'waterfalls',
	'volcano',
	'glacier',
	'desert',
	'prairie',
	'underwater',
	'coral',
	'rainforest',
	'savannah',
	'northern lights',
	'storm',
	'island',
	'dunes',
	'fjord',
	'iceberg',
	'lagoon',
	'clouds',
	'rock',
	'tundra',
	'coniferous forest',
	'Pacific Ocean',
	'Atlantic Ocean',
];

export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
