import Firebase from '@Service/firebase/init';
import { useCallback, useState } from 'react';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { ChatInterface } from '@Type/chat';
import { RootDispatch } from '@Type/store';
import { MemberRoleEnum, ProjectInterface } from '@Type/project';
import { addMessage, setMessage } from '@Action/chat.action';
import { DateTime } from 'luxon';
import { random } from '@Util/functions';
import { setLoading } from '@Store/reducers/chat.reducer';

const useChat = () => {
	const [messages, setMessages] = useState<ChatInterface[]>([]);
	const [initLoading, setInitLoading] = useState<boolean>(false);
	const [unsubscribeDoc, setUnsubscribeDoc] = useState<(() => void) | null>(null);
	const dispatch = useDispatch<RootDispatch>();

	const updateNewMessageStatus = (newMessages: ChatInterface[], projectUID: string) => {
		setTimeout(() => {
			setMessages((prevMessages) =>
				prevMessages.map((msg) => {
					if (msg.newMessage) {
						dispatch(setMessage({
							message: { ...msg, newMessage: false },
							projectUID
						}));
					}

					return newMessages.some((newMsg) => newMsg.uid === msg.uid)
						? { ...msg, newMessage: false }
						: msg
				})
			);
		}, 1000);
	};

	const startChat = useCallback((project: ProjectInterface) => {
		const db = new Firebase().db;
		const chatDocRef = collection(db, 'projects', project.uid, 'chats');

		setInitLoading(true);
		dispatch(setLoading(true));

		const unsubscribe = onSnapshot(query(chatDocRef, orderBy('created', 'asc')), (snapshot) => {
			if (snapshot.empty) {
				return dispatch(addMessage({
					message: {
						uid: random(20),
						avatarID: 'https://st5.depositphotos.com/72897924/62255/v/450/depositphotos_622556394-stock-illustration-robot-web-icon-vector-illustration.jpg',
						userUID: 'message-auto',
						author: 'Bot',
						role: MemberRoleEnum.ADMIN,
						content: `${project.title.cap()}`,
						read: true,
						newMessage: true,
						created: DateTime.now()
					},
					projectUID: project.uid
				}))
			} else {
				snapshot.docChanges().forEach((change) => {
					const chatData = change.doc.data() as ChatInterface;
					const messageExists = messages.some(chat => chat.uid === chatData.uid);

					switch (change.type) {
						case 'added':
							if (!messageExists) {
								setMessages((prevMessages) => {
									const date = chatData.created as DateTime | Timestamp;

									if (date && typeof date === 'object' && 'seconds' in date) {
										chatData.created = DateTime.fromSeconds(date.seconds);
									}

									return [chatData, ...prevMessages];
								});
							}
							break;
						case 'modified':
							setMessages((prevMessages) => {
								const date = chatData.created as DateTime | Timestamp;

								if (date && typeof date === 'object' && 'seconds' in date) {
									chatData.created = DateTime.fromSeconds(date.seconds);
								}

								return prevMessages.map((msg) => (msg.uid === chatData.uid ? chatData : msg))
							});
							break;
						case 'removed':
							setMessages((prevMessages) =>
								prevMessages.filter((msg) => msg.uid !== chatData.uid)
							);
							break;
						default:
							break;
					}

					setMessages((currentMessages) => {
						updateNewMessageStatus(currentMessages, project.uid);
						return currentMessages;
					});

					dispatch(setLoading(false));
				});
			}

			setInitLoading(false);
		});

		setUnsubscribeDoc(() => unsubscribe);

		return () => {
			unsubscribe();
			setMessages([]);
		}
	}, [messages, dispatch]);

	const unsubscribe = () => {
		if (unsubscribeDoc) {
			unsubscribeDoc();
			setUnsubscribeDoc(null);
		}
	};

	return {
		messages, startChat, initLoading, setMessages, unsubscribe
	}
}

export default useChat;
