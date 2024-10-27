import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { openBottomSheet } from '@Store/reducers/app.reducer';
import { setChatProject } from '@Store/reducers/chat.reducer';
import { RootStateType } from '@Type/store';
import { RootStackUserType } from '@Type/stack';
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { bgHeader } from '@Util/functions';
import { useDispatch, useSelector } from 'react-redux';
import P from '@Component/ui/text';
import Class from 'classnames';
import Button from '@Component/ui/button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = (props: BottomTabHeaderProps) => {
	const { route, options } = props;
	const screenName = route.name as keyof RootStackUserType;
	const { create, projectTitle } = route.params as { create: boolean, projectTitle: string };
	const isHome = screenName === 'Home';
	const isSettings = screenName === 'Profile';
	const isChat = screenName === 'Chat';
	const isMenuTabs = screenName === 'UpsertProject' || screenName === 'Chat';
	const isUpsertProject = screenName === 'UpsertProject';
	const isProjects = screenName === 'Projects';
	const { chatProject, loading } = useSelector((state: RootStateType) => state.chat);
	const dispatch = useDispatch();
	const { top } = useSafeAreaInsets();

	const handleBottomSheet = () => {
		let height: number = 19;

		switch (screenName) {
			case 'Home':
				height = 25;
				break;
			case 'Projects':
				height = 18;
				break;
			case 'Profile':
				height = 19;
				break;
		}

		dispatch(openBottomSheet({
			name: screenName,
			height: height,
			enablePanDownToClose: true,
			handleStyle: true
		}));
	}

  return (
    <View className={Class(bgHeader(screenName), 'flex-row items-center justify-between px-4 pb-2')} style={{height: 84, paddingTop: top + 5}}>
			<View className="flex-row items-center">
				{
					isChat && chatProject && (
						<Button onPress={() => dispatch(setChatProject(null))}
										textSize={17}
										color="none"
										children={null}
										iconSize={40}
										textLight
										icon="chevron-back-outline"
										className="-ml-2 mr-1"/>
					)
				}
				<P size={isHome ? 28 : 24} weight="bold" className={Class(isChat && 'w-72', isHome && 'font-title text-primary pt-1', isMenuTabs && 'text-white/80')}>
					{
						(isChat && chatProject) ?
							chatProject.title :
							isUpsertProject ?
								create ?
									'Créer un nouveau projet' :
									`Modifier ${projectTitle.cap()}` :
								options.title
					}
				</P>
			</View>
			<View className="flex-row relative">
				{
					isChat && chatProject && loading && (
						<ActivityIndicator size="large" color="#fff" className="absolute right-0" style={{top: -18}}/>
					)
				}
				{
					isProjects && (
						<Button onPress={handleBottomSheet}
										textSize={0}
										children={null}
										color="none"
										icon="funnel"
										iconSize={20}
										iconClass="mt-0.5"
										iconColor="#334155"
										className="bg-slate-300 h-9 w-9 rounded-full"/>
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
										iconColor="#334155"
										className="bg-slate-300 h-9 w-9 rounded-full"/>
					)
				}
			</View>
    </View>
  );
}

export default Header;
