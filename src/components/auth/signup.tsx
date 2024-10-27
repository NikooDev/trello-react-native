import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Keyboard, Pressable, TextInput, View } from 'react-native';
import { theme } from '@Asset/theme/default';
import { isEmail } from '@Util/constants';
import { setLoginError, setLoginSuccess } from '@Store/reducers/auth.reducer';
import FastImage from 'react-native-fast-image';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';
import { SignupInterface } from '@Type/auth';
import { RootStackGuestNavigation } from '@Type/stack';
import { signInWithGoogle, signup } from '@Action/auth.action';
import { random } from '@Util/functions';
import { useDispatch } from 'react-redux';
import { twMerge } from 'tailwind-merge';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import P from '@Component/ui/text';
import Button from '@Component/ui/button';

const Signup = ({ navigation }: RootStackGuestNavigation) => {
  const [user, setUser] = useState<SignupInterface>({ firstname: '', lastname: '', email: '', password: '', avatarID: '' });
  const [focus, setFocus] = useState({firstname: false, lastname: false, email: false, password: false});
  const [valid, setValid] = useState<boolean>(false);
  const [avatarID, setAvatarID] = useState<string>('');
  const [avatarErrorTimer, setAvatarErrorTimer] = useState(30);
  const [avatarErrorTimerActive, setAvatarErrorTimerActive] = useState(false);
  const [avatarTimerStarted, setAvatarTimerStarted] = useState(false);
  const [avatarMode, setAvatarMode] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loadingAvatar, setLoadingAvatar] = useState<boolean>(false);
  const [loadingGoogle, setLoadingGoogle] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { width, height } = Dimensions.get('screen');
  const dispatch = useDispatch();

  const inputRefs = {
    firstnameRef: useRef<TextInput>(null),
    lastnameRef: useRef<TextInput>(null),
    emailRef: useRef<TextInput>(null),
    passwordRef: useRef<TextInput>(null)
  };

  const { firstnameRef, lastnameRef, emailRef, passwordRef } = inputRefs;

  useEffect(() => {
    if (user.firstname.length > 0 && user.lastname.length > 0 && user.email.length > 0 && user.password.length > 0) {
      setValid(true);
    } else {
      setValid(false);
    }
  }, [user])

  const handleChange = (name: 'firstname' | 'lastname' | 'email' | 'password', value: string) => {
    setUser({...user, [name]: value});
  }

  const handleFocus = (name: 'firstname' | 'lastname' | 'email' | 'password') => {
    setFocus({...focus, [name]: true});
  }

  const handleBlur = () => {
    setFocus({firstname: false, lastname: false, email: false, password: false});
  }

  const handleNext = (nextRef: React.RefObject<TextInput>) => {
    if (nextRef.current) {
      nextRef.current.focus();
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  }

  const handleRandomAvatarID = useCallback(() => {
    if (loadingAvatar || avatarErrorTimerActive) return;

    setLoadingAvatar(true);
    const randomAvatarID = random();

    setAvatarID(randomAvatarID);
  }, [loadingAvatar, avatarErrorTimerActive]);

  const handleAvatarReady = () => {
    setLoadingAvatar(false);
  }

  const loadAvatar = useCallback(() => {
    if (!avatarID) {
      handleRandomAvatarID();
    }
  }, [avatarMode, avatarID]);

  useEffect(() => loadAvatar(), [loadAvatar]);

  const handleAvatarError = () => {
    if (!avatarErrorTimerActive) {
      Alert.alert('Erreur de chargement', `Vous avez actualisé trop de fois. Veuillez réessayer dans 30 secondes.`, [{text: 'Ok'}]);
      setAvatarErrorTimerActive(true);
      setAvatarTimerStarted(true);
    }
  }

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (avatarErrorTimerActive) {
      setAvatarID('');
      interval = setInterval(() => {
        setAvatarErrorTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            setAvatarErrorTimerActive(false);
            return 30;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [avatarErrorTimerActive, avatarErrorTimer]);

  useEffect(() => {
    if (!avatarErrorTimerActive && avatarTimerStarted) {
      handleRandomAvatarID();
      setAvatarTimerStarted(false);
    }
  }, [avatarErrorTimerActive, avatarTimerStarted, handleRandomAvatarID]);

  const handleBack = () => {
    if (avatarMode) {
      setAvatarMode(false);
    } else {
      navigation.goBack();
    }
  }

  const handleSubmit = async () => {
    if (user.firstname.length === 0 && firstnameRef.current) {
      firstnameRef.current.focus();
    } else if (user.lastname.length === 0 && lastnameRef.current) {
      lastnameRef.current.focus();
    } else if (user.email.length === 0 && emailRef.current) {
      emailRef.current.focus();
    } else if (user.password.length === 0 && passwordRef.current) {
      passwordRef.current.focus();
    }

    if (!loading && valid) {
      if (user.email && !user.email.match(isEmail)) {
        return Alert.alert('Adresse e-mail incorrecte', `Votre adresse e-mail\n"${user.email}"est incorrecte.`, [{
          onPress: () => emailRef.current?.focus()
        }]);
      } else {
        Keyboard.dismiss();

        if (valid && !avatarMode) {
          setAvatarMode(true);
        }

        if (valid && avatarMode) {
          setLoading(true);

          if (avatarID.length === 0 || loadingAvatar) {
            setLoading(false);
            return Alert.alert('Avatar manquant', 'Veuillez choisir un avatar.', [{text: 'Ok'}]);
          }

          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const token = await signup({ ...user, avatarID });

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

            Alert.alert('Erreur lors de votre inscription', errorMessage, [
              { text: 'OK', onPress: () => setAvatarMode(false) }
            ]);
          }
        }
      }
    }
  }

  const handleSignInGoogle = async () => {
    setLoadingGoogle(true);

    setTimeout(async () => {
      const loginGoogle = await signInWithGoogle();

      if (!loginGoogle) {
        setLoadingGoogle(false);
      }
    }, 500);
  }

  return (
    <>
      {
        loadingGoogle && (
          <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} className="bg-black/70 absolute left-0 top-0 right-0 bottom-0 z-50 items-center justify-center">
            <ActivityIndicator color="#fff" size={50} className="absolute"/>
          </Animated.View>
        )
      }
      <KeyboardAwareScrollView extraKeyboardSpace={-100} keyboardShouldPersistTaps="handled" contentContainerStyle={{flex: 1, justifyContent: 'center'}}>
        <View>
          <Animated.View entering={FadeInUp.duration(500)} className="absolute left-1/2" style={{marginLeft: -(width - 90) / 2.3, top: -(height * 0.25)}}>
            <FastImage source={require('@Asset/img/signup.webp')} className="h-52 opacity-50" resizeMode="contain" style={{width: width - 90}}/>
          </Animated.View>
          <View className="mb-10 mt-5">
            <View className="self-start absolute top-2.5 z-20">
              <Button onPress={handleBack}
                      children={null}
                      textSize={0}
                      textLight={true}
                      color="none"
                      iconSize={40}
                      icon="chevron-back-outline"
                      className="mt-4 ml-4"/>
            </View>
            <P size={60} light className="font-title text-6xl text-center">Trello</P>
            <P size={24} light className="font-title text-2xl text-center -mt-2">Inscription</P>
          </View>
          <Animated.View pointerEvents="auto"
                         className="px-4"
                         entering={!avatarMode ? SlideInLeft.duration(300) : SlideInRight.duration(300)}
                         exiting={!avatarMode ? SlideOutLeft.duration(300) : SlideOutRight.duration(300)}
                         key={!avatarMode ? 'signup' : 'avatar'}>
            {
              !avatarMode ? (
                <Animated.View entering={FadeInDown}>
                  <View className="flex-row gap-3">
                    <View className={twMerge('bg-[#0000003f] border-[#0000001f] rounded-2xl border mb-3 flex-1', focus.firstname && 'bg-[#0000005f] border-[#0000003f]')}>
                      <TextInput ref={firstnameRef}
                                 keyboardType="default"
                                 placeholder="Prénom"
                                 placeholderTextColor="#ffffff8f"
                                 returnKeyType="next"
                                 autoComplete="given-name"
                                 textContentType="name"
                                 textAlignVertical="center"
                                 autoCorrect={false}
                                 spellCheck={false}
                                 className="font-text-regular text-lg px-4 text-white h-14 capitalize"
                                 value={user.firstname ? user.firstname.toString() : ''}
                                 onFocus={() => handleFocus('firstname')}
                                 onBlur={handleBlur}
                                 onSubmitEditing={() => handleNext(lastnameRef)}
                                 onChangeText={(value) => handleChange('firstname', value)}/>
                    </View>
                    <View className={twMerge('bg-[#0000003f] border-[#0000001f] rounded-2xl border mb-3 flex-1', focus.lastname && 'bg-[#0000005f] border-[#0000003f]')}>
                      <TextInput ref={lastnameRef}
                                 keyboardType="default"
                                 placeholder="Nom"
                                 placeholderTextColor="#ffffff8f"
                                 returnKeyType="next"
                                 autoComplete="family-name"
                                 textContentType="name"
                                 textAlignVertical="center"
                                 autoCorrect={false}
                                 spellCheck={false}
                                 className="font-text-regular text-lg px-4 text-white h-14 capitalize"
                                 value={user.lastname ? user.lastname.toString() : ''}
                                 onFocus={() => handleFocus('lastname')}
                                 onBlur={handleBlur}
                                 onSubmitEditing={() => handleNext(emailRef)}
                                 onChangeText={(value) => handleChange('lastname', value)}/>
                    </View>
                  </View>
                  <View className={twMerge('bg-[#0000003f] border-[#0000001f] rounded-2xl border mb-3', focus.email && 'bg-[#0000005f] border-[#0000003f]')}>
                    <TextInput ref={emailRef}
                               keyboardType="email-address"
                               placeholder="Adresse e-mail"
                               placeholderTextColor="#ffffff8f"
                               returnKeyType="next"
                               textContentType="emailAddress"
                               textAlignVertical="center"
                               autoComplete="email"
                               autoCapitalize="none"
                               autoCorrect={false}
                               spellCheck={false}
                               className="font-text-regular text-lg px-4 text-white h-14"
                               value={user.email ? user.email.toString() : ''}
                               onFocus={() => handleFocus('email')}
                               onBlur={handleBlur}
                               onSubmitEditing={() => handleNext(passwordRef)}
                               onChangeText={(value) => handleChange('email', value)}/>
                  </View>
                  <View className={twMerge('bg-[#0000003f] border-[#0000001f] rounded-2xl border mb-3', focus.password && 'bg-[#0000005f] border-[#0000003f]')}>
                    <TextInput ref={passwordRef}
                               keyboardType="default"
                               placeholder="Mot de passe"
                               placeholderTextColor="#ffffff8f"
                               returnKeyType="done"
                               textContentType="password"
                               textAlignVertical="center"
                               secureTextEntry={!showPassword}
                               autoCorrect={false}
                               className="font-text-regular text-lg pl-4 text-white h-14 pr-16"
                               value={user.password ? user.password.toString() : ''}
                               onFocus={() => handleFocus('password')}
                               onBlur={handleBlur}
                               onSubmitEditing={valid ? handleSubmit : () => null}
                               onChangeText={(value) => handleChange('password', value)}/>
                    <Button onPress={handleShowPassword} textSize={0} icon={showPassword ? 'eye-off' : 'eye'} iconSize={28} color="none" iconColor="#fff" children={null} className="absolute top-3 right-4"/>
                  </View>
                  <View className="mt-4">
                    <Button className="w-full h-14 bg-white justify-center items-center"
                            textClass="uppercase flex-row items-center text-primary"
                            textSize={18}
                            disabled={loading}
                            onTouchStart={handleSubmit}>
                      Suivant
                    </Button>
                    <Pressable onPress={handleSignInGoogle} className="flex-row rounded-2xl w-full h-14 bg-white self-auto mt-4 justify-between items-center">
                      <FastImage source={require('@Asset/img/google.webp')} className="h-8 w-8 ml-4"/>
                      <P size={18} weight="semibold" className="text-center flex-1 uppercase">S'inscrire avec Google</P>
                    </Pressable>
                  </View>
                </Animated.View>
              ) : (
                <Animated.View entering={FadeInDown.delay(300)} className="items-center mb-7">
                  <View style={{height: 150, width: 150}} className="mb-4 items-center justify-center border-2 border-white rounded-full">
                    {
                      loadingAvatar && (
                        <View key={loadingAvatar ? 'loading' : 'loaded'}
                              className="absolute bg-white/30 rounded-full items-center justify-center" style={{height: 150, width: 150}}>
                          <ActivityIndicator color="#fff" size="large" className="absolute"/>
                        </View>
                      )
                    }
                    {
                      avatarErrorTimerActive && (
                        <View className="items-center justify-center absolute top-1.5" style={{height: 150, width: 150}}>
                          <P size={60} className="font-title" light>{ avatarErrorTimer }</P>
                        </View>
                      )
                    }
                    <FastImage source={{uri: `https://api.multiavatar.com/${avatarID}.png?apiKey=3xbMDRlBuYdc8T`}}
                               className="rounded-full border-2 border-white"
                               onLoadEnd={handleAvatarReady}
                               onError={handleAvatarError}
                               style={{height: 150, width: 150}}/>
                  </View>
                  <View className="flex-row w-full gap-3 mt-5">
                    <Button color="none"
                            className="h-14 border border-white justify-center items-center px-4"
                            textClass="text-center uppercase flex-row items-center"
                            textSize={15}
                            iconClass="mb-1"
                            textLight
                            disabled={loading}
                            icon="refresh"
                            iconColor="#fff"
                            iconSize={24}
                            onTouchStart={() => handleRandomAvatarID()}>Changer d'avatar</Button>
                    <Button className="h-14 bg-white justify-center items-center flex-1"
                            textClass="text-center uppercase flex-row items-center text-primary"
                            textSize={18}
                            disabled={loading}
                            onTouchStart={handleSubmit}>{
                      loading ? (
                        <ActivityIndicator color={theme.primary} size={24}/>
                      ) : 'S\'inscrire'
                    }
                    </Button>
                  </View>
                </Animated.View>
              )
            }
          </Animated.View>
        </View>
      </KeyboardAwareScrollView>
      <View className="mb-5 px-4">
        <Button color="none"
                className="w-full py-4 border border-white self-auto"
                textClass="text-center"
                textLight
                textSize={18}
                onPress={() => navigation.navigate('Auth', { isLogin: true })}>J'ai déjà un compte</Button>
      </View>
    </>
  );
}

export default Signup;
