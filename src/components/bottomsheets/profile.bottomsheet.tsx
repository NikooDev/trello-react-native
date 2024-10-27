import React from 'react';
import { Pressable } from 'react-native';
import P from '@Component/ui/text';
import useAuth from '@Hook/useAuth';

const ProfileBottomsheet = () => {
  const { logout } = useAuth();

  return (
   <Pressable onPress={logout}>
     <P size={24}>Déconnexion</P>
   </Pressable>
  );
}

export default ProfileBottomsheet;
