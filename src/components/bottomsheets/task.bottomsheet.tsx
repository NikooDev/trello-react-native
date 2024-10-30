import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { theme } from '@Asset/theme/default';
import { MemberRoleEnum, PriorityEnum } from '@Type/project';
import { RootStateType } from '@Type/store';
import { TaskInterface } from '@Type/task';
import { useSelector } from 'react-redux';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Animated, { FadeInLeft, FadeOutLeft } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import TaskEdit from '@Component/projects/task.edit';
import P from '@Component/ui/text';
import Button from '@Component/ui/button';
import Avatar from '@Component/ui/avatar';
import Class from 'classnames';

const TaskBottomsheet = () => {
	const { data, open } = useSelector((state: RootStateType) => state.app.bottomSheet);
	const { user } = useSelector((state: RootStateType) => state.user);
	const { project } = useSelector((state: RootStateType) => state.project);
	const { loading } = useSelector((state: RootStateType) => state.task);
	const { listUID, task } = data as { listUID: string, task: TaskInterface };
	const [editTask, setEditTask] = useState<boolean>(false);
	const [updateTask, setUpdateTask] = useState<TaskInterface>(task);

	const isAdmin = (user.uid === (task && task.userUID) || project!.members.some(member => member.uid === user.uid && member.role === MemberRoleEnum.ADMIN));
	const sliceTeams = updateTask.end ? 3 : 8;

	useEffect(() => {
		if (!open) {
			setEditTask(false);
		}
	}, [open, task]);

	useEffect(() => {
		setUpdateTask(task);
	}, [task]);

	const handleEditTask = () => {
		setEditTask(true);
	}

	const handleLabelDateStart = () => {
		let beginLabel: string;
		let date: string | null;

		switch (updateTask.status) {
			case 'active':
				beginLabel = 'Commencée le';
				date = updateTask.created && `${updateTask.created.day} ${updateTask.created.setLocale('fr').toLocaleString({ month: 'short' })} ${updateTask.created.year} à ${updateTask.created.toFormat('HH')}:${updateTask.created.toFormat('mm')}`
				break;
			case 'soon':
				beginLabel = 'Commence le';
				date = updateTask.start && `${updateTask.start.day} ${updateTask.start.setLocale('fr').toLocaleString({ month: 'short' })} ${updateTask.start.year} à ${updateTask.start.toFormat('HH')}:${updateTask.start.toFormat('mm')}`
				break;
			case 'end':
				beginLabel = 'Terminée le';
				date = updateTask.end && `${updateTask.end.day} ${updateTask.end.setLocale('fr').toLocaleString({ month: 'short' })} ${updateTask.end.year} à ${updateTask.end.toFormat('HH')}:${updateTask.end.toFormat('mm')}`
				break;
		}

		return (
			<P size={13} className="italic">{ beginLabel } { date }</P>
		)
	}

  return (
    <View className="flex-1">
			{
				!task ? (
					<ActivityIndicator size="large" color={theme.primary} className="mt-10"/>
				) : (
					editTask ? (
						<TaskEdit originalTask={task}
											setEditTask={setEditTask}
											updateTask={updateTask}
											setUpdateTask={setUpdateTask}
											listUID={listUID}
											project={project}
											loading={loading}
											isAdmin={isAdmin}/>
					) : (
						<Animated.View key={task.uid} entering={FadeInLeft} exiting={FadeOutLeft} className="bg-white px-4 flex-grow">
							<View className="flex-row items-center justify-between mb-2">
								<P size={25} numberOfLines={2} className="flex-1">{ updateTask.title }</P>
								<View className="flex-row gap-2 self-start ml-2">
									{
										updateTask.priority === PriorityEnum.HIGH && (
											<Button textSize={0} icon="arrow-up-outline" className="bg-red-500 h-10 w-10 rounded-full" textLight iconSize={20} children={null}/>
										)
									}
									{
										updateTask.priority === PriorityEnum.MEDIUM && (
											<Button textSize={20} icon="pause-outline" className="bg-orange-500 h-10 w-10 items-center justify-center rounded-full" textLight>
												<View style={{ transform: [{ rotate: '90deg' }] }}>
													<Icon name="pause-outline" size={20} color="#fff"/>
												</View>
											</Button>
										)
									}
									{
										updateTask.priority === PriorityEnum.LOW && (
											<Button textSize={0} icon="arrow-down-outline" className="bg-green-500 h-10 w-10 rounded-full" textLight iconSize={20} children={null}/>
										)
									}
									{
										isAdmin && (
											<View className="relative">
												<Button textSize={0} onPress={handleEditTask} children={null} icon="pencil" iconColor="#fff" className="h-10 w-10 rounded-full bg-transparent bg-slate-600" iconSize={24}/>
											</View>
										)
									}
								</View>
							</View>
							<View className="mt-3 bg-slate-700 py-4 px-4 rounded-2xl flex-row">
								<View className="flex-1">
									<P size={15} light weight="semibold" className="mb-2">Équipe ({updateTask.contributors ? updateTask.contributors.length : 0})</P>
									<View className="flex-row items-center w-full mt-1">
										{
											updateTask.contributors && updateTask.contributors.length > 0 && updateTask.contributors.slice(0, sliceTeams).map((member, index) => (
												<Avatar size={40} key={index} avatarID={member.avatarID} className="-mr-3"/>
											))
										}
										<Button textSize={0} children={null} icon="add-circle" iconSize={48} iconColor="#fff" color="none"/>
										{
											updateTask.contributors && updateTask.contributors.length > sliceTeams && (
												<P size={15} weight="semibold" className="ml-1" light style={{lineHeight: 15}}>+{updateTask.contributors.length - sliceTeams}</P>
											)
										}
									</View>
								</View>
								<View className="bg-slate-400 h-full w-0.5"/>
								<View className="flex-1">
									<P size={15} light weight="semibold" className="pl-4 mb-2">Date de fin</P>
									<View className="mt-1 pl-4">
										<View className="flex-row items-center mb-2">
											<Icon name="calendar" size={20} color="#fff"/>
											{
												updateTask.end ? (
													<P size={15} light className="ml-2">{ updateTask.end.day } { updateTask.end.setLocale('fr').toLocaleString({ month: 'short' }) } { updateTask.end.year }</P>
												) : (
													<P size={15} light className="ml-2">Non définie</P>
												)
											}
										</View>
										<View className="flex-row items-center">
											<Icon name="time" size={20} color="#fff"/>
											{
												updateTask.end ? (
													<P size={15} light className="ml-2">{ updateTask.end.toFormat('HH') } : { updateTask.end.toFormat('mm') }</P>
												) : (
													<P size={15} light className="ml-2">Non définie</P>
												)
											}
										</View>
									</View>
								</View>
							</View>
							<View className="mt-4">
								<View className="flex-row items-center justify-between mb-3">
									<P size={18} weight="semibold">Statut</P>
									<P size={13} className="italic">{ handleLabelDateStart() }</P>
								</View>
								<View className="flex-row gap-2">
									<P size={15} weight="semibold" light={updateTask.status === 'soon'} className={Class(updateTask.status === 'soon' ? 'bg-primary' : 'bg-slate-200', 'text-center flex-1 py-2 px-4 self-baseline rounded-full')}>À venir</P>
									<P size={15} weight="semibold" light={updateTask.status === 'active'} className={Class(updateTask.status === 'active' ? 'bg-primary' : 'bg-slate-200', 'text-center flex-1 py-2 px-4 self-baseline rounded-full')}>En cours</P>
									<P size={15} weight="semibold" light={updateTask.status === 'end'} className={Class(updateTask.status === 'end' ? 'bg-primary' : 'bg-slate-200', 'text-center flex-1 py-2 px-4 self-baseline rounded-full')}>Terminée</P>
								</View>
							</View>
							<BottomSheetScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 20, paddingTop: 20}}>
								<View className="flex-row items-center justify-between">
									<P size={17} numberOfLines={15} className={Class(!task.description && 'italic')}>{ updateTask.description ? updateTask.description : 'Ajouter une description' }</P>
								</View>
							</BottomSheetScrollView>
						</Animated.View>
					)
				)
			}
    </View>
  );
}

export default TaskBottomsheet;
