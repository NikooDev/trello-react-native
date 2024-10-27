import { ProjectInterface } from '@Type/project';

export interface AppStateInterface {
	calendarProject: ProjectInterface | null;
	bottomSheet: AppStateBottomSheetInterface;
}

export interface AppStateBottomSheetInterface {
	open: boolean,
	enablePanDownToClose: boolean,
	handleStyle: boolean,
	height: number,
	name: string | null,
	data: Record<string, unknown> | null
}

export type DebouncedFuncInterface<T extends (...args: any[]) => Promise<void>> = (...args: Parameters<T>) => void;
