import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { DateTime } from 'luxon';
import { PriorityEnum } from '@Type/project';
import { currentDateTime, months, weeks } from '@Util/constants';
import { openBottomSheet } from '@Store/reducers/app.reducer';
import { resetProjects } from '@Store/reducers/project.reducer';
import { theme } from '@Asset/theme/default';
import { Directions, Gesture, FlatList, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, FadeIn, FadeInRight, FadeOut, FadeOutRight,
  runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootDispatch, RootStateType } from '@Type/store';
import { RootStackPropsUser } from '@Type/stack';
import { DayInterface } from '@Type/calendar';
import { TaskInterface } from '@Type/task';
import { getCalendarTasks } from '@Action/calendar.action';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getProject } from '@Action/project.action';
import ScreenLayout from '@Component/layouts/screen.layout';
import useScreen from '@Hook/useScreen';
import P from '@Component/ui/text';
import Days from '@Component/calendar/days';
import Button from '@Component/ui/button';
import Class from 'classnames';

const CalendarScreen = ({ navigation }: RootStackPropsUser<'Calendar'>) => {
  const [currentDay, _] = useState<number>(currentDateTime.day);
  const [currentMonth, setCurrentMonth] = useState<number>(currentDateTime.month);
  const [currentYear, setCurrentYear] = useState<number>(currentDateTime.year);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [calendarExpand, setCalendarExpand] = useState<boolean>(true);
  const [gestureStartY, setGestureStartY] = useState<number>(0);
  const [gestureStartX, setGestureStartX] = useState<number>(0);
  const [loadingCalendar, setLoadingCalendar] = useState<boolean>(true);
  const height = useSharedValue(calendarExpand ? 50 : 270);
  const { calendarProject } = useSelector((state: RootStateType) => state.app);
  const { updated } = useSelector((state: RootStateType) => state.task);
  const { user } = useSelector((state: RootStateType) => state.user);
  const { tasks: calendarTasks, loading } = useSelector((state: RootStateType) => state.calendar);
  const dispatch = useDispatch<RootDispatch>();

  useScreen('dark-content');

  useFocusEffect(
    useCallback(() => {
      let timer: ReturnType<typeof setTimeout>;

      if (loadingCalendar) {
        timer = setTimeout(() => {
          setLoadingCalendar(false);
        }, 600);
      } else {
        setLoadingCalendar(false);
      }

      return () => {
        clearTimeout(timer);
        dispatch(resetProjects());
        setLoadingCalendar(true);
      };
    }, [dispatch, loadingCalendar])
  );

  useEffect(() => {
    if (!selectedDay) {
      setSelectedDay(currentDateTime.day);
    }

    if ((selectedDay && calendarProject) || (selectedDay && calendarProject && updated)) {
      const selectedDate = DateTime.fromObject({
        year: currentYear,
        month: currentMonth,
        day: selectedDay
      });

      dispatch(getProject(calendarProject.uid));
      dispatch(getCalendarTasks({
        projectUID: calendarProject.uid,
        userUID: user.uid,
        start: selectedDate.startOf('day').toJSDate(),
        end: selectedDate.endOf('day').toJSDate(),
        isAll: false
      }))
    }
  }, [selectedDay, calendarProject, currentMonth, currentYear, updated, user, dispatch]);

  /**
   * @description Update calendar height
   */
  useEffect(() => {
    height.value = calendarExpand ? 50 : 270;
  }, [calendarExpand]);

  const handleSelectProject = () => {
    dispatch(openBottomSheet({
      name: 'Calendar',
      height: 50,
      handleStyle: false,
      enablePanDownToClose: false,
      data: {
        navigation
      }
    }))
  }

  /**
   * @description Get days in current month
   * @returns {DayInterface[]}
   */
  const getDays = useCallback((): DayInterface[] => {
    const days: DayInterface[] = [];
    const month = currentMonth;
    const year = currentYear;

    if (year > 0 && month >= 1 && month <= 12) {
      const startOfMonth = DateTime.fromObject({year, month});
      const daysInMonth = startOfMonth.endOf('month').day;
      const startDayIndex = (startOfMonth.startOf('month').weekday - 1 + 7) % 7;

      for (let i = 0; i < startDayIndex; i++) {
        days.push({
          day: null,
          disabled: true
        });
      }

      for (let i = 1; i <= daysInMonth; i++) {
        days.push({
          day: i,
          disabled: false
        });
      }

      const totalDays = Math.ceil(days.length / 7) * 7;
      const remainingDays = totalDays - days.length;

      for (let i = 0; i < remainingDays; i++) {
        days.push({
          day: null,
          disabled: true
        });
      }

      return days;
    } else {
      return [];
    }
  }, [currentMonth, currentYear]);

  /**
   * @description Update current month
   * @param direction
   * @returns {void}
   */
  const handleMonth = (direction: 'prev' | 'next'): void => {
    setCalendarExpand(false);
    setCurrentMonth((prevMonth) => {
      let newMonth = direction === 'next' ? prevMonth + 1 : prevMonth - 1;
      let newYear = currentYear;

      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      } else if (newMonth === 0) {
        newMonth = 12;
        newYear -= 1;
      }

      setCurrentYear(newYear);
      return newMonth;
    });
  };

  /**
   * @description Handle gesture X
   * LEFT | RIGHT -> Change month
   * @returns {void}
   */
  const flingHorizontalGesture = Gesture.Fling()
  .direction(Directions.LEFT | Directions.RIGHT)
  .onBegin((event) => {
    runOnJS(setGestureStartY)(event.absoluteY);
    runOnJS(setGestureStartX)(event.absoluteX);
  })
  .onStart((event) => {
    const deltaY = event.absoluteY - gestureStartY;
    const deltaX = event.absoluteX - gestureStartX;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      if (deltaX > 0) {
        runOnJS(handleMonth)('prev');
      } else {
        runOnJS(handleMonth)('next');
      }
    }
  })
  .runOnJS(true);

  /**
   * @description Handle gesture Y
   * UP | DOWN -> Expand calendar
   * @returns {void}
   */
  const flingVerticalGesture = Gesture.Fling()
  .direction(Directions.UP | Directions.DOWN)
  .onBegin((event) => {
    runOnJS(setGestureStartY)(event.absoluteY);
    runOnJS(setGestureStartX)(event.absoluteX);
  })
  .onStart((event) => {
    const deltaY = event.absoluteY - gestureStartY;
    const deltaX = event.absoluteX - gestureStartX;

    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
      if (deltaY > 0) {
        runOnJS(setCalendarExpand)(false);
      } else {
        runOnJS(setCalendarExpand)(true);
      }
    }
  })
  .runOnJS(true);

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

  /**
   * @description Height calendar animated style
   */
  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(height.value, {
        duration: 150,
        easing: Easing.ease
      }),
      overflow: 'hidden'
    };
  }, [calendarExpand]);

  return (
   <ScreenLayout>
     {
       loadingCalendar ? (
         <ActivityIndicator size="large" color={theme.primary} className="mt-8"/>
       ) : (
         <>
           <View className="bg-white pb-2 rounded-b-3xl">
             <View className="bg-primary flex-row justify-between items-center p-2">
               <Pressable onPress={() => handleMonth('prev')} className="h-10 w-10 justify-center items-center">
                 <Icon name="caret-back-outline" size={24} color="white"/>
               </Pressable>
               <Pressable>
                 <P size={17} weight="bold" className="lowercase" light>{selectedDay} {months[currentMonth - 1]} {currentYear}</P>
               </Pressable>
               <Pressable onPress={() => handleMonth('next')} className="h-10 w-10 justify-center items-center">
                 <Icon name="caret-forward-outline" size={24} color="white"/>
               </Pressable>
             </View>
             <View className="pb-3 pt-3">
               <Pressable className="flex-row mx-2">
                 { weeks.map((day) => (
                   <P size={15} weight="bold" key={day} className="flex-1 text-center uppercase">
                     { day }
                   </P>
                 )) }
               </Pressable>
             </View>
             <GestureDetector gesture={Gesture.Simultaneous(flingHorizontalGesture, flingVerticalGesture)}>
               <Animated.View style={animatedStyle}>
                 <Days days={getDays()}
                       user={user}
                       project={calendarProject ? calendarProject : null}
                       selectedDay={selectedDay}
                       currentDay={currentDay}
                       currentMonth={currentMonth}
                       currentYear={currentYear}
                       calendarExpand={calendarExpand}
                       setSelectedDay={setSelectedDay}
                       setCalendarExpand={setCalendarExpand}
                 />
               </Animated.View>
             </GestureDetector>
             <View className="h-1 bg-[#d4d7dd] rounded-lg w-10 mx-auto mb-3 mt-2"/>
             <View className="flex-row items-center mb-1 pb-1 pt-2">
               {
                 calendarProject ? (
                   <Pressable onPress={handleSelectProject} className="relative items-center flex-row px-4 flex-1">
                     <Icon name="chevron-down" color={'rgb(51 65 85)'} size={24}/>
                     <P size={18} weight="semibold" className="ml-2.5 flex-shrink mr-12">{ calendarProject.title.toUpperCase() }</P>
                   </Pressable>
                 ) : (
                   <Button textSize={17} onPress={handleSelectProject} className="bg-white pr-7 flex-1 items-start rounded-b-3xl" iconClass="pl-4" icon="chevron-down" iconSize={24}>
                     Sélectionner un projet
                   </Button>
                 )
               }
               {
                 loading && (
                   <ActivityIndicator size="large" color={theme.primary} className="mr-4 absolute right-0"/>
                 )
               }
             </View>
           </View>
           <View className="h-4 w-full bg-default"/>
           <View className="flex-1 px-1">
             <FlatList data={calendarTasks}
                       extraData={calendarTasks}
                       keyExtractor={(item) => item.uid}
                       ListFooterComponent={() => (
                         calendarProject && calendarTasks.length !== 0 && (
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
                             ((index < calendarTasks.length - 1 || index === 0) && calendarTasks.length > 1) && <View className="bg-[#d4d7dd] h-[1.5px] w-full my-4"/>
                           }
                         </Animated.View>
                       )}
             />
           </View>
           {
             !loading && calendarProject && calendarTasks.length === 0 && (
               <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} className="items-center mt-10">
                 <P size={20} weight="semibold" className="mb-4">Aucune tâche à ce jour</P>
                 <Button onPress={() => navigation.navigate('Menu', { screen: 'Project', params: { uid: calendarProject.uid } })} textSize={20} color="primary" textLight className="py-2 px-4 self-center">Créer une tâche</Button>
               </Animated.View>
             )
           }
         </>
       )
     }
   </ScreenLayout>
  );
}

export default CalendarScreen;
