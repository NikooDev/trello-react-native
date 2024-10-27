import React from 'react';
import { View } from 'react-native';
import ScreenLayout from '@Component/layouts/screen.layout';
import useScreen from '@Hook/useScreen';

const ChatScreen = () => {
  useScreen('light-content');

  return (
   <ScreenLayout>
     <View>

     </View>
   </ScreenLayout>
  );
}

export default ChatScreen;
