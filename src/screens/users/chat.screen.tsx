import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Keyboard, Pressable, View } from 'react-native';
import ScreenLayout from '@Component/layouts/screen.layout';
import useScreen from '@Hook/useScreen';
import { useDispatch, useSelector } from 'react-redux';
import { RootDispatch, RootStateType } from '@Type/store';
import { shadowText, theme } from '@Asset/theme/default';
import { FlatList } from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import Animated, { FadeIn, FadeInLeft, FadeOut } from 'react-native-reanimated';
import Button from '@Component/ui/button';
import P from '@Component/ui/text';
import { MemberRoleEnum, ProjectInterface } from '@Type/project';
import { useFocusEffect } from '@react-navigation/native';
import { getProjects } from '@Action/project.action';
import { resetProjects } from '@Store/reducers/project.reducer';
import { setChatProject, setUpdateMessage } from '@Store/reducers/chat.reducer';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import Composer from '@Component/chat/composer';
import Message from '@Component/chat/message';
import useChat from '@Hook/useChat';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ChatScreen = () => {
  const [chatMode, setChatMode] = useState<boolean>(false);
  const [isKeyboard, setIsKeyboard] = useState<boolean>(false);
  const { user } = useSelector((state: RootStateType) => state.user);
  const { projects, loading: loadingProject } = useSelector((state: RootStateType) => state.project);
  const { chatProject, updateMessage } = useSelector((state: RootStateType) => state.chat);
  const { width } = Dimensions.get('screen');
  const { messages, startChat, initLoading, unsubscribe, setMessages } = useChat();
  const dispatch = useDispatch<RootDispatch>();

  useScreen('light-content');

  useFocusEffect(
    useCallback(() => {
      if (!chatProject && user) {
        dispatch(getProjects(user.uid));
      }

      return () => {
        dispatch(resetProjects());
        unsubscribe();
      }
    }, [chatProject && user, dispatch])
  );

  useEffect(() => {
    const keyboardShow = Keyboard.addListener('keyboardDidShow', () => setIsKeyboard(true));
    const keyboardHide = Keyboard.addListener('keyboardDidHide', () => setIsKeyboard(false));

    return () => {
      keyboardShow.remove();
      keyboardHide.remove();
    }
  }, []);

  useEffect(() => {
    if (chatProject) {
      setChatMode(true);
    } else {
      unsubscribe();
      setChatMode(false);
      setMessages([]);
    }
  }, [chatProject, setMessages]);

  const handleSelectProject = (project: ProjectInterface) => {
    dispatch(setChatProject(project));
    startChat(project);
  }

  const isUpdatedMessageVisible = messages.some((msg) => msg.uid === updateMessage?.uid);
  const filteredMessages = updateMessage ? messages.filter((msg) => msg.uid !== updateMessage.uid) : messages;

  return (
   <ScreenLayout>
     <View className="bg-primary h-1 w-full z-50"/>
     <View className="flex-1 py-4">
       {
         !chatMode && (
           <P size={18} weight="semibold" className="px-4 mb-4">Choisissez un projet</P>
         )
       }
       {
         chatMode ? (
           chatProject && (
             <KeyboardStickyView offset={{opened: 130}} className="flex-1">
               {
                 initLoading && (
                    <ActivityIndicator size="large" color={theme.primary} className="mt-2"/>
                 )
               }
               {
                 isUpdatedMessageVisible && (
                   <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} className="bg-black/60 absolute left-0 -top-4 right-0 bottom-0" style={{ zIndex: 20 }} />
                 )
               }
               <FlatList data={filteredMessages}
                         extraData={messages}
                         inverted
                         keyboardShouldPersistTaps="handled"
                         contentContainerStyle={{flexGrow: 1, paddingHorizontal: 16, paddingBottom: isKeyboard ? 190 : 0}}
                         keyExtractor={(item) => item.uid}
                         renderItem={({item, index}) =>
                           <View className="relative">
                             <Message key={index} chat={item} currentUser={user.uid} project={chatProject}/>
                           </View>
                        }
               />
               {
                 updateMessage && (
                   <View className="relative px-4">
                     <View style={{ zIndex: 30 }}>
                       <Message chat={updateMessage} currentUser={user.uid} project={chatProject}/>
                     </View>
                   </View>
                 )
               }
               <Composer user={user} project={chatProject}/>
             </KeyboardStickyView>
           )
         ) : loadingProject ? (
           <ActivityIndicator size="large" color={theme.primary} className="mt-2"/>
         ) : (
           <FlatList data={projects}
                     extraData={projects}
                     keyExtractor={(item) => item.uid}
                     contentContainerStyle={{flexGrow: 1, paddingBottom: 110}}
                     renderItem={({ item: project, index }) => {
                       const isMembers = project.members.some((member) => member.uid === user.uid && member.role === MemberRoleEnum.MEMBER);

                       return (
                         <AnimatedPressable onPress={() => handleSelectProject(project)} entering={FadeInLeft.delay(100 * index)} key={project.uid} style={{width: width, height: width / 6}} className="justify-center relative mb-3">
                           <View className="absolute z-10 px-4 w-full">
                             <P size={18} weight="semibold" light style={shadowText} className="pl-5 pr-10">{ project.title.toUpperCase() }</P>
                             <P size={15} weight="semibold" className="pl-5" light style={shadowText}>{ project.nbTasks } tâche{ project.nbTasks > 1 && 's' }</P>
                             {
                               isMembers && (
                                 <Button onPress={() => Alert.alert(`Projet ${project.title.cap()}`, 'Ce projet est en lecture seule.\nVous ne pouvez pas le modifier ni le supprimer.')}
                                         className="h-8 w-8 absolute right-4 bottom-2 z-10"
                                         textSize={0} icon="lock-closed"
                                         iconSize={20} color="none"
                                         iconColor="#fff" children={null}/>
                               )
                             }
                           </View>
                           <FastImage source={{uri: project.cover.landscape}} resizeMode="cover" style={{width: width, height: width / 6}}/>
                           <View className="bg-black/50 h-full w-full absolute top-0 left-0"/>
                         </AnimatedPressable>
                       )
                     }}
           />
         )
       }
     </View>
   </ScreenLayout>
  );
}

export default ChatScreen;
