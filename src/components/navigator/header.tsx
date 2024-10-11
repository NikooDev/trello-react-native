import React from 'react';
import { View } from 'react-native';
import { openBottomSheet } from '@Store/reducers/app.reducer';
import { RootStackUserType } from '@Type/stack';
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { bgHeader } from '@Util/functions';
import { useDispatch } from 'react-redux';
import P from '@Component/ui/text';
import Class from 'classnames';
import Button from '@Component/ui/button';

const Header = (props: BottomTabHeaderProps) => {
	const { route, options } = props;
	const screenName = route.name as keyof RootStackUserType;
	const isHome = screenName === 'Home';
	const isSettings = screenName === 'Profile';
	const isAddTabs = screenName === 'CreateTask' || screenName === 'CreateProject' || screenName === 'Chat';
	const isNotEllipsis = screenName !== 'Profile' && screenName !== 'CreateTask' && screenName !== 'CreateProject' && screenName !== 'Chat';
	const dispatch = useDispatch();

	const handleBottomSheet = () => {
		let height: number = 19;

		switch (screenName) {
			case 'Home':
				height = 25;
				break;
			case 'Projects':
				height = 25;
				break;
			case 'Calendar':
				height = 25;
				break;
			case 'Profile':
				height = 19;
				break;
		}

		dispatch(openBottomSheet({ bottomSheet: { name: screenName, height: height } }));
	}

  return (
    <View className={Class(bgHeader(screenName), 'flex-row h-16 items-center justify-between px-4')}>
      <P size={isHome ? 28 : 24} weight="bold" className={Class(isHome && 'font-title text-primary pt-1', isAddTabs && 'text-white/80')}>
				{ options.title }
			</P>
			<View className="flex-row">
				{
					isNotEllipsis && (
						<Button onPress={handleBottomSheet}
										textSize={0}
										children={null}
										color="none"
										icon="ellipsis-horizontal"
										iconSize={24}
										className="bg-slate-300 h-10 w-10 rounded-full"/>
					)
				}
				{
					isSettings && (
						<Button onPress={handleBottomSheet}
										textSize={0}
										children={null}
										color="none"
										icon="settings"
										iconSize={24}
										className="bg-slate-300 h-10 w-10 rounded-full"/>
					)
				}
			</View>
    </View>
  );
}

export default Header;
