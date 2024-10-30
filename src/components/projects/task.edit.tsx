import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, TextInput, View } from 'react-native';
import { DateTime } from 'luxon';
import { closeBottomSheet, openBottomSheet } from '@Store/reducers/app.reducer';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { TaskEditInterface } from '@Type/task';
import { RootDispatch } from '@Type/store';
import { useDispatch } from 'react-redux';
import { removeTask, setTask } from '@Action/task.action';
import { Switch } from 'react-native-gesture-handler';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Button from '@Component/ui/button';
import P from '@Component/ui/text';
import Class from 'classnames';
import Priority from '@Component/projects/priority';
import Avatar from '@Component/ui/avatar';
import { arrayEqual } from '@Util/functions';
import { setProject } from '@Action/project.action';
import { currentDateTime } from '@Util/constants';


/**
 * RESTE A FAIRE :
 *
 * - OK - Modifier les dates start + end pour afficher les 0 devant les chiffres < 10
 * - Modifier le nbTask + nbTaskEnd en cas de suppression de tâche
 * - Regler les status en fonction des dates start et end :
 *   - Si la date end est passée : status = end
 *   - Si la date start est passée : status = active
 *   - Si la date start est dans 3 jours : status = soon
 *
 * - Si le status passe en terminée et si le status original n'était pas end alors : nbTaskEnd + 1 et status = end
 * - Si le status passe en active et si le status original était end alors : nbTaskEnd - 1 et status = active
 * - Si le status passe en à venir et si le status original était end alors : nbTaskEnd - 1 et status = soon
 */

