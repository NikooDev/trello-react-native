import Animated from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { DateTime } from 'luxon';

export const currentDateTime = DateTime.now().setLocale('fr-FR').setZone('Europe/Paris');
export const isEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

/**
 * Get 10 years before and after the current year
 */
const currentYear = currentDateTime.year;
const yearRange = 10;
const startYear = currentYear - yearRange;
const endYear = currentYear + yearRange;

export const weeks = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
export const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
export const years = Array.from({length: endYear - startYear + 1}, (_, i) => startYear + i);

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
