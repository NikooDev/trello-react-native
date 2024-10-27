import React from 'react';
import { View } from 'react-native';
import ScreenLayout from '@Component/layouts/screen.layout';
import useScreen from '@Hook/useScreen';

const HomeScreen = () => {
  useScreen('dark-content');

  return (
   <ScreenLayout>
     <View>

     </View>
   </ScreenLayout>
  );
}

export default HomeScreen;
