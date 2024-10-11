import React from 'react';
import { Dimensions, View } from 'react-native';
import { RootStackPropsGuest } from '@Type/stack';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import ScreenLayout from '@Component/layouts/screen.layout';
import Gradient from '@Component/ui/gradient';
import Button from '@Component/ui/button';
import P from '@Component/ui/text';

const HomeScreen = ({ navigation }: RootStackPropsGuest<'Home'>) => {
  const { width } = Dimensions.get('screen');

  return (
    <ScreenLayout className="px-4" statusBarStyle="light-content" insetTop insetBottom>
      <Gradient/>
      <View className="flex-1 justify-center w-full">
        <Animated.View entering={FadeInDown.delay(500)}>
          <P light size={60} className="font-title text-center">Trello</P>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(500)}>
          <P light size={24} weight="semibold" className="text-center mb-1.5">Trello rassemble vos tâches,</P>
          <P light size={24} weight="semibold" className="text-center">vos coéquipiers et vos outils</P>
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(400).delay(500)} className="mt-16 items-center">
          <FastImage source={require('@Asset/img/bg.webp')} className="h-72" style={{width: width - 80}}/>
        </Animated.View>
        <Animated.View entering={SlideInDown.duration(500).delay(500)} className="w-full flex-col gap-3 mt-8 px-4">
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
      </View>
    </ScreenLayout>
  );
}

export default HomeScreen;
