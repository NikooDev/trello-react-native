import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Pressable, TextInput, View } from 'react-native';
import { setTmpCoverURI, setTmpCoverID, setTmpMembers } from '@Store/reducers/project.reducer';
import { theme } from '@Asset/theme/trello';
import { openBottomSheet } from '@Store/reducers/app.reducer';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { addProject } from '@Action/project.action';
import { getPhoto, searchPhoto } from '@Service/pexels/store';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import ScreenLayout from '@Component/layouts/screen.layout';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { RootDispatch, RootStateType } from '@Type/store';
import { RootStackPropsUser } from '@Type/stack';
import { PriorityEnum, ProjectInterface } from '@Type/project';
import Button from '@Component/ui/button';
import Avatar from '@Component/ui/avatar';
import P from '@Component/ui/text';
import { cap } from '@Util/functions';

const CreateProject = ({ navigation }: RootStackPropsUser<'CreateProject'>) => {
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [cover, setCover] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<PriorityEnum | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const { width } = Dimensions.get('screen');
  const { user } = useSelector((state: RootStateType) => state.user);
  const { tmpCoverID, tmpCoverURI, tmpMembers, error } = useSelector((state: RootStateType) => state.project);
  const scrollRef = useRef<ScrollView>(null);
  const dispatch = useDispatch<RootDispatch>();

  const priorities = [
    { icon: 'arrow-up-outline', value: PriorityEnum.HIGH, color: 'bg-red-500' },
    { icon: 'pause-outline', value: PriorityEnum.MEDIUM, color: 'bg-yellow-500' },
    { icon: 'arrow-down-outline', value: PriorityEnum.LOW, color: 'bg-green-500' }
  ];

  useEffect(() => {
    if (scrollRef.current && (title && cover && priority)) {
      scrollRef.current.scrollToEnd();
    }
  }, [scrollRef, title, cover, priority]);

  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error);
    }
  }, [error]);

  const loadPicture = useCallback(async () => {
    const randomResult = Math.floor(Math.random() * 10) + 1;

    if (loading) {
      setLoading(false);
    } else {
      setLoading(true);
    }

    if (tmpCoverID) {
      const result = await getPhoto(tmpCoverID);

      if (result.valid) {
        setCover(result.photo.src.landscape);
      } else {
        Alert.alert('Erreur de chargement', 'Une erreur est survenue lors du chargement de la photo.');
      }
    } else {
      const result = await searchPhoto(11);

      if (result.valid) {
        setCover(result.photos.photos[randomResult].src.landscape);
        dispatch(setTmpCoverID(result.photos.photos[randomResult].id));
        dispatch(setTmpCoverURI(result.photos.photos[randomResult].src));
      } else {
        Alert.alert('Erreur de chargement', 'Une erreur est survenue lors du chargement de la photo.');
      }
    }
  }, [tmpCoverID, dispatch, getPhoto, searchPhoto]);

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
    if (!user.uid) {
      return Alert.alert('Erreur', 'Votre session a expiré, veuillez vous reconnecter.');
    }

    if (!title) {
      return Alert.alert('Titre manquant', 'Veuillez ajouter le titre de votre projet.');
    }

    if (!priority) {
      return Alert.alert('Priorité manquante', 'Veuillez ajouter une priorité à votre projet.');
    }

    let membersUID: string[] = [];

    tmpMembers.map((member) => {
      membersUID.push(member.uid);
    });

    const project = {
      uid: '',
      title: title.trim(),
      adminUID: user.uid,
      membersUID: membersUID,
      priority,
      author: `${cap(user.firstname)} ${cap(user.lastname)}`,
      cover: {
        landscape: tmpCoverURI.landscape,
        portrait: tmpCoverURI.portrait
      },
      members: tmpMembers,
      nbTasks: 0,
      nbTasksEnd: 0,
      created: new Date()
    } as ProjectInterface;

    const result = await dispatch(addProject(project));

    if (addProject.fulfilled.match(result)) {
      const { uid } = result.payload;

      setTitle(undefined);
      setCover(undefined);
      dispatch(setTmpCoverURI({ landscape: '', portrait: '' }));
      dispatch(setTmpCoverID(null));
      dispatch(setTmpMembers([]));
      setPriority(undefined);

      navigation.navigate('Menu', { screen: 'Project', params: { uid } });
    }
  }

  return (
    <ScreenLayout statusBarStyle="light-content">
      <KeyboardAwareScrollView bottomOffset={70} extraKeyboardSpace={-60} className="mt-4 px-4" keyboardShouldPersistTaps="handled" contentContainerStyle={{justifyContent: 'center'}}>
        <ScrollView ref={scrollRef} contentContainerStyle={{flex: 1, paddingBottom: 125}}>
          <View className="mb-4">
            <P size={18} weight="semibold" className="mb-3">Nom du projet</P>
            <TextInput className="bg-white border border-slate-200 rounded-2xl px-4 font-text-regular text-base text-black/80"
                       placeholder="Nom du projet"
                       placeholderTextColor="#0000005f"
                       cursorColor="#0000008f"
                       value={title}
                       onChangeText={(value) => setTitle(value)}/>
          </View>
          <View className="mb-4">
            <P size={18} className="mb-3" weight="semibold">Priorité</P>
            <View className="flex-row gap-1.5">
              {priorities.map((p) => (
                <Pressable
                  key={p.value}
                  onPress={() => setPriority(p.value)}
                  className={`${priority === p.value ? p.color : 'bg-slate-300'}
                  ${p.value === PriorityEnum.LOW && 'rounded-r-2xl rounded-l-lg'}
                  ${p.value === PriorityEnum.MEDIUM && 'rounded-lg'}
                  ${p.value === PriorityEnum.HIGH && 'rounded-l-2xl rounded-r-lg'}
                  px-4 py-2 flex-1 items-center justify-center`
                }>
                  <Icon name={p.icon} size={24} color={priority === p.value ? '#fff' : '#0000009f'} style={{transform: [{ rotate: p.value === PriorityEnum.MEDIUM ? '90deg' : '0deg' }]}}/>
                </Pressable>
              ))}
            </View>
          </View>
          <View className="mb-4">
            <P size={18} className="mb-0.5" weight="semibold">Choisissez un fond d'écran</P>
            <P size={13} className="mb-3 text-slate-500">Cliquez sur la photo pour voir plus de fond d'écran.</P>
            <Pressable onPress={handleDisplayCovers} className="relative items-center bg-white border border-slate-200 rounded-2xl">
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
              <View className="flex-row items-center w-full mt-3">
                {
                  tmpMembers.length > 0 && tmpMembers.slice(0, 6).map((member, index) => (
                    <Avatar size={36} key={index} avatarID={member.avatarID} className="-mr-3"/>
                  ))
                }
                {
                  tmpMembers.length > 6 && (
                    <P size={15} weight="semibold" className="ml-4" style={{lineHeight: 15}}>+{tmpMembers.length - 6}</P>
                  )
                }
                <View className="mt-1 flex-1" style={{ flex: tmpMembers.length > 0 ? 0 : 1, marginLeft: tmpMembers.length ? 20 : 0 }}>
                  <Button onPress={handleSubmit} className="py-3.5 w-full" textSize={17} color="primary" textLight textClass="uppercase text-center">Créer</Button>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
}

export default CreateProject;
