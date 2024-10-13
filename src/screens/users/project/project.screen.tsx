import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';
import { RootStackPropsUser } from '@Type/stack';
import { RootDispatch, RootStateType } from '@Type/store';
import { useDispatch, useSelector } from 'react-redux';
import { getProject } from '@Action/project.action';
import { BlurView } from '@react-native-community/blur';
import { cap } from '@Util/functions';
import { useFocusEffect } from '@react-navigation/native';
import { getLists } from '@Action/list.action';
import { FlatList } from 'react-native-gesture-handler';
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { theme } from '@Asset/theme/trello';
import FastImage from 'react-native-fast-image';
import { resetProject } from '@Store/reducers/project.reducer';
import ScreenLayout from '@Component/layouts/screen.layout';
import P from '@Component/ui/text';
import ListProject from '@Screen/users/project/list.project';

const ProjectScreen = ({ route }: RootStackPropsUser<'Project'>) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { uid: projectUID } = route.params as { uid: string };
  const { project } = useSelector((state: RootStateType) => state.project);
  const { lists } = useSelector((state: RootStateType) => state.list);
  const { height, width } = Dimensions.get('screen');
  const dispatch = useDispatch<RootDispatch>();

  const loadProject = useCallback(async () => {
    dispatch(getProject(projectUID));
    dispatch(getLists(projectUID));
  }, [dispatch, projectUID])

  useFocusEffect(
    useCallback(() => {
      loadProject().then();

      return () => {
        dispatch(resetProject());
      }
    }, [loadProject, dispatch])
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.floor(contentOffsetX / (width - 40));
    setCurrentIndex(newIndex);
  };

  return (
    <ScreenLayout>
      {
        !project ? (
          <ActivityIndicator size="large" color={theme.primary} className="mt-4"/>
        ) : (
          <Animated.View entering={FadeIn} className="flex-1">
            <FastImage source={{uri: project.cover.portrait}} className="absolute" style={{width, height}}/>
            <BlurView blurType="regular" style={{...StyleSheet.absoluteFillObject, height: 66}}>
              <View className="bg-black/40 justify-center px-4" style={{height: 66}}>
                <P size={23} light>{ cap(project.title) }</P>
                <P size={13} light>Espace de travail</P>
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
                          <ListProject item={(item)} key={index} index={index} projectUID={projectUID}/>
                        )}
              />
              <View className="flex-row relative items-center justify-center mb-10">
                {
                  lists.length > 0 && [...lists, { add: true }].map((_, index) => (
                    <PaginationDots currentIndex={currentIndex} index={index} key={index}/>
                  ))
                }
              </View>
            </View>
          </Animated.View>
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
