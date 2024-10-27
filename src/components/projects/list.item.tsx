import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Keyboard, TextInput, View } from 'react-native';
import { MemberRoleEnum } from '@Type/project';
import { DateTime } from 'luxon';
import { ListItemInterface } from '@Type/list';
import { RootDispatch, RootStateType } from '@Type/store';
import { TaskInterface } from '@Type/task';
import { DraxListOnItemReorderEventData } from 'react-native-drax/build/types';
import Animated, { FadeInDown, FadeInRight, FadeInUp, FadeOutDown, FadeOutRight, FadeOutUp, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { setHideLoading, setOrderTask } from '@Store/reducers/task.reducer';
import { dragStyle } from '@Asset/theme/default';
import { AnimatedPressable } from '@Util/constants';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useDispatch, useSelector } from 'react-redux';
import { setProject } from '@Action/project.action';
import { ScrollView } from 'react-native-gesture-handler';
import { DraxList, DraxProvider } from 'react-native-drax';
import { addList as createList, removeList, setList } from '@Action/list.action';
import { addTask as createTask, reorderTasks } from '@Action/task.action';
import Class from 'classnames';
import P from '@Component/ui/text';
import OutsidePressHandler from 'react-native-outside-press';
import Button from '@Component/ui/button';
import TaskItem from '@Component/projects/task.item';

type TargetType = 'createlist' | 'createtask';

