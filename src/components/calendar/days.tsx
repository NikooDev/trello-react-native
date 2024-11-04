import React, { memo, useCallback, useMemo } from 'react';
import { LayoutChangeEvent, Pressable, View } from 'react-native';
import { DayInterface } from '@Type/calendar';
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';
import { currentDateTime } from '@Util/constants';
import { setHeightDays } from '@Store/reducers/calendar.reducer';
import { useDispatch } from 'react-redux';
import P from '@Component/ui/text';
import Class from 'classnames';
import useCalendar from '@Hook/useCalendar';
import { DateTime } from 'luxon';

const Days = memo(() => {
	const { currentMonth, currentYear, selectedDay, direction, days, expand, tasksAll, goToDate } = useCalendar();
	const dispatch = useDispatch();

	const enteringAnimation = direction === 'right' ? SlideInRight.duration(200) : SlideInLeft.duration(200);
	const exitingAnimation = direction === 'right' ? SlideOutLeft.duration(200) : SlideOutRight.duration(200);

	const hasPointDates = useMemo(() => {
		if (!tasksAll || tasksAll.length === 0) return new Set();
		const points = new Set();

		tasksAll.forEach(task => {
			if (!task.start || !task.end) return;

			const taskStart = typeof task.start === 'string'
				? DateTime.fromISO(task.start).setZone('Europe/Paris', { keepLocalTime: true })
				: task.start.setZone('Europe/Paris', { keepLocalTime: true });

			const taskEnd = typeof task.end === 'string'
				? DateTime.fromISO(task.end).setZone('Europe/Paris', { keepLocalTime: true })
				: task.end.setZone('Europe/Paris', { keepLocalTime: true });

			let date = taskStart;
			while (date <= taskEnd) {
				points.add(date.toISODate());
				date = date.plus({ days: 1 });
			}
		});

		return points;
	}, [tasksAll, currentMonth, currentYear]);

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
						const currentDateDay = (currentDateTime.day === date.day && currentDateTime.month === currentMonth && currentDateTime.year === currentYear && currentDateTime.day !== selectedDay);
						const currentSelectedDay = (!date.disabled && selectedDay) === date.day;
						const currentDate = DateTime.fromObject({
							year: currentYear,
							month: currentMonth,
							day: date.day ?? undefined
						}).setZone('Europe/Paris', { keepLocalTime: true });
						const hasPoint = hasPointDates.has(currentDate.toISODate());

						const pressableClass = Class(
							'flex-1 rounded-2xl items-center justify-center h-11 mx-1 my-1',
							currentDateDay && 'bg-slate-200', currentSelectedDay && 'bg-primary'
						);

						const textClass = Class('mb-1.5',
							currentDateDay ? 'text-primary' : 'text-black/80',
							currentSelectedDay && 'text-white'
						);

						return (
							<Pressable key={index} onPress={() => goToDate(date)} className={pressableClass}>
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
	}, [currentMonth, currentYear, selectedDay, tasksAll]);

	const onLayout = (event: LayoutChangeEvent) => {
		dispatch(setHeightDays(event.nativeEvent.layout.height))
	}

	const weeks = useMemo(() => {
		const weekArray: React.ReactElement[] = [];

		const currentDayIndex = selectedDay
			? days.findIndex(date => date.day === selectedDay)
			: days.findIndex(date => date.day === 1);

		if (currentDayIndex !== -1) {
			const startWeekIndex = Math.floor(currentDayIndex / 7) * 7;
			const weekDays = days.slice(startWeekIndex, startWeekIndex + 7);

			/**
			 * @description If the calendar is expanded, the week containing the selected date is displayed
			 */

			if (expand) {
				weekArray.push(renderDay(weekDays.length, weekDays));
			} else {
				for (let i = 0; i < days.length; i += 7) {
					const week = days.slice(i, i + 7);
					weekArray.push(renderDay(i, week));
				}
			}
		}

		return weekArray;
	}, [days, expand, selectedDay, hasPointDates]);

  return (
    <Animated.View entering={enteringAnimation}
									 exiting={exitingAnimation}
									 key={currentMonth}
									 onLayout={onLayout}>
			{
				expand ? (
					<Animated.View key="0" entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
						{ weeks }
					</Animated.View>
				) : (
					<Animated.View key="1" entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
						{ weeks }
					</Animated.View>
				)
			}
    </Animated.View>
  );
})

export default Days;
