import { AppStateBottomSheetInterface, AppStateInterface, DebouncedFuncInterface } from '@Type/app';
import { PayloadAction } from '@reduxjs/toolkit';
import { RootStackUserType } from '@Type/stack';
import { DateTime } from 'luxon';
import { DayInterface } from '@Type/calendar';
import { PriorityEnum } from '@Type/project';

DateTime.prototype.toRelativeDate = function (): string {
	return toRelativeDate(this);
};

String.prototype.cap = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

export const cap = (str: string | null) => {
	if (str === null || str.length === 0) return '';

	return str.replace(str[0], str[0].toUpperCase())
}

export const getDays = (currentMonth: number, currentYear: number) => {
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
}

export const toggleBottomSheet = (isOpen: boolean) => (
	state: AppStateInterface,
	action: PayloadAction<Partial<AppStateBottomSheetInterface>>
) => {
	state.bottomSheet = {
		...state.bottomSheet,
		...action.payload,
		open: isOpen
	};
};

export const bgHeader = (screenName: keyof RootStackUserType): string => {
	switch (screenName) {
		case 'UpsertProject':
			return 'bg-sky-500';
		case 'Chat':
			return 'bg-primary';
		default:
			return 'bg-white';
	}
}

export const random = (length = 10) => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters[randomIndex];
	}

	return result;
}

export const debounce = <T extends (...args: any[]) => Promise<void>>(func: T, delay: number): DebouncedFuncInterface<T> => {
	let timer: NodeJS.Timeout;

	return function(this: any, ...args: Parameters<T>) {
		const context = this;

		clearTimeout(timer);

		timer = setTimeout(async () => {
			await func.apply(context, args);
		}, delay);
	};
}

export const toRelativeDate = (date: DateTime): string => {
	const diff = date.diffNow(['years', 'months', 'days', 'hours', 'minutes', 'seconds']).toObject();

	const formatUnit = (value: number | undefined, singular: string, plural: string) => {
		if (value === undefined) return '';
		return Math.abs(value) === 1 ? singular : plural;
	};

	if (diff.years && Math.abs(diff.years) > 0) {
		const unit = formatUnit(diff.years, 'an', 'ans');
		return diff.years > 0 ? `Dans ${Math.round(diff.years)} ${unit}` : `Il y a ${Math.round(Math.abs(diff.years))} ${unit}`;
	} else if (diff.months && Math.abs(diff.months) > 0) {
		const unit = formatUnit(diff.months, 'mois', 'mois');
		return diff.months > 0 ? `Dans ${Math.round(diff.months)} ${unit}` : `Il y a ${Math.round(Math.abs(diff.months))} ${unit}`;
	} else if (diff.days && Math.abs(diff.days) > 7) {
		const weeks = Math.round(Math.abs(diff.days) / 7);
		const unit = formatUnit(weeks, 'semaine', 'semaines');
		return diff.days > 0 ? `Dans ${weeks} ${unit}` : `Il y a ${weeks} ${unit}`;
	} else if (diff.days && Math.abs(diff.days) > 0) {
		const unit = formatUnit(diff.days, 'jour', 'jours');
		return diff.days > 0 ? `Dans ${Math.round(diff.days)} ${unit}` : `Il y a ${Math.round(Math.abs(diff.days))} ${unit}`;
	} else if (diff.hours && Math.abs(diff.hours) > 0) {
		const unit = formatUnit(diff.hours, 'heure', 'heures');
		return diff.hours > 0 ? `Dans ${Math.round(diff.hours)} ${unit}` : `Il y a ${Math.round(Math.abs(diff.hours))} ${unit}`;
	} else if (diff.minutes && Math.abs(diff.minutes) > 0) {
		const unit = formatUnit(diff.minutes, 'minute', 'minutes');
		return diff.minutes > 0 ? `Dans ${Math.round(diff.minutes)} ${unit}` : `Il y a ${Math.round(Math.abs(diff.minutes))} ${unit}`;
	} else {
		return 'À l’instant';
	}
}

export const arrayEqual = <T, L>(arr1: T, arr2: L) => {
	if (!arr1 || !arr2) return false;

	return JSON.stringify(arr1) === JSON.stringify(arr2);
};

export const handlePriority = (priority: PriorityEnum): string => {
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
