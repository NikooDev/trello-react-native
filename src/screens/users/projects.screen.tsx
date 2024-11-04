import React, { useCallback } from 'react';
import { ActivityIndicator, Dimensions, View } from 'react-native';
import { PriorityEnum } from '@Type/project';
import { theme } from '@Asset/theme/default';
import { resetProjects, setSortPriority } from '@Store/reducers/project.reducer';
import Animated, { FadeInUp } from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootDispatch, RootStateType } from '@Type/store';
import { RootStackPropsUser } from '@Type/stack';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects } from '@Action/project.action';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import ScreenLayout from '@Component/layouts/screen.layout';
import ProjectItem from '@Component/projects/project.item';
import P from '@Component/ui/text';
import Button from '@Component/ui/button';
import useScreen from '@Hook/useScreen';

const ProjectsScreen = ({ navigation }: RootStackPropsUser<'Projects'>) => {
  const { user } = useSelector((state: RootStateType) => state.user);
  const { projects, sortPriority, loading, error } = useSelector((state: RootStateType) => state.project);
  const { lists } = useSelector((state: RootStateType) => state.list);
  const { width } = Dimensions.get('screen');
  const dispatch = useDispatch<RootDispatch>();

  useScreen('dark-content');

  const isNotProjects = (projects.length === 0 && !loading && !error);
  const isNotLists = lists.length === 0;

  const loadProjects = useCallback(async () => {
    if (user.uid) {
      setTimeout(() => dispatch(getProjects(user.uid)), 500);
    }
  }, [user, dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadProjects().then();

      return () => {
        dispatch(resetProjects());
      }
    }, [loadProjects, dispatch])
  );

  const filterProjects = (priority: PriorityEnum | null) => {
    if (priority) {
      return projects.filter((projet) => projet.priority === priority);
    }

    return projects;
  };

  return (
   <ScreenLayout>
     <View className="flex-1">
       {
         isNotProjects && isNotLists && (
           <Animated.View entering={FadeInUp.delay(300)} className="flex-1 items-center justify-center">
             <FastImage source={require('@Asset/img/login.webp')} className="h-52 opacity-50 absolute top-14" resizeMode="contain" style={{width: width - 90}}/>
             <P size={20} weight="semibold" className="text-center mb-4">Vous n'avez pas encore de projet</P>
             <Button onPress={() => navigation.navigate('Menu', { screen: 'CreateProject' })} className="self-center px-4 py-2" textLight color="primary" textSize={24}>Créer un projet</Button>
           </Animated.View>
         )
       }
       {
         sortPriority && (
           <View className="px-4 mb-3 mt-4 flex-row items-center justify-between">
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
           <ActivityIndicator size="large" color={theme.primary} className="mt-8"/>
         ) : !isNotProjects && isNotLists && filterProjects(sortPriority).length > 0 && (
           <FlatList data={filterProjects(sortPriority)}
                     extraData={sortPriority}
                     keyExtractor={(item) => item.uid}
                     style={{paddingVertical: 16}}
                     contentContainerStyle={{paddingBottom: 140}}
                     renderItem={({ item, index }) =>
                       <ProjectItem key={item.uid}
                                    project={item}
                                    index={index}
                                    user={user}
                                    loading={loading}
                                    navigation={navigation}/>
                     }
           />
         )
       }
     </View>
   </ScreenLayout>
  );
}

export default ProjectsScreen;
