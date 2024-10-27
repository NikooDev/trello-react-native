import React, { useState } from 'react';
import { RootStackPropsGuest } from '@Type/stack';
import Animated, { runOnJS, SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';
import { GestureDetector, Gesture, Directions } from 'react-native-gesture-handler';
import ScreenLayout from '@Component/layouts/screen.layout';
import Gradient from '@Component/ui/gradient';
import Login from '@Component/auth/login';
import Signup from '@Component/auth/signup';
import useScreen from '@Hook/useScreen';

const AuthScreen = ({ navigation, route }: RootStackPropsGuest<'Auth'>) => {
  const [gestureStartY, setGestureStartY] = useState<number>(0);
  const [gestureStartX, setGestureStartX] = useState<number>(0);
  const { isLogin } = route.params as { isLogin: boolean };

  useScreen('light-content');

  /**
   * @description Redirect to login or signup screen
   * @param isLogin
   */
  const handleRedirect = (isLogin: boolean) => {
    navigation.navigate('Auth', { isLogin });
  }

  /**
   * @description Fling back gesture to switch between login and signup
   */
  const flingBackGesture = Gesture.Fling()
  .direction(Directions.LEFT | Directions.RIGHT)
  .onBegin((event) => {
    runOnJS(setGestureStartY)(event.absoluteY);
    runOnJS(setGestureStartX)(event.absoluteX);
  })
  .onStart((event) => {
    const deltaY = event.absoluteY - gestureStartY;
    const deltaX = event.absoluteX - gestureStartX;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
      if (deltaX > 0) {
        runOnJS(handleRedirect)(true);
      } else {
        runOnJS(handleRedirect)(false);
      }
    }
  }).runOnJS(true);

  return (
    <ScreenLayout>
      <Gradient/>
      <GestureDetector gesture={flingBackGesture}>
        <Animated.View pointerEvents="auto"
                       className="flex-1 z-10"
                       entering={isLogin ? SlideInLeft.duration(300) : SlideInRight.duration(300)}
                       exiting={isLogin ? SlideOutLeft.duration(300) : SlideOutRight.duration(300)}
                       key={isLogin ? 'login' : 'signup'}>
          {
            isLogin ? (
              <Login navigation={navigation}/>
            ) : (
              <Signup navigation={navigation}/>
            )
          }
        </Animated.View>
      </GestureDetector>
    </ScreenLayout>
  );
}

export default AuthScreen;
