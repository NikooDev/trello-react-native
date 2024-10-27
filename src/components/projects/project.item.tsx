import React, { useEffect } from 'react';
import { View, Pressable, Alert, Dimensions } from 'react-native';
import { MemberRoleEnum, ProjectItemInterface } from '@Type/project';
import FastImage from 'react-native-fast-image';
import { setLocalProject } from '@Store/reducers/project.reducer';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { RootDispatch } from '@Type/store';
import { useDispatch } from 'react-redux';
import P from '@Component/ui/text';
import Button from '@Component/ui/button';
import Avatar from '@Component/ui/avatar';

const ProjectItem: React.FC<ProjectItemInterface> = ({
	project,
	index,
	user,
	navigation
}) => {
	const progress = project.nbTasks > 0 ? Math.round((project.nbTasksEnd / project.nbTasks) * 100) : 0;
	const isMembers = project.members.some((member) => member.uid === user.uid && member.role === MemberRoleEnum.MEMBER);
	const { width } = Dimensions.get('screen');
	const dispatch = useDispatch<RootDispatch>();

	useEffect(() => {
		FastImage.preload([{uri: project.cover.portrait}]);
	}, []);

	const handleNavigate = () => {
		dispatch(setLocalProject(project));
		navigation.navigate('Menu', { screen: 'Project' });
	}

  return (
		<Animated.View entering={FadeInLeft.delay(100 * index)} key={project.uid} className="mb-4">
			<Pressable onPress={handleNavigate} className="relative px-4">
				<View className="rounded-t-2xl overflow-hidden relative">
					<View className="py-2 px-3">
						<P size={24} weight="semibold" light>{ project.title.cap() }</P>
						<View className="flex-row items-center mt-1">
							<P size={15} weight="semibold" light>{ project.nbTasks } tâche{ project.nbTasks > 1 && 's' }</P>
							<P size={10} className="mx-1" light> • </P>
							<P size={15} weight="semibold" light>{ project.members.length } membres</P>
						</View>
					</View>
					{ isMembers && (
						<Button onPress={() => Alert.alert(`Projet ${project.title.cap()}`, 'Ce projet est en lecture seule.\nVous ne pouvez pas le modifier ni le supprimer.')}
										className="h-8 w-8 absolute right-2 bottom-2 z-10"
										textSize={0} icon="lock-closed"
										iconSize={20} color="none"
										iconColor="#fff" children={null}/>
					)}
					<FastImage source={{uri: project.cover.landscape}} resizeMode="cover" className="absolute -z-10" style={{width: width - 32, height: isMembers ? width / 4.3 : width / 5}}/>
					<View className="bg-black/60 h-full w-full absolute top-0 left-0 -z-10"/>
				</View>
				<View className="bg-white py-3 px-4 rounded-b-2xl">
					<P size={15} weight="semibold">Créé par { project.author }</P>
					<P size={15} weight="semibold" className="mt-1">Progression :</P>
					<View className="relative mt-3 mb-4">
						<P size={12} weight="bold" light={progress >= 50} className="absolute w-full text-center z-10 top-0.5">{ progress }%</P>
						<View className="bg-slate-300 w-full h-5 rounded-2xl absolute top-0"/>
						<View className="bg-primary h-5 rounded-2xl absolute top-0" style={{ width: `${progress}%` }}/>
					</View>
					<View className="flex-row items-center w-full mt-4">
						{
							project.members.slice(0, 6).map((member, index) => (
								<View key={index}>
									<Avatar size={36} avatarID={member.avatarID} className="-mr-3"/>
								</View>
							))
						}
						{
							project.members.length > 6 && (
								<P size={15} weight="semibold" className="ml-4" style={{lineHeight: 15}}>+{project.members.length - 6}</P>
							)
						}
						<P size={13} className="self-end text-slate-500 ml-auto">{ project.created.toRelativeDate() }</P>
					</View>
				</View>
			</Pressable>
		</Animated.View>
  );
}

export default ProjectItem;
