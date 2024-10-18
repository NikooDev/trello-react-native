import React from 'react';
import { TaskProjectInterface } from '@Type/task';
import P from '@Component/ui/text';
import { DraxView } from 'react-native-drax';
import Button from '@Component/ui/button';
import { Pressable, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { openBottomSheet } from '@Store/reducers/app.reducer';

const TaskProject: React.FC<TaskProjectInterface> = ({
	item,
	index
}) => {
	const dispatch = useDispatch();

	const handlePress = () => {
		dispatch(openBottomSheet({
			bottomSheet: {
				name: 'Task',
				height: 100,
				enablePanDownToClose: false,
				handleStyle: false,
				data: item
			}
		}))
	}

  return (
		<DraxView key={index}>
			<Pressable onPress={handlePress} className="flex-row items-center justify-between relative pr-10">
				<P size={17} numberOfLines={4} className="text-white">{ item.title }</P>
				<Button textSize={0} children={null} className="h-8 w-8 absolute -right-1.5 -top-1.5" icon="ellipsis-horizontal" iconSize={24} color="none" iconColor="#fff"/>
			</Pressable>
		</DraxView>
  );
}

export default TaskProject;
