import { RootStackUserType } from '@Type/stack';
import { DebouncedFunc } from '@Type/app';
import { DateTime } from 'luxon';

String.prototype.cap = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

export const cap = (str: string | null) => {
	if (str === null || str.length === 0) return '';

	return str.replace(str[0], str[0].toUpperCase())
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

export const bgHeader = (screenName: keyof RootStackUserType): string => {
	switch (screenName) {
		case 'CreateProject':
			return 'bg-sky-500';
		case 'Chat':
			return 'bg-primary';
		default:
			return 'bg-white';
	}
}

export const debounce = <T extends (...args: any[]) => Promise<void>>(func: T, delay: number): DebouncedFunc<T> => {
	let timer: NodeJS.Timeout;

	return function(this: any, ...args: Parameters<T>) {
		const context = this;

		clearTimeout(timer);

		timer = setTimeout(async () => {
			await func.apply(context, args);
		}, delay);
	};
}

export const formatRelativeDate = (date: DateTime): string => {
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
