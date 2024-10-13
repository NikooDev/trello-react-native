import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dimensions, Pressable, View } from 'react-native';
import P from '@Component/ui/text';
import { PriorityEnum } from '@Type/project';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStateType } from '@Type/store';
import { setSortPriority } from '@Store/reducers/project.reducer';
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const ProjectsOptions = () => {
  const { sortPriority } = useSelector((state: RootStateType) => state.project);
  const { width } = Dimensions.get('screen');
  const dispatch = useDispatch();

  const priorities = [
    { icon: 'arrow-up-outline', value: PriorityEnum.HIGH, color: 'bg-red-500' },
    { icon: 'pause-outline', value: PriorityEnum.MEDIUM, color: 'bg-yellow-500' },
    { icon: 'arrow-down-outline', value: PriorityEnum.LOW, color: 'bg-green-500' }
  ];

  const priorityIndex = useSharedValue(priorities.findIndex(p => p.value === sortPriority));
  const colorValue = useSharedValue(0);
  const buttonWidth = (width - 40) / priorities.length;

  const handlePriority = (value: PriorityEnum, index: number) => {
    dispatch(setSortPriority(sortPriority === value ? undefined : value));
    priorityIndex.value = withTiming(index, { duration: 300 });
  }

  useEffect(() => {
    const index = priorities.findIndex(p => p.value === sortPriority);
    priorityIndex.value = withTiming(index, { duration: 300 });
    colorValue.value = withTiming(index, { duration: 300 });
  }, [sortPriority]);

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
    };
  });

  return (
    <View className="px-4 pb-3">
      <P size={18} className="mb-5 text-slate-700" weight="semibold">Filtrer par priorité</P>
      <View className="flex-row bg-slate-700 rounded-full relative h-16">
        {
          sortPriority && (
            <Animated.View className="h-14 bg-black rounded-full flex-1 items-center justify-center absolute"
                           style={[{ width: buttonWidth, left: 4, top: 3.9 }, animatedStyle]}/>
          )
        }
        { priorities.map((p, index) => (
          <Pressable
            key={p.value}
            onPress={() => handlePriority(p.value, index)}
            className={`
              ${p.value === PriorityEnum.LOW ? 'mr-1' : ''}
              rounded-full h-16 flex-1 items-center justify-center`
            }>
            <AnimatedIcon name={p.icon} size={24} color="#fff" style={{ transform: [{ rotate: p.value === PriorityEnum.MEDIUM ? '90deg' : '0deg' }] }}/>
          </Pressable>
        )) }
      </View>
    </View>
  );
}

export default ProjectsOptions;
