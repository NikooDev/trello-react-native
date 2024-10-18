import React from 'react';
import { closeBottomSheet } from '@Store/reducers/app.reducer';
import Button from '@Component/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { RootStateType } from '@Type/store';
import P from '@Component/ui/text';
import { TaskInterface } from '@Type/task';
import { View } from 'react-native';
import { shadowHeader } from '@Asset/theme/trello';

const TaskSettings = () => {
	const { data } = useSelector((state: RootStateType) => state.app.bottomSheet);
	const dispatch = useDispatch();
	const task = data as TaskInterface;

  return (
   <>
		 <View className="flex-row items-center justify-center py-3 bg-white" style={shadowHeader}>
			 <P size={24} weight="semibold" className="flex-1 text-center">{ task.title }</P>
			 <Button textSize={0} onPress={() => dispatch(closeBottomSheet())} children={null} color="none" className="pr-4" icon="close" iconSize={34}/>
		 </View>
   </>
  );
}

/*

<View className="flex-row items-center justify-center py-3 bg-white" style={shadowHeader}>
			 <P size={24} weight="semibold" className="flex-1 text-center">{ task.title }</P>
			 <Button textSize={0} onPress={() => dispatch(closeBottomSheet())} children={null} color="none" className="pr-4" icon="close" iconSize={34}/>
		 </View>
		 <View>

		 </View>
		 <View className="mt-auto border-t border-t-slate-200 mb-4">
			 <View className="flex-row px-4 mt-4">
				 <Button textSize={17} color="primary" textClass="text-center" textLight className="flex-1 py-3 px-4 mr-4">Modifier</Button>
				 <Button textSize={17} onPress={() => dispatch(closeBottomSheet())} className="py-3 px-4">Fermer</Button>
			 </View>
		 </View>
 */

export default TaskSettings;
