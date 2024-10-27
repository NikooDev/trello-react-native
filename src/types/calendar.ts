import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';

export interface DayInterface {
	day: number | null;
	disabled: boolean
}

export interface DaysInterface {
	days: DayInterface[];
	selectedDay: number | null;
	setSelectedDay: React.Dispatch<number | null>;
	currentDay: number;
	currentMonth: number;
	currentYear: number;
	calendarExpand: boolean;
	setCalendarExpand: React.Dispatch<boolean>;
	scrollViewRef: React.RefObject<ScrollView>;
}
