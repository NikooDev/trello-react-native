import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Keyboard, Pressable } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { CoverInterface } from '@Type/project';
import FastImage from 'react-native-fast-image';
import { openBottomSheet } from '@Store/reducers/app.reducer';
import { theme } from '@Asset/theme/default';
import { setTmp } from '@Store/reducers/project.reducer';
import { useDispatch } from 'react-redux';
import { getPhoto, searchPhoto } from '@Service/pexels/store';
import P from '@Component/ui/text';

const Cover: React.FC<CoverInterface> = ({ coverID, isCreate }) => {
	const [cover, setCover] = useState<string | undefined>(undefined);
	const [loading, setLoading] = useState<boolean>(false);
	const { width } = Dimensions.get('screen');
	const dispatch = useDispatch();

	useEffect(() => {
		return () => {
			setLoading(false);
		}
	}, []);

	const loadPicture = useCallback(async () => {
		const randomResult = Math.floor(Math.random() * 10) + 1;

		if (loading) {
			setLoading(false);
		} else {
			setLoading(true);
		}

		if (coverID) {
			const result = await getPhoto(coverID);

			if (result.valid) {
				setCover(result.photo.src.landscape);
			} else {
				Alert.alert('Erreur de chargement', 'Une erreur est survenue lors du chargement de la photo.');
			}
		} else if (isCreate) {
			const result = await searchPhoto(11);

			if (result.valid) {
				setCover(result.photos.photos[randomResult].src.landscape);
				dispatch(setTmp({
					coverID: result.photos.photos[randomResult].id,
					coverURI: result.photos.photos[randomResult].src
				}));
			} else {
				Alert.alert('Erreur de chargement', 'Une erreur est survenue lors du chargement de la photo.');
			}
		}
	}, [coverID, isCreate, dispatch]);

	useEffect(() => {
		loadPicture().then()
	}, [loadPicture]);

	const handleCovers = () => {
		Keyboard.dismiss();
		dispatch(openBottomSheet({
			enablePanDownToClose: true,
			handleStyle: true,
			name: 'Covers',
			height: 100
		}));
	}

  return (
		<Pressable onPress={handleCovers} className="relative items-center bg-white border border-slate-200 rounded-2xl">
			<FastImage source={{uri: cover}} onLoadEnd={() => setLoading(false)} onError={() => setLoading(false)} resizeMode="cover" className="-z-10 rounded-2xl" style={{height: width / 2, width: width - 32}}/>
			{
				loading && (
					<Animated.View entering={FadeInUp.duration(200)} exiting={FadeOutUp.duration(200)} className="bg-white/70 h-8 w-8 items-center justify-center rounded-full top-5 absolute">
						<ActivityIndicator size="small" color={theme.primary} className="absolute"/>
					</Animated.View>
				)
			}
			<P size={12} weight="semibold" className="text-white/60 absolute bottom-2 left-2">Pexels</P>
		</Pressable>
  );
}

export default Cover;
