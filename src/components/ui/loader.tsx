import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { LoaderEnum } from '@Type/layout';
import Animated, { FadeInUp, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Gradient from '@Component/ui/gradient';
import P from '@Component/ui/text';

export const loaderTimeout = 800;

const Loader: React.FC<{ loading: boolean }> = ({
	loading
}) => {
	const [state, setState] = useState<LoaderEnum>(0);
	const opacity = useSharedValue(1);

	useEffect(() => {
		if (state === LoaderEnum.WAITFORREADY) {
			if (loading) {
				setState(1);
			}
		}
	}, [state, loading]);

	useEffect(() => {
		if (state === LoaderEnum.FADEOUT) {
			opacity.value = withDelay(loaderTimeout, withTiming(0, { duration: 200 }, () => {
				runOnJS(setState)(LoaderEnum.HIDDEN);
			}));
		}
	}, [state, opacity]);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			opacity: opacity.value,
		};
	});

	if (state === LoaderEnum.HIDDEN) return null;

	return (
		<Animated.View collapsable={false} className="justify-center items-center" style={[StyleSheet.absoluteFillObject, animatedStyle]}>
			<StatusBar barStyle="light-content" animated/>
			<Gradient/>
			<Animated.View entering={FadeInUp} className="-mt-14">
				<P size={60} light className="font-title text-center mb-2">Trello</P>
				<ActivityIndicator size="large" color="#fff"/>
			</Animated.View>
		</Animated.View>
	);
}

export default Loader;
