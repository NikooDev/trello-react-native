import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, StatusBar, TextInput, View } from 'react-native';
import { DateTime } from 'luxon';
import { resetProject, setLocalProject, setTmp } from '@Store/reducers/project.reducer';
import { RootDispatch, RootStateType } from '@Type/store';
import { ProjectInterface } from '@Type/project';
import { RootStackPropsUser } from '@Type/stack';
import { addProject, removeProject, setProject } from '@Action/project.action';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useDispatch, useSelector } from 'react-redux';
import ScreenLayout from '@Component/layouts/screen.layout';
import useScreen from '@Hook/useScreen';
import P from '@Component/ui/text';
import Priority from '@Component/projects/priority';
import Cover from '@Component/projects/cover';
import Members from '@Component/projects/members';
import Button from '@Component/ui/button';
import useAuth from '@Hook/useAuth';

const UpsertprojectScreen = ({ route, navigation }: RootStackPropsUser<'UpsertProject'>) => {
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const { open } = useSelector((state: RootStateType) => state.app.bottomSheet);
  const { user } = useSelector((state: RootStateType) => state.user);
  const { tmp, project } = useSelector((state: RootStateType) => state.project);
  const { create } = route.params as { create: boolean };
  const { logout } = useAuth();
  const dispatch = useDispatch<RootDispatch>();

  useScreen('light-content');

  useEffect(() => {
    if (!create && project) {
      setTitle(project.title);
      dispatch(setTmp({
        members: project.members,
        coverID: project.cover.coverID,
        coverURI: {
          landscape: project.cover.landscape,
          portrait: project.cover.portrait
        },
        sortPriority: project.priority
      }))
    } else {
      setTitle(undefined);
      dispatch(setTmp({
        members: [],
        coverID: undefined,
        coverURI: undefined,
        sortPriority: undefined
      }));
    }
  }, [create, project, dispatch]);

  useEffect(() => {
    if (open) {
      StatusBar.setBarStyle('dark-content');
    } else {
      StatusBar.setBarStyle('light-content');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!user.uid) {
      return Alert.alert('Erreur', 'Votre session a expiré, veuillez vous reconnecter.', [{
        text: 'Se reconnecter',
        onPress: () => logout()
      }]);
    }

    if (!create && !project) {
      return Alert.alert('Erreur', 'Une erreur est survenue lors de la récupération du projet.');
    }

    if ((project && !project.title) || !title) {
      return Alert.alert('Titre manquant', 'Veuillez ajouter le titre de votre projet.');
    }

    if (create && !tmp.sortPriority) {
      return Alert.alert('Priorité manquante', 'Veuillez ajouter une priorité à votre projet.');
    }

    setLoading(true);

    let membersUID: string[] = [];

    tmp.members.map((member) => {
      membersUID.push(member.uid);
    });

    const isUpdate = (!create && project)

    const upsertProject = {
      title: (isUpdate && project.title) ? title.trim() ?? project.title : title.trim(),
      adminUID: user.uid,
      membersUID: membersUID,
      priority: isUpdate ? tmp.sortPriority ?? project.priority : tmp.sortPriority,
      author: `${user.firstname.cap()} ${user.lastname.cap()}`,
      cover: {
        coverID: isUpdate ? tmp.coverID ?? project.cover.coverID : tmp.coverID,
        landscape: isUpdate ? (tmp.coverURI && tmp.coverURI.landscape) ?? project.cover.landscape : tmp.coverURI.landscape,
        portrait: isUpdate ? (tmp.coverURI && tmp.coverURI.portrait) ?? project.cover.portrait : tmp.coverURI.portrait
      },
      members: tmp.members,
      nbTasks: isUpdate ? project.nbTasks : 0,
      nbTasksEnd: isUpdate ? project.nbTasksEnd : 0,
      created: (isUpdate && project.created) ? project.created : DateTime.now()
    } as ProjectInterface;

    if (create) {
      const result = await dispatch(addProject(upsertProject));

      if (addProject.fulfilled.match(result)) {
        const { uid } = result.payload;

        setTitle(undefined);
        dispatch(setTmp({ coverID: undefined, coverURI: undefined, members: [], sortPriority: undefined }));
        dispatch(setLocalProject(result.payload));

        setLoading(false);
        Keyboard.dismiss();

        navigation.navigate('Menu', { screen: 'Project', params: { uid } });
      }
    } else if (project) {
      if (project.title !== title.trim() || project.priority !== tmp.sortPriority || project.cover.coverID !== tmp.coverID || project.members !== tmp.members) {
        Alert.alert('Modifier le projet', 'Voulez-vous vraiment modifier ce projet ?', [{
          text: 'Annuler',
          onPress: () => {
            setLoading(false);
          }
        }, {}, {
          text: 'Modifier',
          onPress: async () => {
            const result = await dispatch(setProject({
              ...upsertProject,
              uid: project.uid
            }));

            if (setProject.fulfilled.match(result)) {
              if (result.payload && result.payload.uid) {
                setTitle(undefined);
                setLoading(false);

                navigation.navigate('Menu', { screen: 'Project', params: { uid: result.payload.uid } });
              }
            }
          }
        }]);
      } else {
        setLoading(false);
      }
    }
  }

  const handleProjectRemove = () => {
    if (!project) {
      return Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression du projet.');
    }

    Alert.alert(`Supprimer le projet ${project.title.cap()}`, 'Voulez-vous vraiment supprimer ce projet ?\n\nToutes les listes et les tâches associées seront également supprimées.', [{
      text: 'Annuler'
    }, {}, {
      text: 'Supprimer',
      onPress: () => {
        dispatch(removeProject(project.uid));
        navigation.navigate('Projects', { screen: 'Projects' });

        dispatch(resetProject());
      }
    }]);
  }

  const handleCancel = () => {
    if (project) {
      setLoading(false);
      navigation.navigate('Menu', { screen: 'Project', params: { uid: project.uid } });
    }
  }

  return (
   <ScreenLayout>
     <KeyboardAwareScrollView className="mt-4 px-4" keyboardShouldPersistTaps="handled" contentContainerStyle={{justifyContent: 'center'}}>
       <View style={{paddingBottom: 150}}>
         <View className="mb-4">
           <P size={18} weight="semibold" className="mb-3">Nom du projet</P>
           <TextInput className="bg-white border border-slate-200 px-4 font-text-regular text-base text-black/80 rounded-2xl"
                      placeholder="Nom du projet"
                      placeholderTextColor="#cbd5e1"
                      cursorColor="#0000008f"
                      value={title}
                      onChangeText={(value) => setTitle(value)}
           />
         </View>
         <View className="mb-4">
           <P size={18} className="mb-0.5" weight="semibold">Choisissez un fond d'écran</P>
           <P size={13} className="mb-3 text-slate-500">Appuyez sur la photo pour voir plus de fond d'écran.</P>
           <Cover coverID={tmp.coverID} isCreate={create}/>
         </View>
         <View className="mb-4">
           <P size={18} className="mb-0.5" weight="semibold">Priorité</P>
           <P size={13} className="mb-3 text-slate-500">Définissez l'importance de votre projet.</P>
           <Priority sortPriority={tmp.sortPriority}/>
         </View>
         <View className="mb-4">
           <P size={18} className="mb-1" weight="semibold">Ajouter des membres</P>
           <P size={13} numberOfLines={2} className="mb-3 text-slate-500">Les membres ajoutés pourront contribuer aux tâches et échanger dans le chat de ce projet.</P>
           <Members members={tmp.members} isCreate={create}/>
         </View>
         <View className="flex-row justify-between mt-2">
           {
             !create && (
               <Button onPress={handleCancel}
                       textSize={18}
                       textWeight="semibold"
                       textClass="text-center"
                       className="py-2.5 rounded-2xl justify-center flex-1 items-center px-6 mr-2">
                 Annuler
               </Button>
             )
           }
           <Button onPress={handleSubmit}
                   textSize={18}
                   textWeight="semibold"
                   textLight
                   textClass="text-center"
                   className="py-2.5 rounded-2xl ml-auto justify-center flex-1 items-center px-6 bg-primary">
             {
               loading ? (
                 <View className="flex-row items-center">
                   <ActivityIndicator size={20} color="#fff"/>
                 </View>
               ) : create ? 'Créer' : 'Modifier'
             }
           </Button>
         </View>
         {
           !create && (
             <View className="mt-8 self-center">
               <Button textSize={15} onPress={handleProjectRemove} icon="trash" iconSize={24} iconColor="#fff" color="warn" textLight className="py-1.5 px-7">Supprimer le projet</Button>
             </View>
           )
         }
       </View>
     </KeyboardAwareScrollView>
   </ScreenLayout>
  );
}

export default UpsertprojectScreen;
