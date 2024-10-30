import React, { memo, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { PriorityEnum } from '@Type/project';
import { TaskItemInterface } from '@Type/task';
import { DraxView } from 'react-native-drax';
import { useDispatch } from 'react-redux';
import P from '@Component/ui/text';
import Button from '@Component/ui/button';
import Class from 'classnames';
import { openBottomSheet } from '@Store/reducers/app.reducer';

const TaskItem: React.FC<TaskItemInterface> = memo(({
	task
}) => {
	const dispatch = useDispatch();

	const handleTaskPress = useCallback(() => {
		dispatch(openBottomSheet({
			name: 'Task',
			height: 60,
			handleStyle: true,
			enablePanDownToClose: true,
			data: {
				listUID: task.listUID,
				task
			}
		}));
	}, [task]);

	const handlePriority = (): string => {
		switch (task.priority) {
			case PriorityEnum.HIGH:
				return 'bg-red-500';
			case PriorityEnum.MEDIUM:
				return 'bg-orange-500';
			case PriorityEnum.LOW:
				return 'bg-green-500';
			default:
				return '';
		}
	}

  return (
		<DraxView key={task.uid} className="relative">
			<Pressable onPress={handleTaskPress} className="flex-row items-center justify-between relative pr-10">
				<P size={17} numberOfLines={4} className={Class('text-white', task.status === 'end' && 'line-through')}>{ task.title }</P>
				<Button onPress={handleTaskPress} textSize={0} children={null} className="h-8 w-8 absolute -right-1.5 -top-1.5" icon="ellipsis-horizontal" iconSize={24} color="none" iconColor="#fff"/>
			</Pressable>
			<View className={Class('h-5 -left-5 full w-2 absolute rounded-2xl', handlePriority())}/>
		</DraxView>
  );
})

export default TaskItem;
