import { useEffect, useState } from 'react';
import { getDays } from '@Util/functions';
import { useDispatch, useSelector } from 'react-redux';
import { DayInterface } from '@Type/calendar';
import { RootStateType } from '@Type/store';
import { Directions, Gesture } from 'react-native-gesture-handler';
import { setCurrentMonth, setCurrentYear, setDays, setDirection, setExpand, setSelectedDay } from '@Store/reducers/calendar.reducer';

const useCalendar = () => {
	const [gestureStartY, setGestureStartY] = useState<number>(0);
	const [gestureStartX, setGestureStartX] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const { days, currentMonth, currentYear, selectedDay, direction, expand, heightDays, tasksAll, tasks } = useSelector((state: RootStateType) => state.calendar);
	const dispatch = useDispatch();

	/**
	 * @description Handle gesture X
	 * LEFT | RIGHT -> Change month
	 * @returns {void}
	 */
	const flingHorizontalGesture = Gesture.Fling()
	.direction(Directions.LEFT | Directions.RIGHT)
	.onBegin((event) => {
		setGestureStartY(event.absoluteY);
		setGestureStartX(event.absoluteX);
	})
	.onEnd((event) => {
		const deltaY = event.absoluteY - gestureStartY;
		const deltaX = event.absoluteX - gestureStartX;

		if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
			if (deltaX > 0) {
				dispatch(setDirection('left'));
				goToMonth('prev');
			} else {
				dispatch(setDirection('right'));
				goToMonth('next');
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
		setGestureStartY(event.absoluteY);
		setGestureStartX(event.absoluteX);
	})
	.onEnd((event) => {
		const deltaY = event.absoluteY - gestureStartY;
		const deltaX = event.absoluteX - gestureStartX;

		if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
			if (deltaY > 0) {
				dispatch(setExpand(false));
			} else {
				dispatch(setExpand(true));
			}
		}
	})
	.runOnJS(true);

	/**
	 * @description Update selected day
	 * @returns {void}
	 */
	const goToDate = (date: DayInterface): void => {
		if (date.disabled || !date.day) return;

		dispatch(setExpand(true));
		dispatch(setSelectedDay(date.day));
	};

	/**
	 * @description Update current month
	 * @param direction
	 * @returns {void}
	 */
	const goToMonth = (direction: 'prev' | 'next'): void => {
		const newMonth = direction === 'next' ? currentMonth + 1 : currentMonth - 1;
		let newYear = currentYear;

		if (newMonth > 12) {
			dispatch(setCurrentMonth(1));
			newYear += 1;
			dispatch(setCurrentYear(newYear));
		} else if (newMonth < 1) {
			dispatch(setCurrentMonth(12));
			newYear -= 1;
			dispatch(setCurrentYear(newYear));
		} else {
			dispatch(setCurrentMonth(newMonth));
		}

		dispatch(setDirection(direction === 'next' ? 'right' : 'left'));
		dispatch(setSelectedDay(null));
	};

	/**
	 * @description Update days when month or year changes
	 */
	useEffect(() => {
		const newDays = getDays(currentMonth, currentYear);
		dispatch(setDays(newDays));
		setLoading(false);
	}, [currentMonth, currentYear, dispatch]);

	return {
		currentMonth, currentYear, selectedDay, direction, days, expand, heightDays, tasksAll,
		tasks, loading, flingHorizontalGesture, flingVerticalGesture, goToMonth, goToDate
	}
}

export default useCalendar;
