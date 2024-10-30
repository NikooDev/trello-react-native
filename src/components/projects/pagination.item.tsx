import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { memo } from 'react';

const PaginationItem = memo(({currentIndex, index}: { currentIndex: number, index: number }) => {
	const animatedStyle = useAnimatedStyle(() => {
		return {
			width: withTiming(currentIndex === index ? 24 : 12, { duration: 300 }),
			opacity: withTiming(currentIndex === index ? 1 : 0.5, { duration: 300 }),
		};
	});

	return (
		<Animated.View
			className="h-3 bg-white rounded-full z-10 mx-0.5"
			style={animatedStyle}
		/>
	)
})

export default PaginationItem;
