import React, { useEffect } from 'react';
import { Dimensions, StatusBar } from 'react-native';
import { RootStackPropsGuest } from '@Type/stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import ScreenLayout from '@Component/layouts/screen.layout';
import Gradient from '@Component/ui/gradient';
import Button from '@Component/ui/button';
import P from '@Component/ui/text';
import useScreen from '@Hook/useScreen';

const HomeScreen = ({ navigation }: RootStackPropsGuest<'Home'>) => {
  const { width } = Dimensions.get('screen');
  const delayAnimation = 1000;

  useScreen('light-content');

  return (
    <ScreenLayout className="px-4 flex-col justify-center">
      <Gradient/>
      <Animated.View entering={FadeInDown.duration(400).delay(delayAnimation)}>
        <P light size={60} className="font-title text-center">Trello</P>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(400).delay(delayAnimation)}>
        <P light size={24} weight="semibold" className="text-center mb-1.5">Trello rassemble vos tâches,</P>
        <P light size={24} weight="semibold" className="text-center">vos coéquipiers et vos outils</P>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(400).delay(delayAnimation)} className="mt-16 items-center">
        <FastImage source={require('@Asset/img/bg.webp')} className="h-72" style={{width: width - 80}}/>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(500).delay(delayAnimation)} className="w-full flex-col gap-3 mt-8 px-4">
        <Button className="w-full py-4 bg-white"
                textClass="text-center uppercase text-primary"
                textSize={18}
                onPress={() => navigation.navigate('Auth', { isLogin: true })}>Se connecter</Button>
        <Button color="none"
                className="w-full py-4 border border-white self-auto"
                textClass="text-center uppercase"
                textLight
                textSize={18}
                onPress={() => navigation.navigate('Auth', { isLogin: false })}>S'inscrire</Button>
      </Animated.View>
    </ScreenLayout>
  );
}

export default HomeScreen;
