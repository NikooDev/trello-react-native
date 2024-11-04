import React, { memo, useEffect } from 'react';
import { ActivityIndicator, View, Pressable } from 'react-native';
import { DateTime } from 'luxon';
import { currentDateTime, months, weeks } from '@Util/constants';
import { theme } from '@Asset/theme/default';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { setCurrentMonth, setCurrentYear, setDirection, setSelectedDay } from '@Store/reducers/calendar.reducer';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import useCalendar from '@Hook/useCalendar';
import Days from '@Component/calendar/days';
import P from '@Component/ui/text';

const Calendar = memo(() => {
	const { loading, currentMonth, currentYear, selectedDay, heightDays, expand, flingVerticalGesture, flingHorizontalGesture, goToMonth } = useCalendar();
	const height = useSharedValue(heightDays);
	const dispatch = useDispatch();

	useEffect(() => {
		if (heightDays) {
			height.value = withTiming(expand ? 52 : heightDays, {
				duration: 250,
				easing: Easing.ease
			});
		}
	}, [heightDays, expand]);

	/**
	 * @description Animated style
	 */
	const animatedStyle = useAnimatedStyle(() => {
		return {
			height: withTiming(height.value ?? 0, {
				duration: 200,
				easing: Easing.elastic(1)
			}),
			overflow: 'hidden'
		};
	});

	const handleDatePicker = () => {
		const currentDate = DateTime.fromObject({
			year: currentYear,
			month: currentMonth,
			day: selectedDay ?? currentDateTime.day
		});

		DateTimePickerAndroid.open({
			mode: 'date',
			value: currentDate.toJSDate(),
			onChange(event, date) {
				if (event.type === 'dismissed') {
					return;
				} else if (date) {
					let selectedDate = new Date(date);

					const newDate = DateTime.fromJSDate(selectedDate).setZone('Europe/Paris', { keepLocalTime: true });

					if (currentDate.toMillis() > newDate.toMillis()) {
						dispatch(setDirection('left'));
					} else {
						dispatch(setDirection('right'));
					}

					dispatch(setCurrentYear(newDate.year));
					dispatch(setCurrentMonth(newDate.month));
					dispatch(setSelectedDay(newDate.day));
				}
			}
		})
	}

  return (
    <View>
			{
				loading ? (
					<ActivityIndicator size="large" color={theme.primary} className="mt-8"/>
				) : (
					<View className="bg-white overflow-hidden">
						<View className="bg-primary flex-row justify-between items-center mb-2 p-2">
							<Pressable onPress={() => goToMonth('prev')} className="h-10 w-10 justify-center items-center">
								<Icon name="caret-back-outline" size={24} color="white"/>
							</Pressable>
							<Pressable onPress={handleDatePicker}>
								<P size={17} weight="bold" light>{ selectedDay } { months[currentMonth - 1] } { currentYear }</P>
							</Pressable>
							<Pressable onPress={() => goToMonth('next')} className="h-10 w-10 justify-center items-center">
								<Icon name="caret-forward-outline" size={24} color="white"/>
							</Pressable>
						</View>
						<View className="pb-3 pt-2">
							<Pressable className="flex-row mx-2">
								{
									weeks.map((week) => (
										<P size={15} weight="bold" key={week} className="flex-1 text-center uppercase">
											{ week }
										</P>
									))
								}
							</Pressable>
						</View>
						<GestureDetector gesture={Gesture.Simultaneous(flingHorizontalGesture, flingVerticalGesture)}>
							<Animated.View style={animatedStyle}>
								<Days/>
							</Animated.View>
						</GestureDetector>
						<View className="h-1 bg-[#d4d7dd] rounded-lg w-10 mx-auto mb-3 mt-2"/>
					</View>
				)
			}
    </View>
  );
})

export default Calendar;
