import React from 'react';
import { View, Pressable } from 'react-native';
import { shadowButton } from '@Asset/theme/trello';
import Icon from 'react-native-vector-icons/Ionicons';
import { FloatButtonsInterface } from '@Type/ui';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import P from '@Component/ui/text';

const FloatButtons: React.FC<FloatButtonsInterface> = ({
	handleActionButton,
	buttonCreateProject,
	buttonMessagerie,
	badgeChat
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
			 <View className="absolute top-0 left-10">
				 {
					 badgeChat > 0 && (
						 <Animated.View entering={ZoomIn.duration(150)} exiting={ZoomOut.duration(150)} key={badgeChat > 0 ? '1' : '0'} className="bg-red-500 border-2 border-white rounded-full" style={{...shadowButton, paddingHorizontal: 5, paddingBottom: 2.5, paddingTop: 1}}>
							 <P size={10} light weight="bold">{ badgeChat }</P>
						 </Animated.View>
					 )
				 }
			 </View>
		 </Animated.View>
   </>
  );
}

export default FloatButtons;
