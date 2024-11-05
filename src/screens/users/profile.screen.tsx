import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, Alert, Dimensions, Pressable, View } from 'react-native';
import { DateTime } from 'luxon';
import { shadowText, theme } from '@Asset/theme/default';
import { resetProjects, setLocalProject } from '@Store/reducers/project.reducer';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import { MemberRoleEnum, ProjectInterface } from '@Type/project';
import { RootStackPropsUser } from '@Type/stack';
import { RootDispatch, RootStateType } from '@Type/store';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { getProjects } from '@Action/project.action';
import { FlatList } from 'react-native-gesture-handler';
import ScreenLayout from '@Component/layouts/screen.layout';
import useScreen from '@Hook/useScreen';
import Avatar from '@Component/ui/avatar';
import P from '@Component/ui/text';
import Button from '@Component/ui/button';

const AnimatePressable = Animated.createAnimatedComponent(Pressable);

const ProfileScreen = ({ navigation }: RootStackPropsUser<'Profile'>) => {
  const { user } = useSelector((state: RootStateType) => state.user);
  const { projects, loading } = useSelector((state: RootStateType) => state.project);
  const dispatch = useDispatch<RootDispatch>();
  const { width } = Dimensions.get('screen');

  useScreen('dark-content');

  useFocusEffect(
    useCallback(() => {
      dispatch(getProjects(user.uid));

      return () => {
        dispatch(resetProjects());
      }
    }, [dispatch, user.uid])
  )

  const lastProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];

    return projects.slice()
    .sort((a, b) => {
      const dateA = typeof a.created === 'string' ? DateTime.fromISO(a.created) : a.created;
      const dateB = typeof b.created === 'string' ? DateTime.fromISO(b.created) : b.created;

      return dateB.toMillis() - dateA.toMillis();
    })
    .slice(0, 4);
  }, [projects])

  const handleNavigate = (project: ProjectInterface) => {
    FastImage.preload([{uri: project.cover.portrait}]);
    dispatch(setLocalProject(project));
    navigation.navigate('Menu', { screen: 'Project' });
  }

  return (
   <ScreenLayout>
     <View className="flex-1 pt-8">
       <View className="items-center mb-10">
         <Avatar size={150} avatarID={user.avatarID}/>
         <P size={32} className="mt-3" weight="semibold">{ user.firstname.cap() } { user.lastname.cap() }</P>
         <P size={16}>{ user.email }</P>
       </View>
       <View>
         <P size={18} weight="semibold" className="px-4">Derniers projets</P>
         <View className="mt-4 px-4">
           {
             (loading && projects.length === 0) ? (
               <ActivityIndicator size="large" color={theme.primary} className="mt-4"/>
             ) : (
               <FlatList data={lastProjects}
                         extraData={projects}
                         keyExtractor={project => project.uid}
                         numColumns={2}
                         columnWrapperStyle={{gap: 16}}
                         renderItem={({ item: project, index }) => {
                           const isMembers = project.members.some((member) => member.uid === user.uid && member.role === MemberRoleEnum.MEMBER);
                           return (
                             <AnimatePressable onPress={() => handleNavigate(project)} entering={FadeInLeft.delay(100 * index)} key={project.uid} style={{ width: (width / 2) - 24, height: width / 4 }} className="rounded-2xl relative overflow-hidden relative mb-3">
                               <View className="absolute z-10 px-4 w-full py-4">
                                 <P size={15} numberOfLines={2} weight="semibold" light style={shadowText}>{ project.title.toUpperCase() }</P>
                                 <P size={13} weight="semibold" light style={shadowText}>{ project.nbTasks } tâche{ project.nbTasks > 1 && 's' }</P>
                               </View>
                               <FastImage source={{uri: project.cover.landscape}} resizeMode="cover" style={{ width: (width / 2) - 24, height: width / 4 }}/>
                               {
                                 isMembers && (
                                   <Button onPress={() => Alert.alert(`Projet ${project.title.cap()}`, 'Ce projet est en lecture seule.\nVous ne pouvez pas le modifier ni le supprimer.')}
                                           className="h-8 w-8 absolute bottom-2 right-1 z-10"
                                           textSize={0} icon="lock-closed"
                                           iconSize={20} color="none"
                                           iconColor="#fff" children={null}/>
                                 )
                               }
                               <View className="bg-black/50 h-full w-full absolute top-0 left-0"/>
                             </AnimatePressable>
                           )
                         }}
               />
             )
           }

         </View>
       </View>
     </View>
   </ScreenLayout>
  );
}

export default ProfileScreen;