const TaskEdit: React.FC<TaskEditInterface> = ({
  originalTask,
  updateTask,
  setEditTask,
  setUpdateTask,
  listUID,
  project,
  isAdmin,
  loading
}) => {
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [switchStates, setSwitchStates] = useState<boolean[]>(project ? project.members.map(() => false) : []);
  const dispatch = useDispatch<RootDispatch>();

  const resetBottomSheet = { height: 60, enablePanDownToClose: true, handleStyle: true };

  useEffect(() => {
    dispatch(openBottomSheet({ height: 79, enablePanDownToClose: false, handleStyle: false }));
  }, [dispatch]);

  // Effect to synchronize switch states and selectAll based on project and updateTask changes
  useEffect(() => {
    if (project && project.members.length > 0) {
      const updatedSwitchStates = project.members.map(member =>
        updateTask.contributors ? updateTask.contributors.some(contributor => contributor.uid === member.uid) : false
      );

      setSwitchStates(updatedSwitchStates);
      setSelectAll(updatedSwitchStates.every(state => state));
    }
  }, [project, updateTask]);

  /**
   * @description Handle the date start | end for the task
   */
  const handleSelectDate = useCallback((type: 'start' | 'end') => {
    const isStart = type === 'start';
    const now = new Date();

    const resetDate = () => {
      isStart && setUpdateTask({ ...updateTask, start: updateTask.created });
      !isStart && setUpdateTask({ ...updateTask, end: null });
      return;
    }

    DateTimePickerAndroid.open({
      mode: 'date',
      display: 'calendar',
      value: isStart ? (updateTask.start && updateTask.start.toJSDate()) ?? now : (updateTask.end && updateTask.end.toJSDate()) ?? now,
      onChange: (event, date) => {
        if (event.type === 'dismissed') {
          resetDate();
        } else if (date) {
          let selectedDate = new Date(date);

          DateTimePickerAndroid.open({
            mode: 'time',
            display: 'spinner',
            value: isStart ? (updateTask.start && updateTask.start.toJSDate()) ?? selectedDate : (updateTask.end && updateTask.end.toJSDate()) ?? selectedDate,
            onChange: (event, time) => {
              if (event.type === 'dismissed') {
                resetDate();
              } else if (time) {
                let selectedTime = new Date(time);

                selectedDate.setHours(selectedTime.getHours());
                selectedDate.setMinutes(selectedTime.getMinutes());

                isStart && setUpdateTask({ ...updateTask, start: DateTime.fromJSDate(selectedDate).setZone('Europe/Paris', { keepLocalTime: true }) });
                !isStart && setUpdateTask({ ...updateTask, end: DateTime.fromJSDate(selectedDate).setZone('Europe/Paris', { keepLocalTime: true }) });
              }
            }
          });
        }
      }
    });
  }, [setUpdateTask, updateTask]);

  /**
   * @description Handle the status of the task
   */
  const handleStatusTask = useCallback((status: 'soon' | 'active' | 'end') => {
    if (updateTask.status !== status) {
      setUpdateTask({...updateTask, status});
    }
  }, [setUpdateTask, updateTask]);

  useEffect(() => {
    if (updateTask.start && updateTask.end) {
      const now = currentDateTime;
      const start = updateTask.start;
      const end = updateTask.end;

      if ((now >= end) || (start >= end)) {
        handleStatusTask('end');
      } else if (start > now) {
        handleStatusTask('soon');
      } else if (now >= start && now < end) {
        handleStatusTask('active');
      }
    }
  }, [updateTask.start, updateTask.end, handleStatusTask]);

  /**
   * @description Handle the select all contributors
   * Toggles the selectAll state and updates the switchStates accordingly
   */
  const handleSelectAll = useCallback(() => {
    const newSelectAllState = !selectAll;
    setSelectAll(newSelectAllState);

    // Update switchStates based on new selectAll state
    const updatedStates = project!.members.map(() => newSelectAllState);
    setSwitchStates(updatedStates);

    // Update contributors in updateTask based on new selectAll state
    const selectedContributors = newSelectAllState ? project!.members : [];
    setUpdateTask({ ...updateTask, contributors: selectedContributors });
  }, [project, setUpdateTask, selectAll, updateTask]);

  /**
   * @description Handle the toggle switch for individual contributors
   * Updates the switchStates for the toggled contributor and manages the selectAll state
   */
  const handleToggleSwitch = useCallback((index: number) => {
    if (!isAdmin) return;

    const updatedStates = [...switchStates];
    updatedStates[index] = !updatedStates[index];
    setSwitchStates(updatedStates);

    const selectedContributors = project && project.members.filter((_, idx) => updatedStates[idx]);
    if (selectedContributors) {
      setUpdateTask({ ...updateTask, contributors: selectedContributors });
    }

    const allSelected = updatedStates.every(state => state);
    setSelectAll(allSelected);
  }, [isAdmin, switchStates, project, setUpdateTask, updateTask]);

  /**
   * @description Handle the remove task
   */
  const handleTaskRemove = useCallback(() => {
    if (loading) return;

    if (!project || !listUID || !updateTask) {
      return Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression de la tâche.');
    }

    Alert.alert('Supprimer la tâche', 'Voulez-vous vraiment supprimer cette tâche ?', [{
      text: 'Annuler'
    }, {
      text: 'Supprimer',
      onPress: () => {
        dispatch(setProject({ uid: project.uid, nbTasks: project.nbTasks - 1 }));

        if (updateTask.status === 'end') {
          dispatch(setProject({ uid: project.uid, nbTasksEnd: project.nbTasksEnd - 1 }));
        }

        dispatch(removeTask({ taskUID: updateTask.uid, listUID, projectUID: project.uid }));
        dispatch(closeBottomSheet({}));
      }
    }]);
  }, [loading, updateTask, listUID, project, dispatch]);

  /**
   * @description Handle the back task
   */
  const handleBackTask = useCallback(() => {
    if (!arrayEqual(originalTask, updateTask)) {
      Alert.alert('Attention', 'Vous avez des modifications non enregistrées.\n\nVoulez-vous vraiment quitter ?', [{
        text: 'Modifier',
        onPress: () => {
          handleSubmit();
          dispatch(closeBottomSheet({}));
        }
      }, {
        text: 'Annuler',
      }, {
        text: 'Quitter',
        onPress: () => {
          setEditTask(false);
          setUpdateTask(originalTask);
          dispatch(openBottomSheet(resetBottomSheet));
        }
      }]);
    } else {
      setEditTask(false);
      dispatch(openBottomSheet(resetBottomSheet));
    }
  }, [originalTask, setUpdateTask, updateTask, setEditTask, dispatch]);

  /**
   * @description Handle the submit task
   */
  const handleSubmit = useCallback(() => {
    if (loading) return;

    if (!project || !listUID || !updateTask) {
      return Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression de la tâche.');
    }

    if (updateTask.status === 'end' && originalTask.status !== 'end') {
      dispatch(setProject({ uid: project.uid, nbTasksEnd: project.nbTasksEnd + 1 }));
    } else if (updateTask.status !== 'end' && originalTask.status === 'end') {
      dispatch(setProject({ uid: project.uid, nbTasksEnd: project.nbTasksEnd - 1 }));
    }

    project && dispatch(setTask({ task: updateTask, listUID, projectUID: project.uid }));
    setEditTask(false);
    setUpdateTask(updateTask);
    dispatch(closeBottomSheet({}));
  }, [loading, project, dispatch, updateTask, setEditTask, setUpdateTask, listUID]);

  return (
    <>
      <BottomSheetScrollView contentContainerStyle={{flexGrow: 1, paddingHorizontal: 16, paddingTop: 16}}>
        <View className="mb-4">
          <P size={18} weight="semibold" className="mb-3">Titre de la tâche</P>
          <TextInput className="bg-white border border-slate-200 rounded-2xl px-4 font-text-regular text-base text-black/80"
                     placeholder="Titre de la tâche"
                     placeholderTextColor="#0000005f"
                     cursorColor="#0000008f"
                     editable={isAdmin}
                     defaultValue={updateTask.title}
                     onChangeText={(value) => setUpdateTask({ ...updateTask, title: value })}/>
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
                     defaultValue={updateTask.description ? updateTask.description : ''}
                     onChangeText={(value) => setUpdateTask({ ...updateTask, description: value })}
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
                           defaultValue={updateTask.start ? `${updateTask.start.day} ${updateTask.start.setLocale('fr').toLocaleString({ month: 'short' }) } ${ updateTask.start.year } à ${ updateTask.start.toFormat('HH:mm') }` : ''}
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
                           defaultValue={updateTask.end ? `${updateTask.end.day} ${updateTask.end.setLocale('fr').toLocaleString({ month: 'short' }) } ${ updateTask.end.year } à ${ updateTask.end.toFormat('HH:mm') }` : ''}
                           cursorColor="#0000008f"
                />
              </Pressable>
            </View>
          </View>
          <View className="self-start flex-row mt-2.5 mb-4">
            <Icon name="information-circle" color={'rgb(100, 116, 139)'} size={32}/>
            <View>
              <P size={13} weight="semibold" className="text-slate-500 ml-1 mb-0.5" style={{lineHeight: 13}}>Vos tâches seront visibles dans le calendrier si vous</P>
              <P size={13} weight="semibold" className="text-slate-500 ml-1" style={{lineHeight: 13}}>ajoutez une date de fin.</P>
            </View>
          </View>
        </View>
        <View className="mb-4">
          <P size={18} weight="semibold" className="mb-3">Statut</P>
          <View className="flex-row gap-2">
            <Pressable onPress={() => handleStatusTask('soon')} className={Class(updateTask.status === 'soon' ? 'bg-primary' : 'bg-slate-200', 'text-center flex-1 py-3.5 px-4 self-baseline rounded-full')}>
              <P size={15} weight="semibold" className="text-center" light={updateTask.status === 'soon'}>À venir</P>
            </Pressable>
            <Pressable onPress={() => handleStatusTask('active')} className={Class(updateTask.status === 'active' ? 'bg-primary' : 'bg-slate-200', 'text-center flex-1 py-3.5 px-4 self-baseline rounded-full')}>
              <P size={15} weight="semibold" className="text-center" light={updateTask.status === 'active'}>En cours</P>
            </Pressable>
            <Pressable onPress={() => handleStatusTask('end')} className={Class(updateTask.status === 'end' ? 'bg-primary' : 'bg-slate-200', 'text-center flex-1 py-3.5 px-4 self-baseline rounded-full')}>
              <P size={15} weight="semibold" className="text-center" light={updateTask.status === 'end'}>Terminée</P>
            </Pressable>
          </View>
        </View>
        <View className="mb-4">
          <P size={18} weight="semibold" className="mb-3">Priorité</P>
          <Priority isTask={true} updateTask={updateTask} sortPriority={updateTask.priority} setUpdateTask={setUpdateTask}/>
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
                    <Switch onValueChange={() => handleToggleSwitch(index)}
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
      <View className="mb-4 px-4 border-t border-t-slate-200">
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
    </>
  );
}

export default TaskEdit;
