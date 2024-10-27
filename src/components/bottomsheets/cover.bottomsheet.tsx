import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Pressable, View } from 'react-native';
import { Photo } from 'pexels';
import { RootDispatch } from '@Type/store';
import { useDispatch } from 'react-redux';
import { BottomSheetFlatList, BottomSheetFlatListMethods } from '@gorhom/bottom-sheet';
import { searchPhoto } from '@Service/pexels/store';
import FastImage from 'react-native-fast-image';
import { setTmp } from '@Store/reducers/project.reducer';
import { closeBottomSheet } from '@Store/reducers/app.reducer';
import { theme } from '@Asset/theme/default';
import Button from '@Component/ui/button';

const CoverBottomsheet = () => {
  const [covers, setCovers] = useState<Photo[] | undefined>(undefined);
  const { width } = Dimensions.get('screen');
  const bottomListRef = useRef<BottomSheetFlatListMethods>(null);
  const dispatch = useDispatch<RootDispatch>();

  const loadPicture = useCallback(async () => {
    const result = await searchPhoto(50);

    if (result.valid) {
      setCovers(result.photos.photos);
    } else {
      Alert.alert('Erreur de chargement', 'Une erreur est survenue lors du chargement des photos.');
    }
  }, [])

  useEffect(() => {
    loadPicture().then();
  }, [loadPicture]);

  const handleRefresh = async () => {
    setCovers(undefined);
    await loadPicture();
    bottomListRef.current?.scrollToIndex({index: 0});
  }

  const handleSetCover = (id: number, src: Photo['src']) => {
    dispatch(setTmp({
      coverID: id,
      coverURI: src
    }));

    dispatch(closeBottomSheet({}));
  }

  return (
    <View className="flex-1 pt-2">
      {
        covers && covers.length > 0 ? (
          <BottomSheetFlatList ref={bottomListRef}
                               extraData={covers}
                               data={covers}
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
        covers && covers.length > 0 && (
          <View className="px-4">
            <Button onPress={handleRefresh} textSize={20} className="absolute bottom-3.5 py-3 border-[7px] border-white w-full self-center items-center" color="primary" textLight>
              Changer de thème
            </Button>
          </View>
        )
      }
    </View>
  );
}

export default CoverBottomsheet;
