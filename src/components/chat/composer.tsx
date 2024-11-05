import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, TextInput, View } from 'react-native';
import { MemberRoleEnum, ProjectInterface } from '@Type/project';
import { DateTime } from 'luxon';
import Button from '@Component/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '@Action/chat.action';
import useChat from '@Hook/useChat';
import { setMessage as updateMessages } from '@Action/chat.action';
import { RootDispatch, RootStateType } from '@Type/store';
import { ChatInterface } from '@Type/chat';
import { UserInterface } from '@Type/user';
import Animated, { Easing, FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { setUpdateMessage } from '@Store/reducers/chat.reducer';

const Composer = ({
	user,
	project,
}: { user: UserInterface, project: ProjectInterface | null }) => {
	const [message, setMessage] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const { setMessages } = useChat();
	const { error, updateMessage } = useSelector((state: RootStateType) => state.chat);
	const composerInputRef = useRef<TextInput>(null);
	const dispatch = useDispatch<RootDispatch>();

	const isMember = project && project.members.find((member) => member.uid === user.uid && member.role === MemberRoleEnum.MEMBER);

	useEffect(() => {
		if (error) {
			Alert.alert('Erreur', error);
			setLoading(false);
		}
	}, [error]);

	useEffect(() => {
		if (updateMessage) {
			setMessage(updateMessage.content);
			(composerInputRef && composerInputRef.current) && composerInputRef.current.focus();
		} else {
			setMessage('');
		}
	}, [updateMessage]);

	const handleAddMessage = useCallback(() => {
		if (loading || message.length === 0) return;

		setLoading(true);

		setTimeout(() => {
			if (message && project) {
				const newMessage = {
					avatarID: user.avatarID,
					userUID: user.uid,
					author: `${user.firstname.cap()}`,
					role: isMember ? MemberRoleEnum.MEMBER : MemberRoleEnum.ADMIN,
					content: message,
					read: true,
					newMessage: true,
					created: DateTime.now()
				} as ChatInterface;

				if (!updateMessage) {
					dispatch(addMessage({
						message: newMessage,
						projectUID: project.uid
					}));

					setMessages((prevMessage) => [...prevMessage, newMessage]);
				} else {
					dispatch(updateMessages({
						message: {
							...updateMessage,
							content: message,
							created: updateMessage.created
						},
						projectUID: project.uid
					}));

					setMessages((prevMessages) => {
						return [...prevMessages, { ...updateMessage, content: message }];
					});

					dispatch(setUpdateMessage(null));
				}

				setMessage('');
				setLoading(false);
			}
		}, 500);
	}, [dispatch, user, project, updateMessage, message, setMessages])

	return (
		<View className="relative z-50">
			{
				updateMessage && (
					<Button onPress={() => dispatch(setUpdateMessage(null))} textSize={14} className="pr-5 self-end pb-2.5" color="none" textLight>Annuler la modification</Button>
				)
			}
			<View className="bg-slate-800 rounded-3xl mt-1 pt-2 px-4 pb-28 flex-row justify-between z-20 relative">
				<TextInput ref={composerInputRef}
									 placeholder="Votre message"
									 placeholderTextColor={'#e2e8f0'}
									 multiline
									 textAlignVertical="top"
									 defaultValue={message}
									 onChangeText={(text) => setMessage(text)}
									 style={{fontSize: 17, fontFamily: 'Lato-Regular', color: '#fff', minHeight: 64, maxHeight: 200, width: 328}}/>
				{
					loading ? (
						<ActivityIndicator size="large" color="#fff" style={{alignSelf: 'flex-end', paddingRight: 1, paddingBottom: 18}}/>
					) : (
						<Button onPress={handleAddMessage} textSize={0} icon="send" iconSize={24} color="none" style={{paddingHorizontal: 6, paddingBottom: 22, alignSelf: 'flex-end'}} textLight children={null}/>
					)
				}
			</View>
		</View>
	);
}

export default Composer;
