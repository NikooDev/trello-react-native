import React, { useCallback } from 'react';
import { StatusBar, View } from 'react-native';
import { RootStackUserType } from '@Type/stack';
import { LayoutInterface } from '@Type/layout';
import { shadow } from '@Asset/theme/default';
import { bgHeader } from '@Util/functions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { twMerge } from 'tailwind-merge';
import Class from 'classnames';

/**
 * @description Screen Layout with shadow header
 * @param children
 * @param statusBarStyle
 * @param style
 * @param className
 * @param insetBottom
 * @param insetTop
 * @constructor
 */
const ScreenLayout: React.FC<LayoutInterface> = ({
	children,
	style,
	className,
	insetBottom,
	insetTop
}) => {
	const insets = useSafeAreaInsets();
	const pt = insetTop && {paddingTop: insets.top};
	const pb = insetBottom && {paddingBottom: 0};
	const route = useRoute();

	return (
		<View className={twMerge('flex-1', className)} style={[style, pt, pb]}>
			<View className={Class(bgHeader(route.name as keyof RootStackUserType), 'w-full top-0 h-0.5 absolute -z-10')} style={shadow(5)}/>
			{ children }
		</View>
	);
}

export default ScreenLayout;
