import React from 'react';
import { View, Pressable } from 'react-native';
import { shadowButton } from '@Asset/theme/trello';
import Icon from 'react-native-vector-icons/Ionicons';
import { FloatButtonsInterface } from '@Type/ui';
import Animated from 'react-native-reanimated';
import P from '@Component/ui/text';

const FloatButtons: React.FC<FloatButtonsInterface> = ({
	handleActionButton,
	buttonCreateProject,
	buttonMessagerie
}) => {
  return (
   <>
		 <Animated.View style={buttonCreateProject}>
			 <Pressable onPress={() => handleActionButton('CreateProject')} className="w-14 h-14 bg-sky-500 border-4 border-white items-center justify-center rounded-full" style={shadowButton}>
				 <Icon name="layers" size={24} color="#FFF" />
			 </Pressable>
		 </Animated.View>
		 <Animated.View style={buttonMessagerie}>
			 <Pressable onPress={() => handleActionButton('Chat')} className="w-14 h-14 bg-primary border-4 border-white items-center justify-center rounded-full" style={shadowButton}>
				 <Icon name="chatbubble-ellipses" size={24} color="#FFF" />
			 </Pressable>
			 <View className="absolute bottom-0 left-10">
				 <View className="bg-red-500 border-2 border-white py-0.5 pb-1 rounded-full" style={{...shadowButton, paddingHorizontal: 7}}>
					 <P size={12} light weight="bold">1</P>
				 </View>
			 </View>
		 </Animated.View>
   </>
  );
}

export default FloatButtons;
