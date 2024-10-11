/// <reference types="nativewind/types" />

interface String {
	cap(): string;
}

declare global {
	interface String {
		cap(): string;
	}
}
