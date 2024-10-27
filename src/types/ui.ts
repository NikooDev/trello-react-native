import React from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { ClassNameInterface } from '@Type/layout';
import { AnimatedStyle } from 'react-native-reanimated';

export interface ParagraphInterface extends ClassNameInterface {
	size: number;
	weight?: 'light' | 'regular' | 'semibold' | 'bold';
	light?: boolean;
	numberOfLines?: number;
}

export interface Button extends ClassNameInterface {
	color?: 'primary' | 'secondary' | 'tertiary' | 'warn' | 'default' | 'none';
	icon?: string;
	iconSize?: number;
	iconColor?: string;
	iconClass?: string;
	textLight?: boolean;
	textSize: number;
	textClass?: string;
	textWeight?: ParagraphInterface['weight'];
}

export type ButtonInterface = Button & React.ComponentProps<typeof Pressable>;

export interface FloatButtonsInterface {
	handleActionButton: (name: string) => void;
	buttonCreateProject: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
	buttonMessagerie: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
	badgeChat: number;
}

export interface AvatarInterface {
	size: number;
	avatarID: string;
	className?: string;
	style?: StyleProp<ViewStyle>;
}
