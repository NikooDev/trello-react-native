import React, { useCallback } from 'react';
import { ActivityIndicator, Alert, Dimensions, Pressable, View } from 'react-native';
import { MemberRole, PriorityEnum } from '@Type/project';
import { RootStackPropsUser } from '@Type/stack';
import { RootDispatch, RootStateType } from '@Type/store';
import Animated, { FadeInLeft, FadeInUp } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects } from '@Action/project.action';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import { cap, formatRelativeDate } from '@Util/functions';
import FastImage from 'react-native-fast-image';
import { DateTime } from 'luxon';
import Icon from 'react-native-vector-icons/Ionicons';
import { resetProjects, setSortPriority } from '@Store/reducers/project.reducer';
import { shadowText, theme } from '@Asset/theme/trello';
import ScreenLayout from '@Component/layouts/screen.layout';
import P from '@Component/ui/text';
import Avatar from '@Component/ui/avatar';
import Button from '@Component/ui/button';

const ProjectsScreen = ({ navigation } : RootStackPropsUser<'Projects'>) => {
	const { user } = useSelector((state: RootStateType) => state.user);
	const { projects, loading, sortPriority, error } = useSelector((state: RootStateType) => state.project);
	const { lists } = useSelector((state: RootStateType) => state.list);
	const { width } = Dimensions.get('screen');
	const dispatch = useDispatch<RootDispatch>();

	const loadProjects = useCallback(async () => {
		if (user.uid) {
			setTimeout(() => dispatch(getProjects(user.uid)), 500);
		}
	}, [dispatch, user]);

	useFocusEffect(
		useCallback(() => {
			loadProjects().then();
		}, [loadProjects])
	);

	useFocusEffect(
		useCallback(() => {
			return () => {
				dispatch(resetProjects());
			}
		}, [dispatch])
	)

	const filterProjectsByPriority = (pr: PriorityEnum | undefined) => {
		if (pr) {
			return projects.filter((p) => p.priority === pr);
		}

		return projects;
	};

	return (
		<ScreenLayout statusBarStyle="default" className="py-4">
			<View className="flex-1">
				{
					(lists.length === 0 && !loading && !error && projects.length === 0) && (
						<Animated.View entering={FadeInUp.delay(300)} className="flex-1 items-center justify-center">
							<FastImage source={require('@Asset/img/login.webp')} className="h-52 opacity-50 absolute top-14" resizeMode="contain" style={{width: width - 90}}/>
							<P size={20} weight="semibold" className="text-center mb-4">Vous n'avez pas encore de projet</P>
							<Button onPress={() => navigation.navigate('Menu', { screen: 'CreateProject' })} className="self-center px-4 py-2" textLight color="primary" textSize={24}>Créer un projet</Button>
						</Animated.View>
					)
				}
				{
					sortPriority && (
						<View className="px-4 mb-3 flex-row items-center justify-between">
							<View className="flex-row items-center">
								<P size={20} weight="semibold" className="mr-1">Filtre : </P>
								{
									sortPriority === PriorityEnum.HIGH && (
										<Button textSize={0} icon="arrow-up-outline" className="bg-red-500 px-3 py-1" textLight iconSize={20} children={null}/>
									)
								}
								{
									sortPriority === PriorityEnum.MEDIUM && (
										<Button textSize={20} icon="pause-outline" className="bg-orange-500 px-3 py-1" textLight>
											<View style={{ transform: [{ rotate: '90deg' }] }}>
												<Icon name="pause-outline" size={20} color="#fff"/>
											</View>
										</Button>
									)
								}
								{
									sortPriority === PriorityEnum.LOW && (
										<Button textSize={0} icon="arrow-down-outline" className="bg-green-500 px-3 py-1" textLight iconSize={20} children={null}/>
									)
								}
							</View>
							<Button textSize={15} textLight className="px-3 py-1.5" color="primary" onPress={() => dispatch(setSortPriority(undefined))}>Effacer le fitre</Button>
						</View>
					)
				}
				{
					loading ? (
						<ActivityIndicator size="large" color={theme.primary} className="mt-4"/>
					) : lists.length === 0 && filterProjectsByPriority(sortPriority).length > 0 && !error && (
						<FlatList
							extraData={sortPriority}
							data={filterProjectsByPriority(sortPriority)}
							contentContainerStyle={{flexGrow: 1, paddingBottom: 110}}
							keyExtractor={(item) => item.uid!.toString()}
							renderItem={({ item, index }) => {
								const progress = item.nbTasks > 0 ? (item.nbTasksEnd / item.nbTasks) * 100 : 0;
								const isMembers = item.members.some((member) => member.uid === user.uid && member.role === MemberRole.MEMBER);

								return (
									<Animated.View entering={FadeInLeft.delay(100 * index)} key={projects.length > 0 ? '1' : '0'} className="mb-3">
										<Pressable className="relative px-4" onPress={() => navigation.navigate('Menu', { screen: 'Project', params: { uid: item.uid } })}>
											<View className="rounded-t-2xl overflow-hidden">
												<View className="absolute z-10 px-4 pt-3.5 w-full h-full">
													<P size={28} weight="semibold" light style={shadowText}>{ cap(item.title) }</P>
													<P size={15} weight="semibold" className="mt-1" light style={shadowText}>{ item.nbTasks } tâche{ item.nbTasks > 1 && 's' }</P>
												</View>
												{ isMembers && (
													<Button onPress={() => Alert.alert(`Projet ${cap(item.title)}`, 'Ce projet est en lecture seule.\nVous ne pouvez pas le modifier ni le supprimer.')}
																className="h-8 w-8 absolute right-2 bottom-2 z-10"
																textSize={0} icon="lock-closed"
																iconSize={20} color="none"
																iconColor="#fff" children={null}/>
												)}
												<FastImage source={{uri: item.cover.landscape}} resizeMode="cover" style={{width, height: isMembers ? width / 4.3 : width / 5}}/>
												<View className="bg-black/50 h-full w-full absolute top-0 left-0"/>
											</View>
											<View className="bg-white py-3 px-4 rounded-b-2xl">
												<P size={15} weight="semibold">Créé par { item.author }</P>
												<P size={15} weight="semibold" className="mt-1">Progression :</P>
												<View className="relative mt-3 mb-4">
													<P size={12} weight="bold" light={progress > 50} className="absolute w-full text-center z-10 top-0.5">{ progress }%</P>
													<View className="bg-slate-300 w-full h-5 rounded-2xl absolute top-0"/>
													<View className="bg-primary h-5 rounded-2xl absolute top-0" style={{ width: progress }}/>
												</View>
												<View className="flex-row items-center w-full mt-4">
													{
														item.members.map((member, index) => (
															<View key={index}>
																<Avatar size={36} avatarID={member.avatarID} className="-mr-3"/>
																{
																	item.members.length > 6 && (
																		<P size={15} weight="semibold" className="ml-4" style={{lineHeight: 15}}>+{item.members.length - 6}</P>
																	)
																}
															</View>
														))
													}
													<P className="self-end text-slate-400 ml-auto" size={15}>{ formatRelativeDate(DateTime.fromJSDate(item.created)) }</P>
												</View>
											</View>
										</Pressable>
									</Animated.View>
								)
							}}
						/>
					)
				}
			</View>
		</ScreenLayout>
  );
}

export default ProjectsScreen;
