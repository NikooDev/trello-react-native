import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootDispatch, RootStateType } from '@Type/store';
import P from '@Component/ui/text';
import Button from '@Component/ui/button';
import { closeBottomSheet, openBottomSheet, setBottomSheetData } from '@Store/reducers/app.reducer';
import { ActivityIndicator, Alert, Dimensions, Pressable, TextInput, View } from 'react-native';
import { shadowHeader, theme } from '@Asset/theme/trello';
import { PriorityEnum, ProjectInterface } from '@Type/project';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import Avatar from '@Component/ui/avatar';
import { getPhoto } from '@Service/pexels/store';
import { resetProject, setTmpMembers, setUpdateCoverID, setUpdateCoverURI } from '@Store/reducers/project.reducer';
import { cap } from '@Util/functions';
import { addProject, removeProject } from '@Action/project.action';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackUserType } from '@Type/stack';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

const ProjectSettings = () => {
  const { project } = useSelector((state: RootStateType) => state.project);
  const [title, setTitle] = useState<string | undefined>(project ? project.title : undefined);
  const [priority, setPriority] = useState<PriorityEnum | undefined>(project ? project.priority : undefined);
  const [cover, setCover] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const { width } = Dimensions.get('screen');
  const { data } = useSelector((state: RootStateType) => state.app.bottomSheet);
  const { user } = useSelector((state: RootStateType) => state.user);
  const { tmpMembers, tmpUpdateCoverID, tmpUpdateCoverURI, error, loading: loadingProject } = useSelector((state: RootStateType) => state.project);
  const dataBottomSheet = data as NativeStackNavigationProp<RootStackUserType, 'Project', undefined>;
  const dispatch = useDispatch<RootDispatch>();

  const priorities = [
    { icon: 'arrow-up-outline', value: PriorityEnum.HIGH, color: 'bg-red-500' },
    { icon: 'pause-outline', value: PriorityEnum.MEDIUM, color: 'bg-yellow-500' },
    { icon: 'arrow-down-outline', value: PriorityEnum.LOW, color: 'bg-green-500' }
  ];

  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error);
    }
  }, [error]);

  const loadPicture = useCallback(async () => {
    if (loading) {
      setLoading(false);
    } else {
      setLoading(true);
    }

    if (tmpUpdateCoverID || project) {
      const result = await getPhoto(tmpUpdateCoverID ? tmpUpdateCoverID : project ? project.cover.coverID : 1);

      if (result.valid) {
        setCover(result.photo.src.landscape);
      } else {
        Alert.alert('Erreur de chargement', 'Une erreur est survenue lors du chargement de la photo.');
      }
    }
  }, [tmpUpdateCoverID, project]);

  useEffect(() => {
    loadPicture().then();
  }, [project]);

  useEffect(() => {
    if (project && project.members.length > 0 && tmpMembers.length === 0) {
      dispatch(setTmpMembers([...project.members]));
    }
  }, [project, dispatch]);

  const handleDisplayCovers = () => {
    dispatch(openBottomSheet({
      bottomSheet: {
        name: 'CreateProjectCovers',
        height: 100,
        data: {
          update: true
        },
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
        data: {
          update: true
        },
        enablePanDownToClose: false
      }
    }));
  }

  const handleReset = () => {
    setTitle(undefined);
    setCover(undefined);
    dispatch(setUpdateCoverURI({}));
    dispatch(setUpdateCoverID(null));
    dispatch(setTmpMembers([]));
    setPriority(undefined);
    dispatch(closeBottomSheet());
  }

  const handleSubmit = async () => {
    if (!user.uid) {
      return Alert.alert('Erreur', 'Votre session a expiré, veuillez vous reconnecter.');
    }

    if (!project) {
      return Alert.alert('Erreur', 'Une erreur est survenue lors de la récupération du projet.');
    }

    if (!project.title || !title) {
      return Alert.alert('Titre manquant', 'Veuillez ajouter le titre de votre projet.');
    }

    let membersUID: string[] = [];

    tmpMembers.map((member) => {
      membersUID.push(member.uid);
    });

    const updateCover = {
      coverID: parseInt(tmpUpdateCoverID as string),
      landscape: tmpUpdateCoverURI.landscape,
      portrait: tmpUpdateCoverURI.portrait
    }

    const updateProject = {
      ...project,
      cover: tmpUpdateCoverID && tmpUpdateCoverURI ? updateCover : project.cover,
      title: title.trim() ?? project.title,
      adminUID: user.uid,
      membersUID: membersUID,
      priority,
      author: `${cap(user.firstname)} ${cap(user.lastname)}`,
      members: tmpMembers
    } as ProjectInterface;

    const result = await dispatch(addProject(updateProject));

    if (addProject.fulfilled.match(result)) {
      dispatch(setBottomSheetData({ bottomSheet: { data: { refresh: true }, height: 0, name: '' } }));
      handleReset();
    }
  }

  const handleClose = () => {
    if (loadingProject) return;

    Alert.alert('Enregistrer les modifications', 'Voulez-vous enregistrer les modifications ?', [
      {
        text: 'Enregistrer',
        onPress: () => handleSubmit()
      },
      {
        text: 'Annuler'
      },
      {
        text: 'Fermer',
        onPress: () => {
          handleReset();
        }
      }
    ])
  }

  const handleProjectRemove = async () => {
    if (!project) {
      return Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression du projet.');
    }

    Alert.alert(`Supprimer le projet ${cap(project.title)}`, 'Voulez-vous vraiment supprimer ce projet ?\n\nToutes les listes et les tâches associées seront également supprimées.', [{
      text: 'Supprimer',
      onPress: () => {
        dispatch(removeProject(project.uid as string));
        dataBottomSheet.navigate('Projects', { screen: 'Projects' });

        handleReset();
        dispatch(resetProject());
      }
    }, {}, {
      text: 'Annuler'
    }]);
  }

  return (!project ? null :
   <>
     <View className="flex-row items-center justify-center py-3 bg-white" style={shadowHeader}>
       <P size={24} weight="semibold" className="flex-1 text-center">{ project.title }</P>
       <Button textSize={0} onPress={handleClose} children={null} color="none" className="pr-4" icon="close" iconSize={34}/>
     </View>
     <BottomSheetScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}>
       <View className="mt-4 px-4">
         <View className="mb-4">
           <P size={18} weight="semibold" className="mb-3">Nom du projet</P>
           <TextInput className="bg-white border border-slate-200 rounded-2xl px-4 font-text-regular text-base text-black/80"
                      placeholder="Nom du projet"
                      placeholderTextColor="#0000005f"
                      cursorColor="#0000008f"
                      defaultValue={title}
                      onChangeText={(value) => setTitle(value)}/>
         </View>
         <View className="mb-4">
           <P size={18} className="mb-3" weight="semibold">Priorité</P>
           <View className="flex-row gap-1.5">
             {priorities.map((p) => (
               <Pressable
                 key={p.value}
                 onPress={() => setPriority(p.value)}
                 className={`${priority === p.value ? p.color : 'bg-white'}
                ${p.value === PriorityEnum.LOW && 'rounded-r-2xl rounded-l-lg'}
                ${p.value === PriorityEnum.MEDIUM && 'rounded-lg'}
                ${p.value === PriorityEnum.HIGH && 'rounded-l-2xl rounded-r-lg'}
                px-4 py-2 flex-1 items-center justify-center border border-slate-200`
                 }>
                 <Icon name={p.icon} size={24} color={priority === p.value ? '#fff' : '#0000009f'} style={{transform: [{ rotate: p.value === PriorityEnum.MEDIUM ? '90deg' : '0deg' }]}}/>
               </Pressable>
             ))}
           </View>
         </View>
         <View className="mb-4">
           <P size={18} className="mb-0.5" weight="semibold">Modifier le fond d'écran</P>
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
           <P size={18} className="mb-3" weight="semibold">Modifier les membres</P>
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
             </View>
           </View>
         </View>
         <View className="mt-8">
           <Button textSize={15} onPress={handleProjectRemove} color="none" textClass="text-center text-red-500" className="py-2 px-4 border-2 border-red-500 mx-auto">Supprimer le projet</Button>
         </View>
       </View>
     </BottomSheetScrollView>
     <View className="mt-auto border-t border-t-slate-200 mb-4">
       <View className="flex-row px-4 mt-4">
         <Button textSize={17} onPress={handleSubmit} color="primary" textClass="text-center" textLight className="flex-1 py-3 px-4 mr-4 justify-center items-center">
           {
             loadingProject ? (
               <View className="flex-row items-center">
                 <ActivityIndicator size={20} color="#fff" className="mr-2"/>
                 <P size={17} light weight="semibold">Chargement...</P>
               </View>
             ) : 'Modifier'
           }
         </Button>
         <Button textSize={17} onPress={handleClose} className="py-3 px-4">Fermer</Button>
       </View>
     </View>
   </>
  );
}

export default ProjectSettings;
