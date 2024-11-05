import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, View, Pressable } from 'react-native';
import { DateTime } from 'luxon';
import { RootDispatch, RootStateType } from '@Type/store';
import { RootStackPropsUser } from '@Type/stack';
import { TaskInterface } from '@Type/task';
import { theme } from '@Asset/theme/default';
import { openBottomSheet } from '@Store/reducers/app.reducer';
import { resetProjects } from '@Store/reducers/project.reducer';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeIn, FadeInRight, FadeOut, FadeOutRight } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { handlePriority } from '@Util/functions';
import { FlatList } from 'react-native-gesture-handler';
import { getCalendarTasks } from '@Action/calendar.action';
import Calendar from '@Component/calendar/calendar';
import useCalendar from '@Hook/useCalendar';
import P from '@Component/ui/text';
import Button from '@Component/ui/button';
import Class from 'classnames';
import useScreen from '@Hook/useScreen';
import { useFocusEffect } from '@react-navigation/native';

const CalendarScreen = ({ navigation }: RootStackPropsUser<'Calendar'>) => {
  const { user } = useSelector((state: RootStateType) => state.user);
  const { calendarProject } = useSelector((state: RootStateType) => state.app);
  const { updated } = useSelector((state: RootStateType) => state.task);
  const { loading } = useSelector((state: RootStateType) => state.calendar);
  const { selectedDay, currentMonth, currentYear, tasks } = useCalendar();
  const dispatch = useDispatch<RootDispatch>();

  useScreen('dark-content');

  useFocusEffect(
    useCallback(() => {
      return () => {
        dispatch(resetProjects());
      }
    }, [dispatch])
  )

  const handleGetPointsTasks = useCallback(() => {
    if (calendarProject) {
      dispatch(getCalendarTasks({
        projectUID: calendarProject.uid,
        userUID: user.uid,
        isAll: true
      }));
    }
  }, [calendarProject, user, updated, dispatch]);

  useEffect(() => handleGetPointsTasks(), [handleGetPointsTasks]);

  const handleSelectProject = () => {
    dispatch(openBottomSheet({
      name: 'Calendar',
      height: 50,
      handleStyle: false,
      enablePanDownToClose: false,
      data: {
        navigation
      }
    }));
  }

  const handleGetTasks = useCallback(() => {
    if (calendarProject && currentYear && currentMonth && selectedDay) {
      const selectedDate = DateTime.fromObject({
        year: currentYear,
        month: currentMonth,
        day: selectedDay
      });

      dispatch(getCalendarTasks({
        projectUID: calendarProject.uid,
        userUID: user.uid,
        start: selectedDate.startOf('day').toJSDate(),
        end: selectedDate.endOf('day').toJSDate(),
        isAll: false
      }))
    }
  }, [calendarProject, currentYear, currentMonth, selectedDay, user, updated, dispatch]);

  useEffect(() => handleGetTasks(), [handleGetTasks]);

  const handleSelectTask = (task: TaskInterface) => {
    dispatch(openBottomSheet({
      name: 'Task',
      height: 60,
      handleStyle: true,
      enablePanDownToClose: true,
      data: {
        listUID: task.listUID,
        task
      }
    }));
  }

  return (
    <>
      <View className="bg-white flex-row items-center pb-4 pt-1 w-full">
        {
          calendarProject ? (
            <Button textSize={17} onPress={handleSelectProject} children={calendarProject.title.toUpperCase()} color="none" className="pl-4 items-center" textClass="uppercase w-72" icon="chevron-down" iconSize={24}/>
          ) : (
            <Button textSize={17} onPress={handleSelectProject} color="none" className="pl-4 items-center" textClass="uppercase" icon="chevron-down" iconSize={24}>
              Sélectionner un projet
            </Button>
          )
        }
        {
          loading && (
            <ActivityIndicator size="large" color={theme.primary} className="mr-4 bottom-3 absolute right-0"/>
          )
        }
      </View>
      <Calendar/>
      <View className="h-4 w-full bg-default"/>
      <View className="flex-1 px-1">
        {
          !loading && (calendarProject && tasks.length === 0) ? (
            <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} className="items-center mt-10">
              <P size={20} weight="semibold" className="mb-4">Aucune tâche à ce jour</P>
              <Button onPress={() => navigation.navigate('Menu', { screen: 'Project', params: { uid: calendarProject.uid } })} textSize={20} color="primary" textLight className="py-2 px-4 self-center">Créer une tâche</Button>
            </Animated.View>
          ) : !calendarProject && (
            <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} className="items-center mt-4">
              <Button onPress={handleSelectProject} textSize={20} color="primary" textLight className="py-3 px-4 self-center">Sélectionner un projet</Button>
            </Animated.View>
          )
        }
        <FlatList data={tasks}
                  extraData={tasks}
                  keyExtractor={(item) => item.uid}
                  ListFooterComponent={() => (
                    calendarProject && tasks.length !== 0 && (
                      <View>
                        <Button onPress={() => navigation.navigate('Menu', { screen: 'Project', params: { uid: calendarProject.uid } })} textSize={20} color="primary" textLight className="py-2 px-4 self-center mt-4">Créer une tâche</Button>
                      </View>
                    )
                  )}
                  contentContainerStyle={{flexGrow: 0, paddingBottom: 150}}
                  renderItem={({ item: task, index }) => (
                    <Animated.View key={task.uid} entering={FadeInRight.delay(100 * index).duration(150)} exiting={FadeOutRight.duration(150)}>
                      <View className="flex-row mr-3">
                        <View className="w-16">
                          <P size={26} weight="bold" className="text-slate-700 text-center">{(task.start as DateTime).day}</P>
                          <P size={15} weight="bold" className="text-slate-700 text-center -mt-1">{(task.start as DateTime).toLocaleString({month: 'short'})}</P>
                          <View className="relative mt-0.5 mb-0.5">
                            <P size={13} weight="semibold" className="text-slate-600 text-center">au</P>
                          </View>
                          <P size={26} weight="bold" className="text-slate-700 text-center">{(task.end as DateTime).day}</P>
                          <P size={15} weight="bold" className="text-slate-700 text-center -mt-1">{(task.end as DateTime).toLocaleString({month: 'short'})}</P>
                        </View>
                        <Pressable onPress={() => handleSelectTask(task)} className="bg-white relative flex-1 rounded-lg pl-4 pr-3 pt-2 pb-3">
                          {
                            task.priority && <View className={Class(handlePriority(task.priority), 'w-2 h-5 rounded-full absolute -left-1 top-2.5')}/>
                          }
                          {
                            task.userUID !== user.uid && (
                              <View className="absolute right-2 top-2">
                                <Icon name="lock-closed" color="rgb(100, 116, 139)" size={20}/>
                              </View>
                            )
                          }
                          <P size={22} weight="bold" className={Class(task.status === 'end' && 'line-through')}>{task.title.cap()}</P>
                          <P size={15} numberOfLines={4} className={Class('mt-2', !task.description && 'italic')}>{task.description ? task.description : 'Ajouter une description'}</P>
                          <View className="flex-row flex-1 justify-between items-end mt-4">
                            <View>
                              <P weight="semibold" size={13} className="text-slate-500">{'Début ' + (task.start as DateTime).toLocaleString(DateTime.TIME_SIMPLE)}</P>
                              <P weight="semibold" size={13} className="text-slate-500">Fin {(task.end as DateTime).toLocaleString(DateTime.TIME_SIMPLE)}</P>
                            </View>
                            {
                              task.contributors && task.contributors.length > 0 && (
                                <View className="flex-row items-center gap-2">
                                  <Pressable className="bg-slate-500 flex-row px-2 h-8 items-center rounded-lg justify-between">
                                    <Icon name="people" color="#fff" size={20}/>
                                    <P weight="semibold" size={15} className="text-white pl-2">{task.contributors.length}</P>
                                  </Pressable>
                                </View>
                              )
                            }
                          </View>
                        </Pressable>
                      </View>
                      {
                        ((index < tasks.length - 1 || index === 0) && tasks.length > 1) && <View className="bg-[#d4d7dd] h-[1.5px] w-full my-4"/>
                      }
                    </Animated.View>
                  )}
        />
      </View>
    </>
  )
};

export default CalendarScreen;
