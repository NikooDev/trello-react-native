import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, TextInput, View, ViewToken } from 'react-native';
import { RootStackPropsUser } from '@Type/stack';
import { RootDispatch, RootStateType } from '@Type/store';
import { ListInterface } from '@Type/list';
import Animated, { FadeIn, SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import { theme } from '@Asset/theme/default';
import { resetLists } from '@Store/reducers/list.reducer';
import { resetTasks } from '@Store/reducers/task.reducer';
import { resetProjects } from '@Store/reducers/project.reducer';
import { FlatList } from 'react-native-gesture-handler';
import { BlurView } from '@react-native-community/blur';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { getLists } from '@Action/list.action';
import { getTasks } from '@Action/task.action';
import ScreenLayout from '@Component/layouts/screen.layout';
import useScreen from '@Hook/useScreen';
import P from '@Component/ui/text';
import Button from '@Component/ui/button';
import ListItem from '@Component/projects/list.item';
import PaginationItem from '@Component/projects/pagination.item';
import OutsidePressHandler from 'react-native-outside-press';

const AnimateFastImage = Animated.createAnimatedComponent(FastImage);

const ProjectScreen = ({ navigation }: RootStackPropsUser<'Project'>) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentListUID, setCurrentListUID] = useState<string | null>(null);
  const [searchList, setSearchList] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);
  const inputSearchList = useRef<TextInput>(null);
  const { user } = useSelector((state: RootStateType) => state.user);
  const { project } = useSelector((state: RootStateType) => state.project);
  const { lists, loading } = useSelector((state: RootStateType) => state.list);
  const { loading: loadingTask } = useSelector((state: RootStateType) => state.task);
  const { height, width } = Dimensions.get('screen');
  const dispatch = useDispatch<RootDispatch>();

  const heightTopBar = 110;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  useScreen('light-content');

  useFocusEffect(
    useCallback(() => {
      if (project && project.uid) {
        dispatch(getLists(project.uid));
      }

      return () => {
        dispatch(resetProjects());
        dispatch(resetLists());

        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: false });
          }
        }, 300);
      }
    }, [project?.uid, dispatch, flatListRef])
  )

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.floor(contentOffsetX / (width - 40));

    setCurrentIndex(newIndex);
  }

  const handleProjectSettings = () => {
    if (project) {
      navigation.navigate('Menu', { screen: 'UpsertProject', params: { create: false, projectTitle: project.title } })
    }
  }

  const handleActiveSearchList = () => {
    setSearchList(true);

    setTimeout(() => {
      inputSearchList.current?.focus();
    }, 200);
  }

  const handleSearchList = (value: string) => {
    if (value.trim().length === 0) return;

    const index = lists.findIndex(item => item.title.toLowerCase().includes(value.toLowerCase()));

    if (index !== -1 && flatListRef.current) {
      const offset = index * width;
      flatListRef.current.scrollToOffset({ offset, animated: true });
    }
  };

  const handleOutsidePress = () => {
    setSearchList(false);
  }

  const onViewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const firstVisibleItem = viewableItems[0].item as ListInterface;
      dispatch(resetTasks());
      setCurrentListUID(firstVisibleItem.uid);
    }
  }

  useEffect(() => {
    if (project && currentListUID) {
      dispatch(getTasks({ projectUID: project.uid, listUID: currentListUID }));
    }
  }, [project, currentListUID, dispatch]);

  return (
   <ScreenLayout>
     {
       !project ? (
         <ActivityIndicator size="large" color={theme.primary} className="mt-8"/>
       ) : (
         <View className="flex-1">
           <AnimateFastImage entering={FadeIn}
                             key={project.uid}
                             source={{uri: project.cover.portrait}}
                             className="absolute z-0"
                             style={{width, height}}/>
           <OutsidePressHandler onOutsidePress={handleOutsidePress} className="relative w-full overflow-hidden" style={{height: heightTopBar}}>
             <BlurView blurType="regular" style={{...StyleSheet.absoluteFillObject, height: heightTopBar}}>
               <View className="flex-row justify-between items-end px-4 pb-4 overflow-hidden" style={{height: heightTopBar}}>
                 <View className="flex-col">
                   {
                     searchList ? (
                       <Animated.View key={searchList ? '0' : '1'} entering={SlideInLeft} exiting={SlideOutLeft}>
                         <TextInput ref={inputSearchList}
                                    className="font-text-semibold px-4 bg-white/20 rounded-full h-10 text-white/90"
                                    cursorColor="#ffffffe6"
                                    placeholder="Rechercher une liste"
                                    onChangeText={handleSearchList}
                                    style={{width: 275}}/>
                       </Animated.View>
                     ) : (
                       <Animated.View entering={SlideInLeft} exiting={SlideOutLeft}>
                         <P size={22} light weight="semibold" style={{width: 275}}>{ project.title.cap() }</P>
                         <P size={13} light>Espace de travail</P>
                       </Animated.View>
                     )
                   }

                 </View>
                 <View className="flex-row gap-3">
                   <View className="h-10 w-10">
                     <Button onPress={handleActiveSearchList} textSize={0} children={null} icon="search" color="none" className="bg-white/20 h-10 w-10 rounded-full" iconColor="#fff" iconSize={24}/>
                   </View>
                   <View className="h-10 w-10">
                     <Button onPress={handleProjectSettings} textSize={0} children={null} icon="settings" color="none" className="bg-white/20 h-10 w-10 rounded-full" iconColor="#fff" iconSize={24}/>
                   </View>
                 </View>
               </View>
             </BlurView>
           </OutsidePressHandler>
           <View className="flex-1 items-center z-30">
             <View className="flex-1 justify-between items-center">
               <FlatList ref={flatListRef}
                         initialScrollIndex={0}
                         data={[ ...lists, { uid: 0, add: true } ]}
                         extraData={[ ...lists, { uid: 0, add: true } ]}
                         snapToInterval={width}
                         pagingEnabled
                         keyboardShouldPersistTaps="handled"
                         showsHorizontalScrollIndicator={false}
                         keyExtractor={(item) => item.uid}
                         snapToAlignment="center"
                         decelerationRate="fast"
                         horizontal
                         onScroll={handleScroll}
                         onViewableItemsChanged={onViewableItemsChanged}
                         viewabilityConfig={viewabilityConfig}
                         style={{marginTop: 16}}
                         contentContainerStyle={{paddingHorizontal: 20, gap: 40}}
                         renderItem={({ item }) => (
                           <ListItem key={item.uid}
                                     list={item}
                                     listActive={currentListUID}
                                     user={user}
                                     loading={loading}
                                     loadingTask={loadingTask}
                                     project={project}/>
                         )}
               />
               <View className="flex-row relative pb-40">
                 {
                   [...lists, { add: true }].map((_, index) => (
                     <PaginationItem currentIndex={currentIndex}
                                     index={index}
                                     key={index}/>
                   ))
                 }
               </View>
             </View>
           </View>
           <View className="bg-black/60 z-10" style={{width, height, ...StyleSheet.absoluteFillObject, top: heightTopBar}}/>
         </View>
       )
     }
   </ScreenLayout>
  );
}

export default ProjectScreen;
