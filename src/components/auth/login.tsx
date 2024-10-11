import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Keyboard, TextInput, View } from 'react-native';
import { setLoginError, setLoginSuccess } from '@Store/reducers/auth.reducer';
import { isEmail } from '@Util/constants';
import FastImage from 'react-native-fast-image';
import { theme } from '@Asset/theme/trello';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { RootStackGuestNavigation } from '@Type/stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useDispatch } from 'react-redux';
import { signIn } from '@Action/auth.action';
import { twMerge } from 'tailwind-merge';
import Button from '@Component/ui/button';
import P from '@Component/ui/text';

const Login = ({ navigation }: RootStackGuestNavigation) => {
	const [user, setUser] = useState({email: '', password: ''});
	const [focus, setFocus] = useState({email: false, password: false});
	const [valid, setValid] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const { width, height } = Dimensions.get('screen');
	const dispatch = useDispatch();

	const emailRef = useRef<TextInput>(null);
	const passwordRef = useRef<TextInput>(null);

	useEffect(() => {
		if (user.email.length > 0 && user.password.length > 0) {
			setValid(true);
		} else {
			setValid(false);
		}
	}, [user])

	const handleChange = (name: 'email' | 'password', value: string) => {
		setUser({...user, [name]: value});
	}

	const handleFocus = (name: 'email' | 'password') => {
		setFocus({...focus, [name]: true});
	}

	const handleBlur = () => {
		setFocus({email: false, password: false});
	}

	const handleNext = () => {
		if (passwordRef.current) {
			passwordRef.current!.focus();
		}
	}

	const handleSubmit = async () => {
		if (user.email.length === 0 && emailRef.current) {
			emailRef.current.focus();
		} else if (user.password.length === 0 && passwordRef.current) {
			passwordRef.current.focus();
		}

		if (!loading && valid) {
			if (!user.email.match(isEmail)) {
				Alert.alert('Votre adresse e-mail est incorrecte', '', [{
					onPress: () => emailRef.current?.focus()
				}]);

				return;
			} else {
				Keyboard.dismiss();
				setLoading(true);

				try {
					await new Promise(resolve => setTimeout(resolve, 1000));
					const token = await signIn(user);

					if (token) {
						dispatch(setLoginSuccess());
					}
				} catch (error) {
					let errorMessage = 'Une erreur inattendue s\'est produite.';

					if (error instanceof Error) {
						errorMessage = error.message;
					}

					dispatch(setLoginError());
					setLoading(false);

					Alert.alert('Erreur de connexion', errorMessage, [
						{ text: 'OK' }
					]);
				}
			}
		}
	}

  return (
   <>
		 <KeyboardAwareScrollView extraKeyboardSpace={-130} keyboardShouldPersistTaps="handled" contentContainerStyle={{flex: 1, justifyContent: 'center'}}>
			 <View>
				 <Animated.View entering={FadeInUp.duration(500)} className="absolute left-1/2" style={{marginLeft: -(width - 90) / 2, top: -(height * 0.25)}}>
					 <FastImage source={require('@Asset/img/login.webp')} className="h-52 opacity-50" resizeMode="contain" style={{width: width - 90}}/>
				 </Animated.View>
				 <View className="mb-10 mt-5">
					 <View className="self-start absolute top-2.5 z-20">
						 <Button onPress={() => navigation.goBack()}
										 children={null}
										 textSize={0}
										 textLight={true}
										 color="none"
										 iconSize={40}
										 icon="chevron-back-outline"
										 className="mt-4 ml-4"/>
					 </View>
					 <P size={60} light className="font-title text-6xl text-center">Trello</P>
					 <P size={24} light className="font-title text-2xl text-center -mt-2">Connexion</P>
				 </View>
				 <View className="px-4">
					 <View className={twMerge('bg-[#0000003f] border-[#0000001f] rounded-2xl border mb-3', focus.email && 'bg-[#0000005f] border-[#0000005f]')}>
						 <TextInput ref={emailRef}
												keyboardType="email-address"
												placeholder="Adresse e-mail"
												placeholderTextColor="#ffffff8f"
												returnKeyType="next"
												textContentType="emailAddress"
												textAlignVertical="center"
												autoCapitalize="none"
												autoCorrect={false}
												spellCheck={false}
												className="font-text-regular text-lg px-4 text-white h-14"
												onFocus={() => handleFocus('email')}
												onBlur={handleBlur}
												onSubmitEditing={handleNext}
												onChangeText={(value) => handleChange('email', value)}/>
					 </View>
					 <View className={twMerge('bg-[#0000003f] border-[#0000001f] rounded-2xl border mb-3', focus.password && 'bg-[#0000005f] border-[#0000005f]')}>
						 <TextInput ref={passwordRef}
												keyboardType="default"
												placeholder="Mot de passe"
												placeholderTextColor="#ffffff8f"
												returnKeyType="done"
												textContentType="password"
												textAlignVertical="center"
												secureTextEntry={true}
												autoCorrect={false}
												className="font-text-regular text-lg px-4 text-white h-14"
												onFocus={() => handleFocus('password')}
												onBlur={handleBlur}
												onSubmitEditing={valid ? handleSubmit : () => null}
												onChangeText={(value) => handleChange('password', value)}/>
					 </View>
					 <View className="mt-4">
						 <Button className="w-full h-14 bg-white justify-center items-center"
										 textClass="text-center uppercase flex-row items-center text-primary"
										 textSize={18}
										 disabled={loading}
										 onTouchStart={handleSubmit}>
							 {
								 loading ? (
									 <ActivityIndicator color={theme.primary} size={24}/>
								 ) : 'Se connecter'
							 }
						 </Button>
					 </View>
					 <View className="w-full mt-4">
						 <P size={16} light weight="semibold" className="text-center">Mot de passe oublié ?</P>
					 </View>
				 </View>
			 </View>
		 </KeyboardAwareScrollView>
		 <View className="mb-5 px-4">
			 <Button color="none"
							 className="w-full py-4 border border-white self-auto"
							 textClass="text-center"
							 textLight
							 textSize={18}
							 onPress={() => navigation.navigate('Auth', { isLogin: false })}>Créer un compte</Button>
		 </View>
   </>
  );
}

export default Login;
