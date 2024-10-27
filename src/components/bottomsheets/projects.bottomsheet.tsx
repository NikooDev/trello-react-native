import React from 'react';
import { View } from 'react-native';
import Priority from '@Component/projects/priority';
import { useSelector } from 'react-redux';
import { RootStateType } from '@Type/store';

const ProjectsBottomsheet = () => {
  const { sortPriority } = useSelector((state: RootStateType) => state.project);

  return (
   <View className="px-4 mt-2">
     <Priority sortPriority={sortPriority} enableTitle isToggle/>
   </View>
  );
}

export default ProjectsBottomsheet;
