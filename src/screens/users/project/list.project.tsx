import React, { useCallback, useEffect, useRef, useState } from 'react';
import P from '@Component/ui/text';
import Class from 'classnames';
import Animated, { FadeInDown, FadeInRight, FadeInUp, FadeOutDown, FadeOutUp, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ActivityIndicator, Alert, Dimensions, Pressable, TextInput, View } from 'react-native';
import Button from '@Component/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { RootDispatch, RootStateType } from '@Type/store';
import { addList, setList } from '@Action/list.action';
import { ListInterface, ListProjectInterface } from '@Type/list';
import OutsidePressHandler from 'react-native-outside-press';
import TaskProject from '@Screen/users/project/task.project';
import { DraxList, DraxProvider } from 'react-native-drax';
import { TaskInterface } from '@Type/task';
import { dragStyle } from '@Asset/theme/trello';
import { cap, random } from '@Util/functions';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { AnimatedScrollView } from 'react-native-reanimated/lib/typescript/component/ScrollView';
import { setProject } from '@Action/project.action';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ListProject: React.FC<ListProjectInterface> = ({ item, projectUID, nbTasks }) => {
	const [addListTitle, setAddListTitle] = useState<boolean>(false);
	const [addTask, setAddTask] = useState<boolean>(false);
	const [titleList, setTitleList] = useState<string | null>(null);
	const [taskTitle, setTaskTitle] = useState<string | null>(null);
	const [isUpdateTitle, setIsUpdateTitle] = useState<boolean>(false);
	const { error, loading, loadingTask } = useSelector((state: RootStateType) => state.list);
	const { user } = useSelector((state: RootStateType) => state.user);
	const { width } = Dimensions.get('screen');
	const inputAddList = useRef<TextInput>(null);
	const inputAddTask = useRef<TextInput>(null);
	const scrollViewTasksRef = useRef<AnimatedScrollView>(null);
	const dispatch = useDispatch<RootDispatch>();

	const heightTitleList = useSharedValue(50);

	useEffect(() => {
		heightTitleList.value = withTiming(addListTitle ? 70 : 50, { duration: 150 });
	}, [addListTitle]);

	useEffect(() => {
		if (error) {
			Alert.alert('Erreur', error);
		}
	}, [error]);

	const handleAddList = useCallback(() => {
		setAddListTitle(true);

		setTimeout(() => inputAddList.current!.focus(), 200);
	}, [inputAddList]);

	useEffect(() => {
		if (addListTitle) {
			setTitleList(item.title ? item.title : null);
		}
	}, [addListTitle, item]);

	const handleChangeTitle = (value: string) => {
		setIsUpdateTitle(true);
		setTitleList(value);
	}

	const handlePressOutside = () => {
		setIsUpdateTitle(false);
		setAddListTitle(false);
		setTitleList(item.title ? item.title : null);
	}

	const handleSubmitList = () => {
		if (!titleList || titleList && titleList.trim().length === 0) {
			return Alert.alert('Erreur', 'Veuillez choisir un titre de liste');
		}

		if (titleList !== item.title) {
			if (item.title && titleList) {
				dispatch(setList({ list: { uid: item.uid, title: titleList.trim() }, projectUID }));
			} else {
				const list = {
					uid: null,
					title: titleList.trim(),
					tasks: [],
					created: new Date()
				} as ListInterface;

				dispatch(addList({ list, projectUID }));
			}
		}

		setIsUpdateTitle(false);
		setAddListTitle(false);
		setTitleList(null);
	}

	const handleAddTask = useCallback(() => {
		setAddTask(true);

		setTimeout(() => scrollViewTasksRef.current && scrollViewTasksRef.current.scrollToEnd(), 200);
		setTimeout(() => inputAddTask.current && inputAddTask.current.focus(), 200);
	}, [inputAddTask, scrollViewTasksRef])

	const handleChangeTaskTitle = (value: string) => {
		setTaskTitle(value);
	}

	const handlePressTaskOutside = () => {
		setAddTask(false);
	}

	const handleSubmitTask = useCallback(() => {
		if (!taskTitle || taskTitle && taskTitle.trim().length === 0) {
			return Alert.alert('Erreur', 'Veuillez choisir un titre pour votre tâche');
		}

		dispatch(setList({
			list: {
				uid: item.uid,
				tasks: [
					...item.tasks,
					{
						uid: random(20),
						userUID: user.uid,
						title: taskTitle.trim(),
						start: null,
						end: null,
						description: null,
						author: `${cap(user.firstname)} ${cap(user.lastname)}`,
						contributors: [],
						priority: null,
						created: new Date()
					}
				]
			},
			projectUID
		}));

		dispatch(setProject({ uid: projectUID, nbTasks: nbTasks + 1 }));

		setTimeout(() => scrollViewTasksRef.current && scrollViewTasksRef.current.scrollToEnd(), 400);
		setTaskTitle(null);
		setAddTask(false);
	}, [taskTitle, scrollViewTasksRef, item, user])

	const animatedStyle = useAnimatedStyle(() => {
		return {
			height: heightTitleList.value
		};
	});

	const isTasks = item.tasks && item.tasks.length > 0;

  return (
		<View className="flex-1">
			<View className={Class('bg-black/70 rounded-2xl self-start mb-4', isTasks || item.title ? 'rounded-t-2xl' : 'rounded-2xl')} style={{width: width - 40}}>
				<OutsidePressHandler onOutsidePress={handlePressOutside}>
					<AnimatedPressable onPress={handleAddList} className="relative px-3" style={[{width: width - 40}, animatedStyle]}>
						{
							addListTitle ? (
								<Animated.View entering={FadeInUp.duration(150)} exiting={FadeOutUp.duration(150)} key={addListTitle ? '0' : '1'} className="flex-row gap-3 items-center justify-between pt-3">
									<TextInput ref={inputAddList}
														 onChangeText={handleChangeTitle}
														 blurOnSubmit={false}
														 placeholder="Ajouter une liste"
														 className="font-text-semibold px-4 bg-white/20 h-11 text-white/90 flex-1 py-2"
														 cursorColor="#ffffffe6"
														 defaultValue={isUpdateTitle ? titleList : item.title}
														 onSubmitEditing={handleSubmitList}
														 style={{ borderTopRightRadius: 16, borderBottomRightRadius: 8, borderTopLeftRadius: 16, borderBottomLeftRadius: 8, fontSize: 16 }}/>
									<Button onPress={handleSubmitList} textSize={0} children={null} icon="checkmark-outline" className={Class('h-11 w-12 rounded-l-lg rounded-r-2xl', titleList && (titleList !== item.title && titleList.trim().length > 0) ? 'bg-primary' : 'bg-primary/50')} iconColor="#ffffffe6" iconSize={24}/>
								</Animated.View>
							) : !loading ? (
								<Animated.View entering={FadeInUp.duration(150)} exiting={FadeOutUp.duration(150)} className={Class('flex-row items-center py-3.5')}>
									<P size={17} light weight="bold" className={Class('text-center flex-1')}>{ item.title ? item.title : 'Ajouter une liste' }</P>
								</Animated.View>
							) : (
								<ActivityIndicator size="large" color="#ffffffe6" style={{marginTop: 7}}/>
							)
						}
					</AnimatedPressable>
				</OutsidePressHandler>
			</View>

			{
				item.title && item.tasks && item.tasks.length > 0 && (
					<View className="bg-black/70 rounded-t-2xl" style={{flexGrow: 0, flexShrink: 1, width: width - 40}}>
						<Animated.ScrollView entering={FadeInRight} ref={scrollViewTasksRef} contentContainerStyle={{flexGrow: 0}} style={{flexGrow: 0}}>
							<DraxProvider style={{flexGrow: 0}}>
								<View className="pt-3 pb-1.5">
									<DraxList data={(item.tasks as TaskInterface[])}
														keyExtractor={(item) => item.uid}
														itemStyles={dragStyle}
														contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 8}}
														onItemReorder={({ fromIndex, toIndex }) => {
															const updatedTasks = item.tasks.slice();

															updatedTasks.splice(toIndex, 0, updatedTasks.splice(fromIndex, 1)[0]);

															dispatch(setList({ list: { uid: item.uid, tasks: updatedTasks }, projectUID }));
														}}
														renderItemContent={({ item: task, index }) => (
															<TaskProject key={task.uid} item={task} index={index}/>
														)}
									/>
								</View>
							</DraxProvider>
						</Animated.ScrollView>
					</View>
				)
			}

			{
				item.title && (
					<KeyboardAwareScrollView scrollEnabled={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{flexGrow: 0}} style={{flexGrow: 0}}>
						<OutsidePressHandler onOutsidePress={handlePressTaskOutside}>
							<View className={Class('bg-black/70 rounded-b-2xl mb-12 pt-1 pb-1')}>
							{
								addTask ? (
									<View className="flex-row items-center justify-between pb-4 px-4">
										<TextInput ref={inputAddTask}
															 onChangeText={handleChangeTaskTitle}
															 placeholder="Titre de votre tâche"
															 placeholderTextColor="#ffffffb3"
															 blurOnSubmit={false}
															 multiline
															 textAlignVertical="top"
															 defaultValue={taskTitle ? taskTitle : ''}
															 className="font-text-regular px-4 bg-white/20 text-white rounded-lg"
															 cursorColor="#ffffffe6"
															 style={{ width: width - 127, minHeight: 62, maxHeight: 62, fontSize: 16 }}
															 onSubmitEditing={handleSubmitTask}
										/>
										<Button onPress={handleSubmitTask} textSize={0} children={null} icon="checkmark-outline" className={Class('h-11 w-12 rounded-lg', taskTitle && taskTitle.trim() ? 'bg-primary' : 'bg-primary/50')} iconColor="#ffffffe6" iconSize={24}/>
									</View>
								) : !loadingTask ? (
									item.title && (
										<Animated.View entering={FadeInDown.duration(150)} exiting={FadeOutDown.duration(150)} className="flex-row items-center">
											<Pressable onPress={handleAddTask} className="py-4 px-4 flex-1">
												<P size={17} light weight="semibold">+ Ajouter une tâche</P>
											</Pressable>
										</Animated.View>
									)
								) : loadingTask && (
									<ActivityIndicator size={32} color="#ffffffe6" style={{paddingVertical: 10}}/>
								)
							}
							</View>
						</OutsidePressHandler>
					</KeyboardAwareScrollView>
				)
			}
		</View>
  );
}

export default ListProject;
