import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Pressable, View } from 'react-native';
import { RootDispatch, RootStateType } from '@Type/store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackUserType } from '@Type/stack';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import { shadowText, theme } from '@Asset/theme/default';
import { MemberRoleEnum, PriorityEnum, ProjectInterface } from '@Type/project';
import { closeBottomSheet, setCalendarProject } from '@Store/reducers/app.reducer';
import { resetProjects } from '@Store/reducers/project.reducer';
import { useDispatch, useSelector } from 'react-redux';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { getProject, getProjects } from '@Action/project.action';
import P from '@Component/ui/text';
import Class from 'classnames';
import Button from '@Component/ui/button';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CalendarBottomsheet = () => {
  const { data } = useSelector((state: RootStateType) => state.app.bottomSheet);
  const { projects, loading } = useSelector((state: RootStateType) => state.project);
  const { user } = useSelector((state: RootStateType) => state.user);
  const [loadBottomSheet, setLoadBottomSheet] = useState<boolean>(true);
  const dispatch = useDispatch<RootDispatch>();
  const { width } = Dimensions.get('screen');
  const bottomSheetData = data as { navigation: NativeStackNavigationProp<RootStackUserType, 'Calendar', undefined> };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    timer = setTimeout(() => {
      dispatch(getProjects(user.uid));
      setLoadBottomSheet(false);
      clearTimeout(timer);
    }, 500);

    return () => {
      clearTimeout(timer);
    }
  }, [dispatch, user, data]);

  const handleChooseProject = async (projectUID: string) => {
    const resultProject = await dispatch(getProject(projectUID));

    if (resultProject.meta.requestStatus === 'fulfilled') {
      const project = resultProject.payload as ProjectInterface;
      dispatch(setCalendarProject(project));
    }

    dispatch(closeBottomSheet({}));
  }

  const handlePriority = (priority: PriorityEnum): string => {
    switch (priority) {
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

  const handleRedirectCreateProject = () => {
    dispatch(closeBottomSheet({}));
    bottomSheetData && bottomSheetData.navigation.navigate('Menu', { screen: 'CreateProject' });
  }

  return (
    <View className="flex-1 pt-4 pb-4">
      {
        projects.length !== 0 ? (
          <BottomSheetFlatList data={projects}
                               contentContainerStyle={{flexGrow: 1}}
                               extraData={projects}
                               keyExtractor={(item) => item.uid}
                               renderItem={({item, index}) => {
                                 const isMembers = item.members.some((member) => member.uid === user.uid && member.role === MemberRoleEnum.MEMBER);

                                 return (
                                   <AnimatedPressable onPress={() => handleChooseProject(item.uid!)} entering={FadeInLeft.delay(100 * index)} key={item.uid} style={{width: width, height: width / 6}} className="justify-center relative mb-3">
                                     <View className="absolute z-10 px-4 w-full">
                                       <P size={18} weight="semibold" light style={shadowText} className="pl-5 pr-10">{ item.title.toUpperCase() }</P>
                                       <P size={15} weight="semibold" className="pl-5" light style={shadowText}>{ item.nbTasks } tâche{ item.nbTasks > 1 && 's' }</P>
                                       <View className={Class('w-2 h-7 rounded-2xl top-1.5 absolute left-4 z-10', item.priority && handlePriority(item.priority))}/>
                                       {
                                         isMembers && (
                                           <Button onPress={() => Alert.alert(`Projet ${item.title.cap()}`, 'Ce projet est en lecture seule.\nVous ne pouvez pas le modifier ni le supprimer.')}
                                                   className="h-8 w-8 absolute right-4 bottom-2 z-10"
                                                   textSize={0} icon="lock-closed"
                                                   iconSize={20} color="none"
                                                   iconColor="#fff" children={null}/>
                                         )
                                       }
                                     </View>
                                     <FastImage source={{uri: item.cover.landscape}} resizeMode="cover" style={{width: width, height: width / 6}}/>
                                     <View className="bg-black/50 h-full w-full absolute top-0 left-0"/>
                                   </AnimatedPressable>
                                 )
                               }}/>
        ) : loading && (
          <ActivityIndicator size="large" className="mt-6" color={theme.primary}/>
        )
      }
      {
        (loadBottomSheet && !loading) && projects.length === 0 && (
          <View className="mt-20">
            <P size={20} weight="semibold" className="text-center mb-4">Vous n'avez pas encore de projet</P>
            <Button onPress={handleRedirectCreateProject} className="self-center px-4 py-2" textLight color="primary" textSize={24}>Créer un projet</Button>
          </View>
        )
      }
    </View>
  );
}

export default CalendarBottomsheet;
