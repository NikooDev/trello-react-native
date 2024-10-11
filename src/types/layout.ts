import React from 'react';
import {
	StatusBarStyle,
	StyleProp,
	TextStyle,
	ViewStyle
} from 'react-native';

export interface ChildrenInterface {
	children: React.ReactNode;
}

export interface ClassNameInterface extends ChildrenInterface {
	className?: string | undefined;
	style?: StyleProp<ViewStyle> | StyleProp<TextStyle>;
}

export interface LayoutInterface extends ClassNameInterface {
	statusBarStyle?: StatusBarStyle;
	insetTop?: boolean;
	insetBottom?: boolean;
}

export interface LoaderLayoutInterface extends ChildrenInterface {
	loading: boolean;
}

export enum LoaderEnum {
	WAITFORREADY,
	FADEOUT,
	HIDDEN,
}
