import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

const Gradient = () => {
	const HomeGradient = [
		{ offset: '0%', color: '#001532', opacity: '1' },
		{ offset: '100%', color: '#0e65e4', opacity: '1' }
	]

	return (
		<LinearGradient
			colors={[HomeGradient[0].color, HomeGradient[1].color]}
			style={[StyleSheet.absoluteFillObject]}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 1 }}/>
	);
}

export default Gradient;
