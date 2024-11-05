import React, { useEffect } from 'react';
import { ChatInterface } from '@Type/chat';
import P from '@Component/ui/text';
import Class from 'classnames';
import Animated, { SlideInLeft, SlideInRight } from 'react-native-reanimated';
import { Alert, Vibration, View } from 'react-native';
import Avatar from '@Component/ui/avatar';
import { LongPressGestureHandler } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import { removeMessage } from '@Action/chat.action';
import { ProjectInterface } from '@Type/project';
import { RootDispatch } from '@Type/store';
import { setUpdateMessage } from '@Store/reducers/chat.reducer';

const Message = ({
	chat,
	currentUser,
	project
}: { chat: ChatInterface, currentUser: string, project: ProjectInterface }) => {
	const isCurrentUser = chat.userUID === currentUser;
	const isMessageAuto = chat.userUID === 'message-auto';
	const animate = isCurrentUser ? SlideInRight : SlideInLeft;
	const dispatch = useDispatch<RootDispatch>();
	const maxWidth = 320;

	const onLongPress = (chat: ChatInterface) => {
		Vibration.vibrate(105);

		Alert.alert(
			'Modifier ou supprimer',
			`Vous pouvez modifier ou supprimer ce message : \n\n"${
				chat.content.length > 40 ? chat.content.substring(0, 40) + '...' : chat.content
			}"`,
			[
				{ text: 'Annuler' },
				{ text: 'Modifier', onPress: () => {
					dispatch(setUpdateMessage(chat));
				}},
				{ text: 'Supprimer', onPress: () => {
					dispatch(removeMessage({
						messageUID: chat.uid,
						projectUID: project.uid
					}));
				}}
			]
		);
	}

	return (
		<LongPressGestureHandler onActivated={() => isCurrentUser ? onLongPress(chat) : null}>
			<Animated.View key={chat.uid} entering={chat.newMessage ? animate : undefined} className="flex-row">
				{
					!isCurrentUser && (
						<Avatar size={32} avatarID={chat.avatarID} className="mr-2 mt-1"/>
					)
				}
				<View style={{ maxWidth, alignSelf: isCurrentUser ? 'flex-end' : 'flex-start' }} className={Class('mb-3 rounded-2xl py-3 px-4', isCurrentUser ? 'bg-primary ml-auto' : 'bg-white mr-auto')}>
					<P size={17} numberOfLines={1} light={isCurrentUser} weight="semibold" className={Class('mb-2.5', isCurrentUser && 'self-end')} style={{maxWidth}}>{ chat.author }</P>
					{
						isMessageAuto ? (
							<>
								<P size={17} numberOfLines={1} weight="regular" className="italic" style={{maxWidth}}>Bienvenue sur le chat de </P>
								<P size={17} numberOfLines={1} weight="semibold" style={{maxWidth}}>{ chat.content } !</P>
							</>
						) : (
							<P size={17} numberOfLines={4} light={isCurrentUser} weight="regular" className={Class(isCurrentUser && 'self-end')} style={{maxWidth}}>
								{ chat.content }
							</P>
						)
					}
					<P size={13} light={isCurrentUser} className="mt-2 self-end">{ chat.created.toRelativeDate() }</P>
				</View>
			</Animated.View>
		</LongPressGestureHandler>
	);
}

export default Message;
