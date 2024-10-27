import React, { useState } from 'react';
import { Dimensions, View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { shadow } from '@Asset/theme/default';
import Animated, { Easing, FadeIn, FadeInDown, FadeOut, FadeOutDown, ZoomIn, withTiming, ZoomOut } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStateType } from '@Type/store';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useDispatch, useSelector } from 'react-redux';
import useBottomBar from '@Hook/useBottomBar';
import OutsidePressHandler from 'react-native-outside-press';
import FloatButtons from '@Component/navigator/floatButtons';
import BottomMenu from '@Component/navigator/bottomMenu';
import P from '@Component/ui/text';
import Class from 'classnames';
import { closeBottomSheet } from '@Store/reducers/app.reducer';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

/**
 * @description Custom bottom tab bar
 * @param props
 * @constructor
 */
const Tabs = (props: BottomTabBarProps) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [pressIndex, setPressIndex] = useState<number | null>(null);
	const { width } = Dimensions.get('screen');
	const originalWidth = 450;
	const originalHeight = 153;
	const aspectRatio = originalWidth / originalHeight;
	const { state, navigation } = props;
	const { overlayOpacity, overlayStyle, buttonCreateProject, buttonMessagerie, displayIcon } = useBottomBar(menuOpen);
	const { open } = useSelector((state: RootStateType) => state.app.bottomSheet);
	const { user } = useSelector((state: RootStateType) => state.user);
	const dispatch = useDispatch();

	const handlePressIn = (index: number, isFocused: boolean) => {
		if (!isFocused) {
			setPressIndex(index);
			overlayOpacity.value = withTiming(1, { duration: 200 });
		}
	}

	const handlePressOut = (routeName: string, screenName: string, routeKey: string, isFocused: boolean) => {
		let timer: ReturnType<typeof setTimeout>;

		const event = navigation.emit({
			type: 'tabPress',
			target: routeKey,
			canPreventDefault: true
		});

		overlayOpacity.value = withTiming(0, { duration: 200, easing: Easing.linear });
		timer = setTimeout(() => setPressIndex(null), 300);

		if (routeName === 'Menu') {
			setMenuOpen((prevState) => !prevState);
		} else {
			setMenuOpen(false);
		}

		if (open) {
			dispatch(closeBottomSheet({}));
		}

		if (!isFocused && !event.defaultPrevented) {
			clearTimeout(timer);

			if (routeName !== 'Menu') {
				navigation.navigate(routeName, { screen: screenName });
			}
		}
	}

	const handleActionButton = (name: string) => {
		setMenuOpen(false);
		const params = { params: name === 'UpsertProject' ? { create: true } : undefined };

		navigation.navigate('Menu', { screen: name, ...params });
	}

	const handleOutside = () => {
		setMenuOpen(false);
	}

	const offsetButton = (index: number) => {
		let marginLeft: number = 0;

		switch (index) {
			case 1:
			case 4:
				marginLeft = -16;
				break;
		}

		return marginLeft;
	}

  return (
		<OutsidePressHandler onOutsidePress={handleOutside} className="z-10 items-center absolute bottom-0">
			<View pointerEvents="box-none" style={{width, aspectRatio}}>
				<BottomMenu/>
			</View>
			<View className="absolute items-center">
				<FloatButtons handleActionButton={handleActionButton}
											buttonCreateProject={buttonCreateProject}
											buttonMessagerie={buttonMessagerie} badgeChat={user.badgeChat}/>
			</View>
			<View className="flex-row justify-around absolute top-1/2 w-full">
				{
					state.routes.map((route, index) => {
						const { icon, title } = displayIcon(route);
						const { screen } = route.params as { screen: string };
						const isFocused = state.index === index;
						const offset = offsetButton(index);
						const offsetAddButton = index === 2 && '-mt-[24.3px]';
						const buttonClass = 'flex-1 items-center justify-center flex-col rounded-full h-16 bottom-5 relative';

						return (
							<Pressable key={index}
												 onPressIn={() => handlePressIn(index, isFocused)}
												 onPressOut={() => handlePressOut(route.name, screen, route.key, isFocused)}
												 className={Class(buttonClass, offsetAddButton)}
												 style={{marginLeft: offset}}>
								<View className={Class('items-center', index !== 2 && 'py-3 h-16 w-16')}>
									{
										pressIndex === index && index !== 2 && (
											<Animated.View className="rounded-2xl overflow-hidden" style={[StyleSheet.absoluteFillObject, {flex: 1}, overlayStyle]}>
												<LinearGradient colors={['#cbd5e1', '#fff']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[StyleSheet.absoluteFillObject, {flex: 1}]}/>
											</Animated.View>
										)
									}
									<View className={Class(index === 2 && 'bg-primary rounded-full items-center justify-center h-16 w-16')}>
										<Animated.View entering={FadeIn.duration(150)}
																	 exiting={FadeOut.duration(150)}
																	 key={isFocused ? icon : icon + '-outline'}>
											<AnimatedIcon name={isFocused ? icon : icon + '-outline'}
																		className={Class(index === 2 ? 'text-white' : 'text-slate-700', isFocused && 'text-primary', index === 2 && 'text-white')}
																		size={index === 2 ? 43 : 24}/>
										</Animated.View>
									</View>
									{
										index !== 2 && (
											<P size={10}
												 weight="semibold"
												 className={Class('text-slate-700', isFocused && 'text-primary')}>
												{ title }
											</P>
										)
									}
									{
										isFocused && index !== 2 && (
											<Animated.View entering={FadeInDown.duration(200)}
																		 exiting={FadeOutDown.duration(200)}
																		 className="bg-primary h-1 w-4 rounded-full flex absolute bottom-0"/>
										)
									}
								</View>
								{
									index === 2 && user.badgeChat > 0 && (
										<Animated.View entering={ZoomIn.duration(150)} exiting={ZoomOut.duration(150)} key={user.badgeChat > 0 ? '1' : '0'} className="bg-red-500 border-2 border-white py-0.5 pb-1 absolute -top-0.5 rounded-full"
													style={{...shadow(10), left: 60, paddingHorizontal: 7}}>
											<P size={12} light weight="bold">{ user.badgeChat }</P>
										</Animated.View>
									)
								}
							</Pressable>
						)
					})
				}
			</View>
		</OutsidePressHandler>
  );
}

export default Tabs;
