import React from 'react';
import { View } from 'react-native';
import ScreenLayout from '@Component/layouts/screen.layout';
import { RootStackPropsUser } from '@Type/stack';
import P from '@Component/ui/text';

const ProjectScreen = ({ route, navigation } : RootStackPropsUser<'Project'>) => {
  const { uid } = route.params as { uid: string };

  return (
    <ScreenLayout>
      <View className="">
        <P size={23}>{uid}</P>
      </View>
    </ScreenLayout>
  );
}

export default ProjectScreen;
