/// <reference types="nativewind/types" />
import 'luxon';

interface String {
	cap(): string;
}

declare global {
	interface String {
		cap(): string;
	}
}

declare module 'luxon' {
	interface DateTime {
		toRelativeDate(): string;
	}
}
