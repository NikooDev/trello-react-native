import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Pressable, View } from 'react-native';
import { theme } from '@Asset/theme/trello';
import { setTmpCoverID, setTmpCoverURI, setUpdateCoverID, setUpdateCoverURI } from '@Store/reducers/project.reducer';
import { closeBottomSheet, openBottomSheet } from '@Store/reducers/app.reducer';
import FastImage from 'react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';
import { searchPhoto } from '@Service/pexels/store';
import { BottomSheetFlatList, BottomSheetFlatListMethods } from '@gorhom/bottom-sheet';
import { Photo } from 'pexels';
import Button from '@Component/ui/button';
import { RootDispatch, RootStateType } from '@Type/store';

/**
 * @description CreateProject -> BottomSheet set cover
 */
const CreateProjectCovers = () => {
	const [cover, setCover] = useState<Photo[] | undefined>(undefined);
	const { width } = Dimensions.get('screen');
	const { data } = useSelector((state: RootStateType) => state.app.bottomSheet);
	const bottomListRef = useRef<BottomSheetFlatListMethods>(null);
	const dispatch = useDispatch<RootDispatch>();
	const bottomSheetData = data as { update: boolean };

	const loadPicture = useCallback(async () => {
		const result = await searchPhoto(50);

		if (result.valid) {
			setCover(result.photos.photos);
		} else {
			Alert.alert('Erreur de chargement', 'Une erreur est survenue lors du chargement des photos.');
		}
	}, [])

	useEffect(() => {
		loadPicture().then();
	}, [loadPicture]);

	const handleRefresh = async () => {
		setCover(undefined);
		await loadPicture();
		bottomListRef.current?.scrollToIndex({index: 0});
	}

	const handleSetCover = (id: number, src: Photo['src']) => {
		if (bottomSheetData && bottomSheetData.update) {
			dispatch(setUpdateCoverID(id));
			dispatch(setUpdateCoverURI(src));

			return dispatch(openBottomSheet({
				bottomSheet: { name: 'Project', height: 100, enablePanDownToClose: false, handleStyle: false }
			}));
		}

		dispatch(setTmpCoverID(id));
		dispatch(setTmpCoverURI(src));
		dispatch(closeBottomSheet());
	}

	return (
		<View className="flex-1 pt-2">
			{
				cover && cover.length > 0 ? (
					<BottomSheetFlatList ref={bottomListRef}
															 extraData={cover}
															 data={cover}
															 contentContainerStyle={{gap: 7, borderRadius: 10, paddingBottom: 90}}
															 columnWrapperStyle={{gap: 7, justifyContent: 'center'}}
															 numColumns={2}
															 keyExtractor={(item, _) => item.id.toString()}
															 renderItem={({ item, index }) => (
																 <Pressable onPress={() => handleSetCover(item.id, item.src)} key={index} style={{width: width / 2, height: (width / 2) * 4 / 3}}>
																	 <FastImage source={{uri: item.src.portrait}} resizeMode="cover" style={{width: width / 2, height: (width / 2) * 4 / 3, borderRadius: 10}}/>
																 </Pressable>
															 )}/>
				) : (
					<ActivityIndicator size="large" color={theme.primary} className="mt-10"/>
				)
			}
			{
				cover && cover.length > 0 && (
					<View className="px-4">
						<Button onPress={handleRefresh} textSize={20} className="absolute bottom-3.5 py-3 border-[7px] border-white w-full self-center items-center" color="primary" textLight>
							Changer de thème
						</Button>
					</View>
				)
			}
		</View>
	)
}

export default CreateProjectCovers;
