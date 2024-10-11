export interface AppStateInterface {
	chatBadge: number;
	bottomSheet: {
		open: boolean;
		enablePanDownToClose?: boolean;
		handleStyle?: boolean;
		height: number;
		name: string | null;
	}
}

export interface AppStateActionsInterface {
	payload: {
		bottomSheet: {
			enablePanDownToClose?: boolean;
			handleStyle?: boolean;
			height: number;
			name: string | null;
		}
	};
}

export type DebouncedFunc<T extends (...args: any[]) => Promise<void>> = (...args: Parameters<T>) => void;
