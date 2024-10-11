import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Pressable, View } from 'react-native';
import P from '@Component/ui/text';
import { PriorityEnum } from '@Type/project';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStateType } from '@Type/store';
import { setSortPriority } from '@Store/reducers/project.reducer';

const ProjectsOptions = () => {
  const { sortPriority } = useSelector((state: RootStateType) => state.project);
  const dispatch = useDispatch();

  const priorities = [
    { icon: 'arrow-up-outline', value: PriorityEnum.HIGH, color: 'bg-red-500' },
    { icon: 'pause-outline', value: PriorityEnum.MEDIUM, color: 'bg-yellow-500' },
    { icon: 'arrow-down-outline', value: PriorityEnum.LOW, color: 'bg-green-500' }
  ];

  const handlePriority = (value: PriorityEnum) => {
    dispatch(setSortPriority(sortPriority === value ? undefined : value));
  }

  return (
    <View className="px-4 pb-3">
      <P size={18} className="mb-3" weight="semibold">Filtrer par priorité</P>
      <View className="flex-row gap-1 mb-5">
        {priorities.map((p) => (
          <Pressable
            key={p.value}
            onPress={() => handlePriority(p.value)}
            className={`${sortPriority === p.value ? p.color : 'bg-slate-300'}
                  ${p.value === PriorityEnum.LOW && 'rounded-r-2xl rounded-l-lg'}
                  ${p.value === PriorityEnum.MEDIUM && 'rounded-lg'}
                  ${p.value === PriorityEnum.HIGH && 'rounded-l-2xl rounded-r-lg'}
                  px-4 py-2 flex-1 items-center justify-center`
            }>
            <Icon name={p.icon} size={24} color={sortPriority === p.value ? '#fff' : '#0000009f'} style={{transform: [{ rotate: p.value === PriorityEnum.MEDIUM ? '90deg' : '0deg' }]}}/>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default ProjectsOptions;
