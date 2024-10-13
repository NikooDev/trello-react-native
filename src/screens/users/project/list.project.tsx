import React, { useCallback, useEffect, useRef, useState } from 'react';
import P from '@Component/ui/text';
import Class from 'classnames';
import Animated, { FadeInUp, FadeOutUp, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ActivityIndicator, Alert, Dimensions, Pressable, TextInput, View } from 'react-native';
import Button from '@Component/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { RootDispatch, RootStateType } from '@Type/store';
import { addList, setList } from '@Action/list.action';
import { ListInterface, ListProjectInterface } from '@Type/list';
import OutsidePressHandler from 'react-native-outside-press';
import { FlatList } from 'react-native-gesture-handler';

const AnimatedPressage = Animated.createAnimatedComponent(Pressable);

const ListProject: React.FC<ListProjectInterface> = ({ item, index, projectUID }) => {
	const [addListTitle, setAddListTitle] = useState<boolean>(false);
	const [titleList, setTitleList] = useState<string | null>(null);
	const [isUpdateTitle, setIsUpdateTitle] = useState<boolean>(false);
	const { error, loading } = useSelector((state: RootStateType) => state.list);
	const { width } = Dimensions.get('screen');
	const inputAddList = useRef<TextInput>(null);
	const dispatch = useDispatch<RootDispatch>();

	const heightTitleList = useSharedValue(44);

	useEffect(() => {
		heightTitleList.value = withTiming(addListTitle ? 69 : 44, { duration: 150 });
	}, [addListTitle]);

	useEffect(() => {
		if (error) {
			Alert.alert('Erreur', error);
		}
	}, [error]);

	const handleAddList = useCallback(() => {
		setAddListTitle(true);

		setTimeout(() => inputAddList.current!.focus(), 200);
	}, [inputAddList])

	useEffect(() => {
		if (addListTitle) {
			setTitleList(item.title ? item.title : null);
		}
	}, [addListTitle, item]);

	const handleChangeTitle = (value: string) => {
		setIsUpdateTitle(true);
		setTitleList(value);
	}

	const handlePressOutside = () => {
		setIsUpdateTitle(false);
		setAddListTitle(false);
		setTitleList(item.title ? item.title : null);
	}

	const handleSubmitList = () => {
		if (!titleList) {
			return Alert.alert('Erreur', 'Veuillez choisir un titre de liste');
		}

		if (titleList !== item.title) {
			if (item.title && titleList) {
				dispatch(setList({ list: { uid: item.uid, title: titleList.trim() }, projectUID }));
			} else {
				const list = {
					uid: null,
					title: titleList.trim(),
					tasks: [],
					created: new Date()
				} as ListInterface;

				dispatch(addList({ list, projectUID }));
			}
		}

		setIsUpdateTitle(false);
		setAddListTitle(false);
		setTitleList(null);
	}

	const animatedStyle = useAnimatedStyle(() => {
		return {
			height: heightTitleList.value
		};
	});

  return (
		<View className="bg-black/40 self-start rounded-2xl">
			<OutsidePressHandler onOutsidePress={handlePressOutside}>
				<AnimatedPressage onPress={handleAddList} className="relative px-3 pt-3" style={[{width: width - 40}, animatedStyle]}>
					{
						addListTitle ? (
							<Animated.View entering={FadeInUp.duration(150)} exiting={FadeOutUp.duration(150)} key={addListTitle ? '0' : '1'} className="flex-row gap-3 items-center justify-between">
								<TextInput ref={inputAddList}
													 onChangeText={handleChangeTitle}
													 placeholder="Ajouter une liste"
													 className="font-text-semibold px-4 bg-white/20 h-11 text-white/90 flex-1 py-2"
													 cursorColor="#ffffffe6"
													 defaultValue={isUpdateTitle ? titleList : item.title}
													 onSubmitEditing={handleSubmitList}
													 style={{ borderTopRightRadius: 16, borderBottomRightRadius: 8, borderTopLeftRadius: 16, borderBottomLeftRadius: 8 }}/>
								<Button onPress={handleSubmitList} textSize={0} children={null} icon="checkmark-outline" className={Class('h-11 w-12 rounded-l-lg rounded-r-2xl', titleList && (titleList !== item.title) ? 'bg-primary' : 'bg-primary/50')} iconColor="#ffffffe6" iconSize={24}/>
							</Animated.View>
						) : !loading ? (
							<Animated.View entering={FadeInUp.duration(150)} exiting={FadeOutUp.duration(150)}>
								<P size={17} light className={Class('text-center', item.title && 'font-text-bold', addListTitle && 'mb-5')}>{ item.title ? item.title : 'Ajouter une liste' }</P>
							</Animated.View>
						) : (
							<ActivityIndicator size="small" color="#ffffffe6"/>
						)
					}
				</AnimatedPressage>
			</OutsidePressHandler>
			{
				item.title && (
					<View className="py-3">
						{
							item.tasks && item.tasks.length > 0 && (
								<FlatList data={item.tasks} renderItem={({ item, index }) => (
									<Pressable key={index}>
										<P size={15} light>{ item.title }</P>
									</Pressable>
								)}/>
							)
						}
						{
							item.title && (
								<Pressable className="px-4 py-2">
									<P size={13} light>+ Ajouter une tâche</P>
								</Pressable>
							)
						}
					</View>
				)
			}
		</View>
  );
}

export default ListProject;
