import React, { memo, useCallback, useEffect } from 'react';
import { DayInterface, DaysInterface } from '@Type/calendar';
import { Pressable, View } from 'react-native';
import { currentDateTime } from '@Util/constants';
import { DateTime } from 'luxon';
import Class from 'classnames';
import P from '@Component/ui/text';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { RootDispatch, RootStateType } from '@Type/store';
import { getCalendarTasks } from '@Action/calendar.action';

/**
 * @description Days
 * @param days
 * @param selectedDay
 * @param currentDay
 * @param currentMonth
 * @param project
 * @param currentYear
 * @param calendarExpand
 * @param setSelectedDay
 * @param scrollViewRef
 * @param setCalendarExpand
 * @param user
 * @constructor
 */
const Days: React.FC<DaysInterface> = memo(({
	days,
	user,
	project,
	selectedDay,
	currentDay,
	currentMonth,
	currentYear,
	calendarExpand,
	setSelectedDay,
	setCalendarExpand
}) => {
	const weeks = [];
	const { tasks } = useSelector((state: RootStateType) => state.task);
	const { tasksAll } = useSelector((state: RootStateType) => state.calendar);
	const dispatch = useDispatch<RootDispatch>();

	useEffect(() => {
		if (project) {
			dispatch(getCalendarTasks({
				projectUID: project.uid,
				userUID: user.uid,
				isAll: true
			}));
		}
	}, [project, tasks, user]);

	const handleSelectDay = useCallback((date: DayInterface) => {
		if (date.disabled || !date.day) return;

		setSelectedDay(date.day);
		setCalendarExpand(true);
	}, [setSelectedDay, setCalendarExpand]);

	/**
	 * @description Render day
	 * @param index
	 * @param week
	 */
	const renderDay = useCallback((index: number, week: DayInterface[]) => {
		return (
			<View key={index} className="flex-row justify-center mx-2">
				{
					week.map((date, index) => {
						const currentDateDay = (currentDay === date.day && currentDateTime.month === currentMonth && currentDateTime.year === currentYear && currentDay !== selectedDay);
						const currentSelectedDay = (!date.disabled && selectedDay) === date.day;

						const hasPoint = tasksAll.some(task => {
							if (task.start === null || task.end === null) return false;

							const taskStartString = typeof task.start === 'string' ? task.start : task.start.toISO();
							const taskEndString = typeof task.end === 'string' ? task.end : task.end.toISO();

							if (!taskStartString || !taskEndString) return false;

							const taskStart = DateTime.fromISO(taskStartString).minus({ days: 1 }).setZone('Europe/Paris', { keepLocalTime: true });
							const taskEnd = DateTime.fromISO(taskEndString).setZone('Europe/Paris', { keepLocalTime: true });

							const currentDate = DateTime.fromObject({
								year: currentYear,
								month: currentMonth,
								day: date.day ?? undefined
							}).setZone('Europe/Paris', { keepLocalTime: true });

							return currentDate >= taskStart && currentDate <= taskEnd;
						});

						const pressableClass = Class(
							'flex-1 rounded-2xl items-center justify-center h-11 mx-1 my-1',
							currentDateDay && 'bg-slate-200', currentSelectedDay && 'bg-primary'
						);

						const textClass = Class('mb-1.5',
							currentDateDay ? 'text-primary' : 'text-black/80',
							currentSelectedDay && 'text-white'
						);

						return (
							<Pressable key={index} onPress={() => handleSelectDay(date)} className={pressableClass}>
								<P size={17} weight={currentDateDay || currentSelectedDay ? 'bold' : 'regular'} className={textClass}>{date.day || ''}</P>
								<View className="flex-row gap-1">
									{!date.disabled && hasPoint && (
										<View key={index}
													className={Class(date.day === selectedDay ? 'bg-white' : 'bg-primary', 'h-1 w-1 rounded-full ')}/>
									)}
								</View>
							</Pressable>
						)
					})
				}
			</View>
		)
	}, [currentDay, currentMonth, currentYear, selectedDay, tasksAll]);

	/**
	 * @description Search for the current day index
	 * If the selected day is not found, the first day of the month is selected
	 * else the week containing the selected date is displayed
	 */
	const currentDayIndex = selectedDay
		? days.findIndex(date => date.day === selectedDay)
		: days.findIndex(date => date.day === 1);

	if (currentDayIndex !== -1) {
		const startWeekIndex = Math.floor(currentDayIndex / 7) * 7;
		const weekDays = days.slice(startWeekIndex, startWeekIndex + 7);

		/**
		 * @description If the calendar is expanded, the week containing the selected date is displayed
		 */

		if (calendarExpand) {
			weeks.push(renderDay(weekDays.length, weekDays));
		} else {
			for (let i = 0; i < days.length; i += 7) {
				const week = days.slice(i, i + 7);
				weeks.push(renderDay(i, week));
			}
		}
	}

	return (
		<Animated.View entering={FadeIn} exiting={FadeOut} key={weeks.length}>
			{ weeks }
		</Animated.View>
	);
})

export default Days;
