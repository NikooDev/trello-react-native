import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Pressable, TextInput, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import ScreenLayout from '@Component/layouts/screen.layout';
import P from '@Component/ui/text';
import { getPhoto, searchPhoto } from '@Service/pexels/store';
import { RootStateType } from '@Type/store';
import { setTmpCover } from '@Store/reducers/project.reducer';
import FastImage from 'react-native-fast-image';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { theme } from '@Asset/theme/trello';
import { openBottomSheet } from '@Store/reducers/app.reducer';
import Button from '@Component/ui/button';
import Avatar from '@Component/ui/avatar';

const CreateProject = () => {
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [cover, setCover] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const { width, height } = Dimensions.get('screen');
  const { tmpCover, tmpMembers } = useSelector((state: RootStateType) => state.project);
  const dispatch = useDispatch();

  const loadPicture = useCallback(async () => {
    const randomResult = Math.floor(Math.random() * 10) + 1;
    setLoading(true);

    if (tmpCover) {
      const result = await getPhoto(tmpCover);

      if (result.valid) {
        setCover(result.photo.src.landscape);
      } else {
        Alert.alert('Erreur de chargement', 'Une erreur est survenue lors du chargement de la photo.');
      }
    } else {
      const result = await searchPhoto(11);

      if (result.valid) {
        setCover(result.photos.photos[randomResult].src.landscape);
        dispatch(setTmpCover(result.photos.photos[randomResult].id));
      } else {
        Alert.alert('Erreur de chargement', 'Une erreur est survenue lors du chargement de la photo.');
      }
    }
  }, [tmpCover, dispatch, getPhoto, searchPhoto]);

  useEffect(() => {
    loadPicture().then();
  }, [loadPicture]);

  const handleDisplayCovers = () => {
    dispatch(openBottomSheet({
      bottomSheet: {
        name: 'CreateProjectCovers',
        height: 100,
        enablePanDownToClose: true,
        handleStyle: true
      }
    }));
  }

  const handleAddMembers = () => {
    dispatch(openBottomSheet({
      bottomSheet: {
        name: 'CreateProjectAddMembers',
        height: 100,
        enablePanDownToClose: false
      }
    }));
  }

  const handleSubmit = async () => {

  }

  return (
    <ScreenLayout statusBarStyle="light-content">
      <KeyboardAwareScrollView bottomOffset={70} extraKeyboardSpace={-60} className="mt-4 px-4" keyboardShouldPersistTaps="handled" contentContainerStyle={{justifyContent: 'center'}}>
        <View>
          <View className="mb-4">
            <P size={18} weight="semibold" className="mb-3">Titre du projet</P>
            <TextInput className="bg-white border border-slate-200 rounded-2xl px-4 font-text-regular text-base text-black/80"
                       placeholder="Mon projet"
                       placeholderTextColor="#0000005f"
                       cursorColor="#0000008f"
                       onChangeText={(value) => setTitle(value)}/>
          </View>
          <View className="mb-4">
            <P size={18} className="mb-0.5" weight="semibold">Choisissez un fond d'écran</P>
            <P size={13} className="mb-3 text-slate-500">Cliquez sur la photo pour voir plus de fond d'écran.</P>
            <Pressable onPress={handleDisplayCovers} className="relative items-center bg-white border border-slate-200 rounded-2xl">
              <FastImage source={{uri: cover}} onLoadEnd={() => setLoading(false)} resizeMode="cover" className="-z-10 rounded-2xl" style={{height: width / 2, width: width - 32}}/>
              {
                loading && (
                  <Animated.View entering={FadeInUp.duration(200)} exiting={FadeOutUp.duration(200)} className="bg-white/70 h-8 w-8 items-center justify-center rounded-full top-5 absolute">
                    <ActivityIndicator size="small" color={theme.primary} className="absolute"/>
                  </Animated.View>
                )
              }
              <P size={12} weight="semibold" className="text-white/60 absolute bottom-2 left-2">Pexels</P>
            </Pressable>
          </View>
          <View className="mb-4">
            <P size={18} className="mb-1" weight="semibold">Ajouter des membres</P>
            <P size={13} numberOfLines={2} className="mb-3 text-slate-500">Les membres ajoutés pourront contribuer aux tâches et échanger dans le chat de ce projet.</P>
            <View className="relative">
              <View className="flex-row gap-2">
                <TextInput className="bg-white border border-slate-200 flex-1 pl-4 font-text-regular text-base text-black/80"
                           textContentType="oneTimeCode"
                           placeholder="Adresse email ou nom et prénom"
                           placeholderTextColor="#0000005f"
                           cursorColor="#0000008f"
                           value=""
                           defaultValue=""
                           autoComplete="off"
                           showSoftInputOnFocus={false}
                           style={{
                             borderTopRightRadius: 16,
                             borderBottomLeftRadius: 8,
                             borderTopLeftRadius: 16,
                             borderBottomRightRadius: 8
                           }}
                           onFocus={handleAddMembers}/>
                <Button textSize={0} onPress={handleAddMembers} color="primary" className="self-end rounded-r-2xl rounded-l-lg w-14" style={{height: 51}} iconSize={32} icon="add-circle" children={null} textLight></Button>
              </View>
              <View className="flex-row items-center mt-3 w-full">
                {
                  tmpMembers.length > 0 && tmpMembers.slice(0, 10).map((member, index) => (
                    <Avatar size={36} key={index} avatarID={member.avatarID} className="-mr-3"/>
                  ))
                }
                {
                  tmpMembers.length > 10 && (
                    <P size={15} weight="semibold" className="ml-4" style={{lineHeight: 15}}>+{tmpMembers.length - 10}</P>
                  )
                }
              </View>
            </View>
          </View>
        </View>
        <View className="w-full mt-4">
          <Button onPress={handleSubmit} className="w-full py-3.5" textSize={17} color="primary" textLight textClass="uppercase text-center">Créer</Button>
        </View>
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
}

export default CreateProject;
