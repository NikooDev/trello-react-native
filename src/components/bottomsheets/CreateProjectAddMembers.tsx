import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Keyboard, Pressable, TextInput, View } from 'react-native';
import { closeBottomSheet } from '@Store/reducers/app.reducer';
import { setTmpMembers } from '@Store/reducers/project.reducer';
import { theme } from '@Asset/theme/trello';
import Icon from 'react-native-vector-icons/Ionicons';
import FirestoreService from '@Service/firebase/store';
import Animated, { FadeIn, FadeOut, FadeOutLeft, SharedValue, SlideInDown, SlideInLeft, SlideInRight, SlideOutDown, SlideOutLeft, SlideOutRight, useAnimatedStyle } from 'react-native-reanimated';
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { RootStateType } from '@Type/store';
import { UserInterface } from '@Type/user';
import { MemberRole, MembersInterface } from '@Type/project';
import { cap, debounce } from '@Util/functions';
import { useDispatch, useSelector } from 'react-redux';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import Button from '@Component/ui/button';
import P from '@Component/ui/text';
import Class from 'classnames';
import Avatar from '@Component/ui/avatar';

const CreateProjectAddMembers = () => {
	const [queryMember, setQueryMember] = useState<string>('');
	const [members, setMembers] = useState<MembersInterface[]>([]);
	const [memberRemoved, setMemberRemoved] = useState<number | null>(null);
	const [loadBottomSheet, setLoadBottomSheet] = useState<boolean>(true);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingAdd, setLoadingAdd] = useState<boolean>(false);
	const [keyboardOpened, setKeyboardOpened] = useState<boolean>(false);
	const inputMembers = useRef<TextInput>(null);
	const swipeableRef = useRef<(SwipeableMethods | null)[]>([]);
	const { tmpMembers } = useSelector((state: RootStateType) => state.project);
	const { user } = useSelector((state: RootStateType) => state.user);
	const { height } = Dimensions.get('screen');
	const keyBoardHeight = 720;
	const dispatch = useDispatch();

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;

		timer = setTimeout(() => {
			setLoadBottomSheet(false);
		}, 800);

		return () => {
			clearTimeout(timer);
		}
	}, []);

	/**
	 * Focus the input when the component is mounted
	 */
	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;

		timer = setTimeout(() => {
			if (!inputMembers.current) return;

			inputMembers.current.focus();
		}, 300);

		return () => {
			clearTimeout(timer);
		}
	}, [inputMembers]);

	/**
	 * Handle the keyboard opening and closing
	 */
	useEffect(() => {
		const keyboardOpened = Keyboard.addListener('keyboardDidShow', () => {
			setKeyboardOpened(true);
		});

		const keyboardClosed = Keyboard.addListener('keyboardDidHide', () => {
			setKeyboardOpened(false);
		});

		return () => {
			keyboardOpened.remove();
			keyboardClosed.remove();
		}
	}, []);

	/**
	 * @description Change toggle role member
	 * @param index
	 */
	const handleRoleMember = (index: number) => {
		const updatedMembers = [...tmpMembers];

		updatedMembers[index] = {
			...updatedMembers[index],
			role: updatedMembers[index].role === MemberRole.MEMBER ? MemberRole.ADMIN : MemberRole.MEMBER
		};

		dispatch(setTmpMembers(updatedMembers.reverse()));
		swipeableRef.current[index]?.close();
	}

	/**
	 * @description Delete member
	 * @param index
	 */
	const handleDeleteMember = (index: number) => {
		setMemberRemoved(index);
		const updatedMembers = [...tmpMembers];
		updatedMembers.splice(index, 1);
		dispatch(setTmpMembers(updatedMembers.reverse()));
		setMemberRemoved(null);
	}

	/**
	 * @description Render the item member
	 * @param member
	 */
	const renderItemMember = (member: UserInterface & { role?: MemberRole }) => {
		return (
			<View className={Class('flex-row w-full justify-between', member.uid !== user.uid && 'mb-4')}>
				<View className="flex-row items-center">
					<Avatar size={45} avatarID={member.avatarID}/>
					<View className="w-52">
						<P size={18} weight="semibold" style={{ lineHeight: 17 }} className="ml-3">
							{ cap(member.firstname) } { cap(member.lastname) }
						</P>
						<P size={13} className="text-slate-500 ml-3">
							{ member.email }
						</P>
					</View>
				</View>
				<View className="flex-row items-center">
					<P size={15} className="text-slate-500">
						{
							member.role
								? member.role === MemberRole.MEMBER ? 'Membre' : 'Administrateur'
								: member.uid === user.uid ? 'Administrateur' : 'Membre'
						}
					</P>
				</View>
			</View>
		)
	}

	/**
	 * @description Render the right actions
	 * @param _
	 * @param dragX
	 * @param index
	 */
	const renderRightActions = (_: SharedValue<number>, dragX: SharedValue<number>, index: number) => {
		const styleAnimation = useAnimatedStyle(() => {
			return {
				transform: [{ translateX: dragX.value + 125 }],
			};
		});

		return (
			<Animated.View style={styleAnimation} className="w-32 justify-end flex-row relative">
				<Button textSize={0} onPress={() => handleRoleMember(index)} icon={tmpMembers[index].role == MemberRole.ADMIN ? 'people' : 'person'} iconSize={24} color="primary" textLight className="w-12 h-12 mr-1.5" children={null}/>
				<Button textSize={0} onPress={() => handleDeleteMember(index)} icon="trash" iconSize={24} color="warn" textLight className="w-12 h-12" children={null}/>
			</Animated.View>
		);
	};

	/**
	 * @description Handle the add member
	 * @param member
	 */
	const handleAddMember = async (member: MembersInterface) => {
		if (member) {
			const memberExist = tmpMembers.some(existingMember => existingMember.uid === member.uid);

			if (memberExist) {
				Alert.alert('Membre déjà ajouté', 'Ce membre a déjà été ajouté au projet.', [{text: 'OK'}]);
				setQueryMember('');
			} else {
				setQueryMember('');
				dispatch(setTmpMembers([...tmpMembers, {...member, role: MemberRole.MEMBER}]));
			}
		}

		if (inputMembers.current) {
			inputMembers.current.clear();
			setMembers([]);
		}
	}

	/**
	 * @description Filter the members
	 * @param query
	 * @param members
	 */
	const filterMembers = (query: string, members: MembersInterface[]) => {
		if (query.length < 1) return [];

		return members.filter(member => (member.firstname &&
			member.firstname.toLowerCase().startsWith(query)) || (member.lastname &&
			member.lastname.toLowerCase().startsWith(query)) || (member.email &&
			member.email.toLowerCase().startsWith(query))
		);
	}

	/**
	 * @description Get list members
	 */
	const loadMembers = useCallback(async () => {
		const firestore = new FirestoreService<MembersInterface>('users');

		try {
			const members = await firestore.list<MembersInterface>();

			const filteredMembers = filterMembers(
				queryMember,
				members.filter(member =>
					member.uid !== user.uid &&
					!tmpMembers.some(existingMember => existingMember.uid === member.uid
				))
			);

			setMembers(filteredMembers);
			setLoading(false);
		} catch (err) {
			console.log(err);

		}
	}, [queryMember, tmpMembers])

	const debouncedGetUsers = useCallback(debounce(loadMembers, 500), [loadMembers]);

	/**
	 * If the query is not empty, we get the users
	 */
	useEffect(() => {
		if (queryMember.length >= 1) {
			setLoading(true);
			debouncedGetUsers();
		} else {
			setLoading(false);
		}
	}, [queryMember, debouncedGetUsers]);

	/**
	 * @description Close bottom sheet and delete the tmp members
	 */
	const handleClose = () => {
		setLoadingAdd(true);

		if (keyboardOpened) {
			Keyboard.dismiss();
		}

		if (tmpMembers.length > 0) {
			setTimeout(() => dispatch(closeBottomSheet()), 1000);
		} else {
			dispatch(closeBottomSheet());
		}
	}

	return (
		<View className="flex-1 pt-4 px-4">
			<P size={18} className="mb-0.5" weight="semibold">Ajouter des membres</P>
			<P size={13} numberOfLines={2} className="text-slate-500 mb-3">Commencer à écrire pour que des résultats apparaissent.</P>
			<View className="flex-row gap-2">
				<TextInput ref={inputMembers}
									 className="bg-white border border-slate-200 rounded-2xl flex-1 pl-4 font-text-regular text-base text-black/80"
									 autoCapitalize="none"
									 keyboardType="email-address"
									 placeholder="Adresse email ou nom et prénom"
									 placeholderTextColor="#0000005f"
									 cursorColor="#0000008f"
									 autoFocus={false}
									 autoComplete="email"
									 onChangeText={(value) => setQueryMember(value)}/>
				{
					loading && (
						<Animated.View entering={FadeIn} exiting={FadeOut} key="loading" className="absolute" style={{right: 12, top: 12}}>
							<ActivityIndicator size={24} color={theme.primary}/>
						</Animated.View>
					)
				}
			</View>
			{
				queryMember.length === 0 && (
					<Animated.View entering={queryMember.length !== 0 ? SlideInLeft.duration(200) : SlideInRight.duration(200)}
												 exiting={queryMember.length !== 0 ? SlideOutLeft.duration(200) : SlideOutRight.duration(200)}>
						<View className="self-start flex-row items-center mt-2.5 mb-4">
							<Icon name="help-circle" color={'rgb(100, 116, 139)'} size={32}/>
							<View>
								<P size={13} weight="semibold" className="text-slate-500 ml-1 mb-0.5" style={{lineHeight: 13}}>Glissez un membre vers la gauche</P>
								<P size={13} weight="semibold" className="text-slate-500 ml-1" style={{lineHeight: 13}}>pour afficher les options.</P>
							</View>
						</View>
					</Animated.View>
				)
			}
			<Animated.View entering={queryMember.length !== 0 ? SlideInLeft.duration(200) : SlideInRight.duration(200)}
										 exiting={queryMember.length !== 0 ? SlideOutLeft.duration(200) : SlideOutRight.duration(200)}
										 key={queryMember.length !== 0 ? 'search' : 'add'}
										 className="flex-1 flex-col items-center mt-3 w-full">
				{
					queryMember.length !== 0 ? (
						!loading && members.length > 0 ? (
							<BottomSheetFlatList
								data={members}
								onMagicTap={() => Keyboard.dismiss()}
								keyboardShouldPersistTaps="handled"
								keyboardDismissMode="on-drag"
								keyExtractor={(_, index) => index.toString()}
								contentContainerStyle={{flexGrow: 1, paddingBottom: 5}}
								renderItem={({ item: member, index }) => (
									<>
										<Pressable onPress={() => handleAddMember(member)} className="pr-1 h-12" key={index}>
											{ renderItemMember(member) }
										</Pressable>
										{
											index < members.length - 1 && (
												<View className="bg-slate-200 w-full my-3 h-0.5"/>
											)
										}
									</>
								)
							}/>
						) : (!loading && members.length === 0) && (
							<View className="mt-4 flex-1">
								<P size={15} weight="semibold" className="text-center mb-1">Aucun membre ne correspond</P>
								<P size={15} weight="semibold" className="text-center">à votre recherche</P>
							</View>
						)
					) : (
						<>
							{
								renderItemMember({
									uid: user.uid,
									firstname: user.firstname,
									lastname: user.lastname,
									email: user.email,
									avatarID: user.avatarID,
									role: MemberRole.ADMIN
								})
							}
							<Animated.View exiting={FadeOutLeft.duration(200)} className="w-full h-0.5 bg-slate-200 mt-4 mb-4"/>
							{
								!loadBottomSheet && tmpMembers.length === 0 && (
									<View className="mt-4">
										<P size={15} weight="semibold" className="text-center mb-1">
											Vous n'avez encore aucun membre
										</P>
										<P size={15} weight="semibold" className="text-center mb-1">
											associé à ce projet
										</P>
									</View>
								)
							}
							<View style={{maxHeight: keyboardOpened ? height - keyBoardHeight : height - 404}}>
								{
									loadBottomSheet ? (
										<ActivityIndicator size="large" color={theme.primary} className="mt-4"/>
									) : (
										<BottomSheetFlatList
											data={loadBottomSheet ? [] : tmpMembers}
											extraData={memberRemoved}
											onMagicTap={() => Keyboard.dismiss()}
											contentContainerStyle={{flexGrow: 1}}
											keyboardShouldPersistTaps="handled"
											keyExtractor={(item) => item.uid!.toString()}
											renderItem={({ item, index }) => (
												<>
													<ReanimatedSwipeable
														ref={(ref) => {
															swipeableRef.current[index] = ref;
														}}
														key={item.uid}
														overshootFriction={8}
														rightThreshold={40}
														renderRightActions={(progressAnimatedValue, dragAnimatedValue) =>
															renderRightActions(progressAnimatedValue, dragAnimatedValue, index)
														}
													>
														<Animated.View exiting={FadeOutLeft.duration(200)} className="flex-row bg-white rounded-2xl w-full justify-between">
															{
																renderItemMember(item)
															}
														</Animated.View>
													</ReanimatedSwipeable>
												</>
											)}
										/>
									)
								}
							</View>
						</>
					)
				}
			</Animated.View>
			{
				queryMember.length === 0 && (
					<KeyboardStickyView>
						<Animated.View key={queryMember.length} entering={SlideInDown} exiting={SlideOutDown}>
							<View className="mt-auto bg-white pb-4">
								<View className="bg-slate-200 w-full h-0.5"/>
								<View className="flex-row w-full">
									<Button
										textSize={17}
										className="py-3.5 px-8 w-full mt-4 mr-3 justify-center items-center"
										textClass="text-center"
										onPress={handleClose}>
										{
											loadingAdd ? <ActivityIndicator color="#334155" size={20}/> : 'Fermer'
										}
									</Button>
								</View>
							</View>
						</Animated.View>
					</KeyboardStickyView>
				)
			}
		</View>
	)
}

export default CreateProjectAddMembers;
