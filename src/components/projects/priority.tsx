import React, { useEffect } from 'react';
import { PriorityEnum, PriorityInterface } from '@Type/project';
import { Dimensions, Pressable, View } from 'react-native';
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { setSortPriority, setTmp } from '@Store/reducers/project.reducer';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import P from '@Component/ui/text';

const Priority: React.FC<PriorityInterface> = ({
	sortPriority,
	enableTitle = false,
	isToggle = false
}) => {
	const { width } = Dimensions.get('screen');
	const dispatch = useDispatch();

	const priorities = [
		{ icon: 'arrow-up-outline', value: PriorityEnum.HIGH, color: 'bg-red-500' },
		{ icon: 'pause-outline', value: PriorityEnum.MEDIUM, color: 'bg-yellow-500' },
		{ icon: 'arrow-down-outline', value: PriorityEnum.LOW, color: 'bg-green-500' }
	];

	const buttonWidth = (width - 40) / priorities.length;
	const priorityIndex = useSharedValue(priorities.findIndex(p => p.value === sortPriority));
	const colorValue = useSharedValue(0);
	const opacityValue = useSharedValue(0);

	useEffect(() => {
		const index = priorities.findIndex(p => p.value === sortPriority);
		priorityIndex.value = withTiming(index, { duration: 300 });
		colorValue.value = withTiming(index, { duration: 300 });
		opacityValue.value = withTiming(sortPriority ? 1 : 0, { duration: 150 });
	}, [sortPriority]);

	const handlePriority = (value: PriorityEnum, index: number) => {
		if (isToggle) {
			dispatch(setSortPriority(sortPriority === value ? undefined : value));
		} else {
			dispatch(setTmp({ sortPriority: value }));
		}

		priorityIndex.value = withTiming(index, { duration: 150 });
	}

	const animatedStyle = useAnimatedStyle(() => {
		const backgroundColor = interpolateColor(
			colorValue.value,
			[0, 1, 2],
			['#ef4444', '#f97316', '#22c55e'],
		);

		const translateX = interpolate(
			priorityIndex.value,
			[0, 1, 2],
			[0, buttonWidth, buttonWidth * 2],
			Extrapolation.CLAMP
		);

		return {
			backgroundColor,
			transform: [{ translateX: translateX }],
			opacity: opacityValue.value
		};
	});

  return (
    <>
			{
				enableTitle && (
					<P size={18} className="mb-3 text-slate-700" weight="semibold">Filtrer par priorité</P>
				)
			}
			<View className="flex-row bg-slate-700 rounded-full relative h-12">
				<Animated.View className="h-10 bg-black rounded-full flex-1 items-center justify-center absolute"
											 style={[{ width: buttonWidth, left: 4, top: 3.9 }, animatedStyle]}/>
				{ priorities.map((p, index) => (
					<Pressable
						key={p.value}
						onPress={() => handlePriority(p.value, index)}
						className={`
              ${p.value === PriorityEnum.LOW ? 'mr-1' : ''}
              rounded-full h-12 flex-1 items-center justify-center`
						}>
						<Icon name={p.icon} size={24} color="#fff" style={{ transform: [{ rotate: p.value === PriorityEnum.MEDIUM ? '90deg' : '0deg' }] }}/>
					</Pressable>
				)) }
			</View>
    </>
  );
}

export default Priority;
