import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, TextInput, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootDispatch, RootStateType } from '@Type/store';
import P from '@Component/ui/text';
import { theme } from '@Asset/theme/default';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Button from '@Component/ui/button';
import Class from 'classnames';
import Avatar from '@Component/ui/avatar';
import Icon from 'react-native-vector-icons/Ionicons';
import { MemberRoleEnum, MembersInterface, PriorityEnum } from '@Type/project';
import Animated, { FadeInLeft, FadeOutLeft, FadeOutRight } from 'react-native-reanimated';
import { closeBottomSheet, openBottomSheet } from '@Store/reducers/app.reducer';
import Priority from '@Component/projects/priority';
import { setTmp } from '@Store/reducers/project.reducer';
import { Switch } from 'react-native-gesture-handler';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { DateTime } from 'luxon';
import { setProject } from '@Action/project.action';
import { getTasks, removeTask, setTask } from '@Action/task.action';
import { setLocalTask } from '@Store/reducers/task.reducer';

const TaskBottomsheet = () => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<'active' | 'end' | 'soon' | null>(null);
  const [contributors, setContributors] = useState<MembersInterface[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [switchStates, setSwitchStates] = useState<boolean[]>([]);
  const [dateStart, setDateStart] = useState<DateTime | null>(null);
  const [dateEnd, setDateEnd] = useState<DateTime | null>(null);
  const { task, loading } = useSelector((state: RootStateType) => state.task);
  const { user } = useSelector((state: RootStateType) => state.user);
  const { project, tmp } = useSelector((state: RootStateType) => state.project);
  const { open, data } = useSelector((state: RootStateType) => state.app.bottomSheet);
  const { listUID } = data as { listUID: string };
  const dispatch = useDispatch<RootDispatch>();

  const isAdmin = (user.uid === (task && task.userUID) || project!.members.some(member => member.uid === user.uid && member.role === MemberRoleEnum.ADMIN));

  useEffect(() => {
    if (!open) {
      setEditMode(false);
    }
  }, [open]);

  useEffect(() => {
    if (project && project.members.length > 0) {
      const updatedSwitchStates = project.members.map(member =>
        contributors.some(contributor => contributor.uid === member.uid)
      );

      setSwitchStates(updatedSwitchStates);
    }
  }, [project, contributors]);

  useEffect(() => {
    if (editMode && task && project) {
      dispatch(setTmp({ sortPriority: task.priority }));
      setTitle(task.title);
      setDateStart(task.start);
      setDateEnd(task.end);
      setStatus(task.status);
      setContributors((task.contributors && task.contributors.length > 0) ? task.contributors : [])
      setDescription(task.description ? task.description : '');
    }
  }, [editMode, task, project]);

  const handleEditTask = () => {
    setEditMode(true);

    setTimeout(() => {
      dispatch(openBottomSheet({ height: 79 }));
    }, 300)
  }

  const handleBackTask = () => {
    setEditMode(false);

    dispatch(openBottomSheet({ height: 60 }));
  }

  const handleStatusTask = (newStatus: 'active' | 'end' | 'soon') => {
    dispatch(setLocalTask({
      ...task,
      contributors: contributors ?? (task && task.contributors),
      status: newStatus
    }))
    setStatus(newStatus);
  }

  const toggleSwitch = (index: number) => {
    if (!isAdmin) return;

    const updatedStates = [...switchStates];
    updatedStates[index] = !updatedStates[index];
    setSwitchStates(updatedStates);

    const selectedContributors = project && project.members.filter((_, index) => updatedStates[index]);
    if (selectedContributors) {
      setContributors(selectedContributors);
    }
    setSelectAll(false);
  }

  const handleSelectAll = () => {
    const newSelectAllState = !selectAll;
    setSelectAll(newSelectAllState);
    const updatedStates = project!.members.map(() => newSelectAllState);
    setSwitchStates(updatedStates);

    const selectedContributors = newSelectAllState ? project!.members : [];
    setContributors(selectedContributors);
  }

  const handleSelectDate = (target: 'start' | 'end') => {
    const isStart = target === 'start';
    const isDateStart = dateStart;
    const isDateEnd = dateEnd;

    DateTimePickerAndroid.open({
      mode: 'date',
      value: isStart ? (isDateStart && isDateStart.toJSDate()) ?? new Date() : (isDateEnd && isDateEnd.toJSDate()) ?? new Date(),
      onChange: (_, date) => {
        if (date) {
          let selectedDate = new Date(date);

          DateTimePickerAndroid.open({
            value: isStart ? (isDateStart && isDateStart.toJSDate()) ?? selectedDate : (isDateEnd && isDateEnd.toJSDate()) ?? selectedDate,
            mode: 'time',
            onChange: (_, time) => {
              if (time) {
                let selectedTime = new Date(time);

                selectedDate.setHours(selectedTime.getHours());
                selectedDate.setMinutes(selectedTime.getMinutes());

                isStart && setDateStart(DateTime.fromJSDate(selectedDate));
                !isStart && setDateEnd(DateTime.fromJSDate(selectedDate));
              }
            }
          });
        }
      }
    })
  }

  const handleSubmit = async () => {
    if (loading) return;

    if (!project || !task) {
      return Alert.alert('Erreur', 'Une erreur est survenue lors de la modification de la tâche.');
    }

    if (task.status !== 'end' && status === 'end') {
      dispatch(setProject({ uid: project.uid, nbTasksEnd: project.nbTasksEnd + 1 }));
    } else if (task.status === 'end' && status !== 'end' && project.nbTasksEnd > 0) {
      dispatch(setProject({ uid: project.uid, nbTasksEnd: project.nbTasksEnd - 1 }));
    }

    const updateTask = {
      ...task,
      uid: task.uid,
      title: (title && title.trim()) ?? task.title,
      description: (description && description.trim()) ?? task.description,
      start: dateStart ?? task.start,
      end: dateEnd ?? task.end,
      priority: tmp.sortPriority,
      status: status ?? task.status,
      contributors: contributors.length > 0 ? contributors : task.contributors
    }

    const updatedTask = await dispatch(setTask({
      task: {
        ...updateTask
      },
      projectUID: project.uid,
      listUID
    }));

    if (updatedTask.meta.requestStatus === 'fulfilled') {
      dispatch(getTasks({ projectUID: project.uid, listUID: listUID }));
      dispatch(setLocalTask(updateTask));
      dispatch(closeBottomSheet({}));
    } else {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la modification de la tâche.');
    }
  }

  const handleTaskRemove = () => {
    if (loading) return;

    if (!project || !task) {
      return Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression de la tâche.');
    }

    Alert.alert('Supprimer la tâche', 'Voulez-vous vraiment supprimer cette tâche ?', [{
      text: 'Annuler'
    }, {
      text: 'Supprimer',
      onPress: () => {
        dispatch(setProject({ uid: project.uid, nbTasks: project.nbTasks - 1 }));

        if (task.status === 'end') {
          dispatch(setProject({ uid: project.uid, nbTasksEnd: project.nbTasksEnd - 1 }));
        }

        dispatch(removeTask({ taskUID: task.uid, listUID, projectUID: project.uid }));
        dispatch(closeBottomSheet({}));
      }
    }]);
  }

  return (
   <View className="flex-1">
     {
       !task ? (
         <ActivityIndicator size="large" color={theme.primary} className="mt-10"/>
       ) : (
         !editMode ? (
           <Animated.View key={task.uid} entering={FadeInLeft} exiting={FadeOutLeft} className="bg-white px-4 flex-grow">
             <View className="flex-row items-center justify-between mb-2">
               <P size={25} numberOfLines={2} className="w-64">{ task.title }</P>
               <View className="flex-row gap-2 self-start">
                 {
                   task.priority === PriorityEnum.HIGH && (
                     <Button textSize={0} icon="arrow-up-outline" className="bg-red-500 h-10 w-10 rounded-full" textLight iconSize={20} children={null}/>
                   )
                 }
                 {
                   task.priority === PriorityEnum.MEDIUM && (
                     <Button textSize={20} icon="pause-outline" className="bg-orange-500 h-10 w-10 items-center justify-center rounded-full" textLight>
                       <View style={{ transform: [{ rotate: '90deg' }] }}>
                         <Icon name="pause-outline" size={20} color="#fff"/>
                       </View>
                     </Button>
                   )
                 }
                 {
                   task.priority === PriorityEnum.LOW && (
                     <Button textSize={0} icon="arrow-down-outline" className="bg-green-500 h-10 w-10 rounded-full" textLight iconSize={20} children={null}/>
                   )
                 }
                 {
                   isAdmin && (
                     <Button textSize={0} onPress={handleEditTask} children={null} icon="pencil-outline" iconColor="#fff" className="h-10 w-10 rounded-full bg-transparent bg-slate-600" iconSize={24}/>
                   )
                 }
               </View>
             </View>
             <View className="mt-4 bg-slate-700 py-4 px-4 rounded-2xl flex-row">
               <View className="flex-1">
                 <P size={15} light weight="semibold" className="mb-2">Équipe</P>
                 <View className="flex-row items-center w-full mt-1">
                   {
                     task.contributors === null ? (
                       <P size={15} light className="italic mt-3 w-full text-center -ml-2">Non renseignée</P>
                     ) : (
                       <>
                         {
                           task.contributors && task.contributors.length > 0 && task.contributors.slice(0, 3).map((member, index) => (
                             <Avatar size={40} key={index} avatarID={member.avatarID} className="-mr-3"/>
                           ))
                         }
                         <Button textSize={0} children={null} icon="add-circle" iconSize={48} iconColor="#fff" color="none"/>
                         {
                           task.contributors && task.contributors.length > 3 && (
                             <P size={15} weight="semibold" className="ml-1" light style={{lineHeight: 15}}>+{task.contributors.length - 3}</P>
                           )
                         }
                       </>
                     )
                   }
                 </View>
               </View>
               <View className="bg-slate-400 h-full w-0.5"/>
               <View className="flex-1">
                 <P size={15} light weight="semibold" className="pl-4 mb-2">Date de fin</P>
                 {
                   task.end ? (
                     <View className="mt-1 pl-4">
                       <View className="flex-row items-center mb-2">
                         <Icon name="calendar" size={20} color="#fff"/>
                         <P size={15} light className="ml-2">{ task.end.day } { task.end.setLocale('fr').toLocaleString({ month: 'short' }) } { task.end.year }</P>
                       </View>
                       <View className="flex-row items-center">
                         <Icon name="time" size={20} color="#fff"/>
                         <P size={15} light className="ml-2">{ task.end.hour } : { task.end.minute }</P>
                       </View>
                     </View>
                   ) : (
                     <View className="items-center mt-4 pl-4">
                       <P size={15} light className="italic">Non renseignée</P>
                     </View>
                   )
                 }
               </View>
             </View>
             <View className="mt-4">
               <View className="flex-row items-center justify-between mb-3">
                 <P size={18} weight="semibold">Statut</P>
                 { task.start ? (
                   <P size={13} className="italic">Commence le { task.start.day } { task.start.setLocale('fr').toLocaleString({ month: 'short' }) } { task.start.year } à { task.start.hour }:{ task.start.minute }</P>
                 ) : (
                   <P size={13} className="italic">Commence le { task.created.day } { task.created.setLocale('fr').toLocaleString({ month: 'short' }) } { task.created.year } à { task.created.hour }:{ task.created.minute }</P>
                 )}
               </View>
               <View className="flex-row gap-2">
                 <P size={15} weight="semibold" light={task.status === 'soon'} className={Class(task.status === 'soon' ? 'bg-primary' : 'bg-slate-200', 'text-center flex-1 py-2 px-4 self-baseline rounded-full')}>À venir</P>
                 <P size={15} weight="semibold" light={task.status === 'active'} className={Class(task.status === 'active' ? 'bg-primary' : 'bg-slate-200', 'text-center flex-1 py-2 px-4 self-baseline rounded-full')}>En cours</P>
                 <P size={15} weight="semibold" light={task.status === 'end'} className={Class(task.status === 'end' ? 'bg-primary' : 'bg-slate-200', 'text-center flex-1 py-2 px-4 self-baseline rounded-full')}>Terminée</P>
               </View>
             </View>
             <BottomSheetScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 20, paddingTop: 20}}>
               <View className="flex-row items-center justify-between">
                 <P size={17} numberOfLines={15} className={Class(!task.description && 'italic')}>{ task.description ? task.description : 'Ajouter une description' }</P>
               </View>
             </BottomSheetScrollView>
           </Animated.View>
         ) : (
           <Animated.View exiting={FadeOutRight} className="flex-1 bg-white px-4">
             <BottomSheetScrollView contentContainerStyle={{flexGrow: 1}}>
               <View className="mb-4">
                 <P size={18} weight="semibold" className="mb-3">Titre de la tâche</P>
                 <TextInput className="bg-white border border-slate-200 rounded-2xl px-4 font-text-regular text-base text-black/80"
                            placeholder="Titre de la tâche"
                            placeholderTextColor="#0000005f"
                            cursorColor="#0000008f"
                            editable={isAdmin}
                            defaultValue={task.title}
                            onChangeText={(value) => setTitle(value)}/>
               </View>
               <View className="mb-4">
                 <P size={18} weight="semibold" className="mb-3">Description</P>
                 <TextInput className="bg-white border border-slate-200 rounded-2xl px-4 font-text-regular text-base text-black/80"
                            style={{minHeight: 130, maxHeight: 195}}
                            placeholder="Description"
                            textAlignVertical="top"
                            editable={isAdmin}
                            multiline={true}
                            placeholderTextColor="#0000005f"
                            cursorColor="#0000008f"
                            defaultValue={task.description ? task.description : ''}
                            onChangeText={(value) => setDescription(value)}
                 />
               </View>
               <View className="mb-4">
                 <View className="flex-row gap-3">
                   <View className="flex-1">
                     <P size={18} weight="semibold" className="mb-3">Début</P>
                     <Pressable onPress={() => isAdmin ? handleSelectDate('start') : null}>
                       <TextInput className="bg-white border border-slate-200 rounded-2xl px-4 font-text-regular text-base text-black/80"
                                  placeholder="Date de début"
                                  placeholderTextColor="#0000005f"
                                  showSoftInputOnFocus={false}
                                  editable={false}
                                  style={{height: 50}}
                                  defaultValue={dateStart ? `${dateStart.day} ${dateStart.setLocale('fr').toLocaleString({ month: 'short' }) } ${ dateStart.year } à ${ dateStart.toFormat('HH:mm') }` : ''}
                                  cursorColor="#0000008f"
                       />
                     </Pressable>
                   </View>
                   <View className="flex-1">
                     <P size={18} weight="semibold" className="mb-3">Fin</P>
                     <Pressable onPress={() => isAdmin ? handleSelectDate('end') : null}>
                       <TextInput className="bg-white border border-slate-200 rounded-2xl px-4 font-text-regular text-base text-black/80"
                                  placeholder="Date de fin"
                                  placeholderTextColor="#0000005f"
                                  showSoftInputOnFocus={false}
                                  editable={false}
                                  style={{height: 50}}
                                  defaultValue={dateEnd ? `${dateEnd.day} ${dateEnd.setLocale('fr').toLocaleString({ month: 'short' }) } ${ dateEnd.year } à ${ dateEnd.toFormat('HH:mm') }` : ''}
                                  cursorColor="#0000008f"
                       />
                     </Pressable>
                   </View>
                 </View>
                 <View className="self-start flex-row mt-2.5 mb-4">
                   <Icon name="information-circle" color={'rgb(100, 116, 139)'} size={32}/>
                   <View>
                     <P size={13} weight="semibold" className="text-slate-500 ml-1 mb-0.5" style={{lineHeight: 13}}>Vos tâches seront visibles dans le calendrier si vous</P>
                     <P size={13} weight="semibold" className="text-slate-500 ml-1" style={{lineHeight: 13}}>ajoutez une date de début et de fin.</P>
                   </View>
                 </View>
               </View>
               <View className="mb-4">
                 <P size={18} weight="semibold" className="mb-3">Priorité</P>
                 <Priority sortPriority={tmp.sortPriority}/>
               </View>
               <View className="mb-4">
                 <P size={18} weight="semibold" className="mb-3">Statut</P>
                 <View className="flex-row gap-2">
                   <Pressable onPress={() => handleStatusTask('soon')} className={Class(status === 'soon' ? 'bg-primary' : 'bg-slate-200', 'text-center flex-1 py-3.5 px-4 self-baseline rounded-full')}>
                     <P size={15} weight="semibold" className="text-center" light={status === 'soon'}>À venir</P>
                   </Pressable>
                   <Pressable onPress={() => handleStatusTask('active')} className={Class(status === 'active' ? 'bg-primary' : 'bg-slate-200', 'text-center flex-1 py-3.5 px-4 self-baseline rounded-full')}>
                     <P size={15} weight="semibold" className="text-center" light={status === 'active'}>En cours</P>
                   </Pressable>
                   <Pressable onPress={() => handleStatusTask('end')} className={Class(status === 'end' ? 'bg-primary' : 'bg-slate-200', 'text-center flex-1 py-3.5 px-4 self-baseline rounded-full')}>
                     <P size={15} weight="semibold" className="text-center" light={status === 'end'}>Terminée</P>
                   </Pressable>
                 </View>
               </View>
               <View className="mb-4">
                 <P size={18} weight="semibold" className="mb-1">Contributeurs</P>
                 <P size={13} className="mb-1 text-slate-500">Sélectionnez les membres qui travailleront sur cette tâche.</P>
                 <P size={13} className="mb-4 text-slate-500">Seuls les membres sélectionnés pourront y accéder.</P>
                 <View className="flex-row items-center self-end ml-auto gap-2 mb-6">
                   <P size={15} weight="semibold" className="mb-0.5">Sélectionner tout</P>
                   <Switch thumbColor={'rgb(148 163 184)'}
                           onValueChange={isAdmin ? handleSelectAll : null}
                           value={selectAll}
                           trackColor={{false: 'rgb(226 232 240)', true: 'rgb(71 85 105)'}} />
                 </View>
                 {
                   project && project.members.length !== 0 ? project && project.members.map((member, index) => (
                     <React.Fragment key={index}>
                       <View className="flex-row items-center">
                         <Avatar size={50} avatarID={member.avatarID} className="mr-2"/>
                         <View className="w-64">
                           <P size={16} weight="semibold">{ member.firstname.cap() } { member.lastname.cap() }</P>
                           <P size={14}>{ member.email.cap() }</P>
                         </View>
                         <View className="ml-auto">
                           <Switch onValueChange={() => toggleSwitch(index)}
                                   value={switchStates[index]}
                                   thumbColor={'rgb(148 163 184)'}
                                   trackColor={{false: 'rgb(226 232 240)', true: 'rgb(71 85 105)'}} />
                         </View>
                       </View>
                       {
                         index !== project!.members.length - 1 && (
                           <View className="h-0.5 w-full bg-slate-200 my-2"/>
                         )
                       }
                     </React.Fragment>
                   )) : (
                     <P size={15}>Aucun membre ajouté au projet</P>
                   )
                 }
               </View>
               <View className="mt-8 mb-4 self-center">
                 <Button onPress={handleTaskRemove} textSize={15} icon="trash" iconSize={24} iconColor="#fff" color="warn" textLight className="py-1.5 px-7">Supprimer la tâche</Button>
               </View>
             </BottomSheetScrollView>
             <View className="mb-4 border-t border-t-slate-200">
               <View className="mt-4 flex-row">
                 <Button textSize={18} onPress={handleBackTask} className="py-3 rounded-2xl justify-center items-center px-6 mr-4 bg-slate-300">Retour</Button>
                 <Button textSize={18} onPress={handleSubmit} textLight className="py-3 rounded-2xl flex-1 justify-center items-center px-4 bg-primary">
                   {
                     loading ? (
                       <ActivityIndicator size="small" color="#fff"/>
                     ) : 'Modifier'
                   }
                 </Button>
               </View>
             </View>
           </Animated.View>
         )
       )
     }
   </View>
  );
}

export default TaskBottomsheet;