const ListItem: React.FC<ListItemInterface> = memo(({
	list,
	listActive,
	user,
	loading,
	loadingTask,
	project
}) => {
	const [addList, setAddList] = useState<boolean>(false);
	const [titleList, setTitleList] = useState<string | null>(null);
	const [updateTitleList, setUpdateTitleList] = useState<boolean>(false);
	const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
	const [addTask, setAddTask] = useState<boolean>(false);
	const [titleTask, setTitleTask] = useState<string | null>(null);
	const [timerDelete, setTimerDelete] = useState<ReturnType<typeof setTimeout> | null>(null);
	const inputTitleList = useRef<TextInput>(null);
	const inputTitleTask = useRef<TextInput>(null);
	const scrollViewTask = useRef<ScrollView>(null);
	const heightList = useSharedValue(50);
	const heightTask = useSharedValue(50);
	const marginBottom = useSharedValue(40);
	const dispatch = useDispatch<RootDispatch>();
	const { tasks } = useSelector((state: RootStateType) => state.task);
	const { width } = Dimensions.get('screen');

	/**
	 * Check if the user is the admin of the project or the admin of the list
	 */
	const isAdmin = (
		user.uid === project.adminUID
		|| project.members.some(member => member.uid === user.uid && member.role === MemberRoleEnum.ADMIN)
	);

	const animatedHeightList = useAnimatedStyle(() => {
		return {
			height: heightList.value
		};
	});

	const animatedHeightTask = useAnimatedStyle(() => {
		return {
			height: heightTask.value
		};
	});

	const animatedMargin = useAnimatedStyle(() => {
		return {
			marginBottom: marginBottom.value
		};
	});

	/**
	 * Filter tasks based on user role and contributors.
	 */
	const tasksGuards = useMemo(() => {
		if (!list || tasks.length === 0) return [];

		return tasks.filter((task) => {
			const currentUser = project.members.find((member) => member.uid === user.uid);

			if (task.userUID === user.uid) {
				return true;
			}

			if (!currentUser) return false;

			if (currentUser.role === MemberRoleEnum.ADMIN) {
				return true;
			}

			return task.contributors && task.contributors.some(contributor => contributor.uid === currentUser.uid);
		});
	}, [list, tasks, project, user]);

	const isTasks = (list.title && tasksGuards.length > 0);

	useEffect(() => {
		heightList.value = withTiming(addList ? 68 : 50, { duration: 150 });
		heightTask.value = withTiming(addTask ? 86 : 50, { duration: 100 });
	}, [addList, addTask]);

	useEffect(() => {
		const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
			marginBottom.value = withTiming(128, { duration: 150 });
		});

		const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
			marginBottom.value = withTiming(40, { duration: 150 });
		});

		return () => {
			showSubscription.remove();
			hideSubscription.remove();
		};
	}, [marginBottom]);

	const scrollViewSizeChanged = (height: number) => {
		scrollViewTask.current?.scrollTo({y: height, animated: true});
	}

	/**
	 * Handle add list mode
	 */
	const handleAddList = () => {
		setAddList(true);
		setTimeout(() => {
			inputTitleList.current?.focus();
		}, 200);
	}

	/**
	 * Handle add task mode
	 */
	const handleAddTask = () => {
		setAddTask(true);
		setTimeout(() => {
			inputTitleTask.current?.focus();
		}, 200);
	}

	/**
	 * Handle change title list / change title task
	 * @param value
	 * @param target
	 */
	const handleChangeTitle = (value: string, target: TargetType) => {
		switch (target) {
			case 'createlist':
				setUpdateTitleList(true);
				setTitleList(value);
				break;
			case 'createtask':
				setTitleTask(value);
				break;
		}
	}

	/**
	 * Handle press outside
	 * @param target
	 */
	const handlePressOutside = (target: TargetType) => {
		switch (target) {
			case 'createlist':
				setAddList(false);
				setUpdateTitleList(false);
				setConfirmDelete(false);

				if (timerDelete) {
					clearTimeout(timerDelete);
				}
				break;
			case 'createtask':
				setAddTask(false);
				break;
		}
	}

	/**
	 * Decrement the number of tasks
	 * @param tasksDecrement
	 */
	const decrementNbTasks = (tasksDecrement: TaskInterface[]) => {
		const nbTasksDecrement = tasksDecrement.length;
		const nbTasksEndDecrement = tasksDecrement.filter((task) => task.status === 'end').length;
		const nbProjectTasks = project.nbTasks - nbTasksDecrement;
		const nbProjectTasksEnd = project.nbTasksEnd - nbTasksEndDecrement;

		dispatch(setProject({ uid: project.uid, nbTasks: nbProjectTasks, nbTasksEnd: nbProjectTasksEnd }));
	}

	/**
	 * Handle delete list
	 */
	const handleDeleteList = () => {
		if (confirmDelete) {
			Alert.alert(
				`Supprimer la liste : ${list.title.cap()}`,
				'Êtes-vous sûr de vouloir supprimer cette liste ?\n\nLes tâches associées à cette liste seront également supprimées.',
				[{
					text: 'Annuler',
					onPress: () => {
						setConfirmDelete(false);
					}
				}, {
					text: 'Supprimer',
					onPress: () => {
						decrementNbTasks(tasksGuards);

						dispatch(removeList({
							projectUID: project.uid,
							listUID: list.uid
						}));
					}
				}]
			);

			if (timerDelete) {
				clearTimeout(timerDelete);
			}
		} else {
			setConfirmDelete(true);
			Keyboard.dismiss();

			const timer = setTimeout(() => {
				setConfirmDelete(false);
			}, 3000);

			setTimerDelete(timer);
		}
	}

	const handleSubmitList = () => {
		if (loading) return;

		if (!titleList || (titleList && titleList.trim().length === 0)) {
			return Alert.alert('Erreur', 'Veuillez choisir un titre de liste');
		}

		if (list.title && (titleList !== list.title)) {
			dispatch(setList({
				list: {
					uid: list.uid,
					title: titleList.trim()
				},
				projectUID: project.uid
			}));
		} else {
			dispatch(createList({
				list: {
					title: titleList.trim(),
					created: DateTime.now()
				},
				projectUID: project.uid
			}));
		}

		setAddList(false);
		setUpdateTitleList(false);
		setTitleList(null);
	}

	/**
	 * Handle submit task
	 */
	const handleSubmitTask = () => {
		if (!titleTask || titleTask && titleTask.trim().length === 0) {
			return Alert.alert('Erreur', 'Veuillez choisir un titre pour votre tâche');
		}

		dispatch(createTask({
			task: {
				userUID: user.uid,
				title: titleTask,
				author: `${user.firstname.cap()} ${user.lastname.cap()}`,
				description: null,
				start: DateTime.now(),
				end: null,
				status: 'active',
				contributors: null,
				priority: null,
				order: tasks.length === 0 ? 0 : tasks[tasks.length - 1].order + 1,
				created: DateTime.now()
			},
			projectUID: project.uid,
			listUID: list.uid
		}));

		dispatch(setProject({ uid: project.uid, nbTasks: project.nbTasks + 1 }));

		setTitleTask(null);
		setAddTask(false);
	}

	/**
	 * Handle task reorder
	 */
	const handleTaskReorder = useCallback(async (event: DraxListOnItemReorderEventData<TaskInterface>) => {
		const fromIndex = event.fromIndex;
		const toIndex = event.toIndex;

		const updatedTasks = tasksGuards.slice();
		updatedTasks.splice(toIndex, 0, updatedTasks.splice(fromIndex, 1)[0]);

		const reorderTask = {
			tasks: updatedTasks.map((task, index) => ({
				...task,
				order: index
			})),
			projectUID: project.uid,
			listUID: list.uid
		};

		try {
			await reorderTasks(reorderTask);
			dispatch(setOrderTask(updatedTasks));
			setTimeout(() => dispatch(setHideLoading()), 500);
		} catch (error) {
			console.error('Error reordering tasks:', error);
		}
	}, [tasksGuards, project])

  return (
    <View className="flex-1">
			<OutsidePressHandler onOutsidePress={() => handlePressOutside('createlist')} className={Class('bg-black/70 rounded-2xl self-start mb-4', list.title ? 'rounded-t-2xl' : 'rounded-2xl')} style={{width: width - 40}}>
				<AnimatedPressable onPress={handleAddList} className="relative w-full px-3" style={[animatedHeightList]}>
					{
						addList ? (
							<Animated.View entering={FadeInUp.duration(150)} exiting={FadeOutUp.duration(150)} className="pt-3 flex-row items-center justify-between relative w-full">
								<TextInput ref={inputTitleList}
													 onChangeText={(value) => handleChangeTitle(value, 'createlist')}
													 blurOnSubmit={false}
													 placeholder="Ajouter une liste"
													 className="font-text-semibold px-4 bg-white/20 h-11 text-white/90 flex-1 py-2 rounded-lg mr-2"
													 cursorColor="#ffffffe6"
													 defaultValue={updateTitleList ? titleList ?? '' : list.title}
													 onSubmitEditing={handleSubmitList}
													 style={{ fontSize: 16 }}/>
								<View className="flex-row overflow-hidden rounded-lg">
									<Button onPress={handleSubmitList} textSize={0} children={null} icon="checkmark-outline" className={Class('h-11 w-12 rounded-lg', titleList && titleList.trim() && titleList !== list.title ? 'bg-primary' : 'bg-primary/50')} iconColor="#ffffffe6" iconSize={24}/>
									{
										list.title && (
											<Button textSize={15} onPress={handleDeleteList} children={null} icon="trash" textLight iconSize={24} color="warn" className="h-11 w-12 ml-2 mr-0 rounded-lg relative"/>
										)
									}
									{
										confirmDelete && (
											<AnimatedPressable onPress={handleDeleteList} entering={FadeInRight} exiting={FadeOutRight} className="bg-red-500 w-full absolute h-full items-center justify-center rounded-lg">
												{
													loading ? (
														<ActivityIndicator size={24} color="#fff"/>
													) : (
														<Icon name="trash" color="#ffffffe6" size={24}/>
													)
												}
											</AnimatedPressable>
										)
									}
								</View>
							</Animated.View>
						) : !loading ? (
							<Animated.View entering={FadeInUp.duration(150)} exiting={FadeOutUp.duration(150)} key={list.uid} className={Class('flex-row items-center py-3.5')}>
								<P size={18} light weight="bold" className={Class('text-center flex-1')}>{ list.title ? list.title.cap().toUpperCase() : 'Ajouter une liste' }</P>
							</Animated.View>
						) : (
							<ActivityIndicator size="large" color="#ffffffe6" style={{marginTop: 7}}/>
						)
					}
				</AnimatedPressable>
			</OutsidePressHandler>

			{
				isTasks && list.uid === listActive && (
					<Animated.View entering={FadeInDown.duration(150)} exiting={FadeOutDown.duration(150)} className="bg-black/70 rounded-t-2xl overflow-hidden" style={{flexGrow: 0, flexShrink: 1, width: width - 40}}>
						<ScrollView ref={scrollViewTask}
												onContentSizeChange={(_,height) => scrollViewSizeChanged(height)}
												onLayout={(event) => scrollViewSizeChanged(event.nativeEvent.layout.height + 40)}
												nestedScrollEnabled
												contentContainerStyle={{flexGrow: 0, paddingVertical: 8}}
												style={{flexGrow: 0}}>
							<DraxProvider style={{flexGrow: 0}}>
								<DraxList data={tasksGuards}
													extraData={tasks}
													keyExtractor={(item) => item.uid}
													itemStyles={dragStyle}
													reorderable={isAdmin}
													itemsDraggable={isAdmin}
													onItemReorder={handleTaskReorder}
													contentContainerStyle={{paddingHorizontal: 12}}
													renderItemContent={({ item }) => {
														const { id, ...rest } = item as TaskInterface & { id: string };

														return (
															<TaskItem key={item.uid}
																				task={rest}
																				user={user}
																				project={project}
																				listUID={list.uid}/>
														)
													}}
								/>
							</DraxProvider>
						</ScrollView>
					</Animated.View>
				)
			}

			{
				list.title && (
					<KeyboardAwareScrollView bottomOffset={-200} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{flexGrow: 0}} style={{flexGrow: 0, top: -1}}>
						<OutsidePressHandler onOutsidePress={() => handlePressOutside('createtask')}>
							<Animated.View className={Class('bg-black/70', addTask ? 'py-3' : 'py-0', tasksGuards.length === 0 ? 'rounded-2xl' : 'rounded-b-2xl')} style={[animatedHeightTask, animatedMargin]}>
								{
									addTask ? (
										<Animated.View entering={FadeInDown.duration(150)} exiting={FadeOutDown.duration(150)} key={list.uid} className="flex-row items-center justify-between px-3">
											<TextInput ref={inputTitleTask}
																 onChangeText={(value) => handleChangeTitle(value, 'createtask')}
																 placeholder="Titre de votre tâche"
																 blurOnSubmit={false}
																 multiline
																 textAlignVertical="top"
																 defaultValue={titleTask ? titleTask : ''}
																 className="font-text-regular px-4 bg-white/20 text-white rounded-lg"
																 cursorColor="#ffffffe6"
																 style={{ width: width - 120, minHeight: 62, maxHeight: 62, fontSize: 16 }}
																 onSubmitEditing={handleSubmitTask}
											/>
											<Button onPress={handleSubmitTask} textSize={0} children={null} icon="checkmark-outline" className={Class('h-11 w-12 rounded-lg', titleTask && titleTask.trim() ? 'bg-primary' : 'bg-primary/50')} iconColor="#ffffffe6" iconSize={24}/>
										</Animated.View>
									) : (
										<AnimatedPressable onPress={handleAddTask} entering={FadeInDown.duration(150)} exiting={FadeOutDown.duration(150)} className="flex-row items-center py-3.5">
											<P size={17} light weight="semibold" className="px-4">+ Ajouter une tâche</P>
											{
												loadingTask && (
													<ActivityIndicator size="large" className="absolute right-2" color="#ffffffe6" style={{marginTop: 7}}/>
												)
											}
										</AnimatedPressable>
									)
								}
							</Animated.View>
						</OutsidePressHandler>
					</KeyboardAwareScrollView>
				)
			}
    </View>
  );
})

export default ListItem;
