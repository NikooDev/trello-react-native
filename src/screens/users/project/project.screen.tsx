import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';
import { RootStackPropsUser } from '@Type/stack';
import { RootDispatch, RootStateType } from '@Type/store';
import { useDispatch, useSelector } from 'react-redux';
import { getProject } from '@Action/project.action';
import { BlurView } from '@react-native-community/blur';
import { cap } from '@Util/functions';
import { useFocusEffect } from '@react-navigation/native';
import { getLists } from '@Action/list.action';
import { FlatList } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { theme } from '@Asset/theme/trello';
import FastImage from 'react-native-fast-image';
import { openBottomSheet } from '@Store/reducers/app.reducer';
import { resetProject } from '@Store/reducers/project.reducer';
import ScreenLayout from '@Component/layouts/screen.layout';
import P from '@Component/ui/text';
import ListProject from '@Screen/users/project/list.project';
import Button from '@Component/ui/button';
import { MemberRole } from '@Type/project';
import { resetLists } from '@Store/reducers/list.reducer';

const ProjectScreen = ({ route, navigation }: RootStackPropsUser<'Project'>) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { uid: projectUID } = route.params as { uid: string };
  const { data } = useSelector((state: RootStateType) => state.app.bottomSheet);
  const { project } = useSelector((state: RootStateType) => state.project);
  const { lists } = useSelector((state: RootStateType) => state.list);
  const { user } = useSelector((state: RootStateType) => state.user);
  const { height, width } = Dimensions.get('screen');
  const dispatch = useDispatch<RootDispatch>();

  const loadProject = useCallback(async () => {
    dispatch(getProject(projectUID));
    dispatch(getLists(projectUID));
  }, [dispatch, projectUID])

  useEffect(() => {
    if (data && data.refresh) {
      dispatch(getProject(projectUID));
    }
  }, [data, dispatch, projectUID]);

  useFocusEffect(
    useCallback(() => {
      loadProject().then();

      return () => {
        dispatch(resetLists());
        dispatch(resetProject());
      }
    }, [loadProject, dispatch])
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.floor(contentOffsetX / (width - 40));
    setCurrentIndex(newIndex);
  };

  const handleProjectSettings = () => {
    if (project) {
      const isMemberAdmin = project.members.some(member => member.uid === user.uid && member.role === MemberRole.ADMIN);

      if (user.uid === project.adminUID || isMemberAdmin) {
        dispatch(openBottomSheet({
          bottomSheet: { name: 'Project', height: 100, enablePanDownToClose: false, handleStyle: false, data: navigation }
        }));
      } else {
        Alert.alert(`Projet ${cap(project.title)}`, 'Vous devez être administrateur du projet pour effectuer cette action.');
      }
    }
  }

  return (
    <ScreenLayout>
      {
        !project ? (
          <ActivityIndicator size="large" color={theme.primary} className="mt-8"/>
        ) : (
          <View className="flex-1">
            <FastImage onProgress={() => console.log('refresh')}
                       source={{uri: project ? `${project.cover.portrait}` : undefined}}
                       className="absolute"
                       style={{width, height}}/>
            <View className="flex-1">
              <BlurView blurType="regular" style={{...StyleSheet.absoluteFillObject, height: 66}}>
                <View className="bg-black/40 flex-row justify-between items-center px-4" style={{height: 66}}>
                  <View>
                    <P size={23} light>{ cap(project.title) }</P>
                    <P size={13} light>Espace de travail</P>
                  </View>
                  <View>
                    <Button onPress={handleProjectSettings} textSize={0} children={null} icon="settings" color="none" className="bg-white/20 h-10 w-10 rounded-full" iconColor="#fff" iconSize={24}/>
                  </View>
                </View>
              </BlurView>
              <View className="flex-1" style={{ paddingBottom: 100, marginTop: 85 }}>
                <FlatList data={[ ...lists, { add: true } ]}
                          snapToInterval={width}
                          pagingEnabled
                          keyboardShouldPersistTaps="handled"
                          showsHorizontalScrollIndicator={false}
                          keyExtractor={(_, index) => index.toString()}
                          snapToAlignment="center"
                          decelerationRate="fast"
                          horizontal
                          onScroll={handleScroll}
                          contentContainerStyle={{paddingHorizontal: 20, gap: 40}}
                          renderItem={({item, index}) => (
                            <ListProject key={index} nbTasks={project.nbTasks} item={item} projectUID={projectUID}/>
                          )}
                />
                <View className="flex-row relative items-center justify-center mb-12">
                  {
                    [...lists, { add: true }].map((_, index) => (
                      <PaginationDots currentIndex={currentIndex} index={index} key={index}/>
                    ))
                  }
                </View>
              </View>
            </View>
          </View>
        )
      }
    </ScreenLayout>
  );
}

const PaginationDots = ({currentIndex, index}: { currentIndex: number, index: number }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(currentIndex === index ? 24 : 12, { duration: 300 }),
      opacity: withTiming(currentIndex === index ? 1 : 0.5, { duration: 300 }),
    };
  });

  return (
    <Animated.View
      className="h-3 bg-white rounded-full z-10 mx-0.5"
      style={animatedStyle}
    />
  )
}

export default ProjectScreen;
