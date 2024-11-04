import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import P from '@Component/ui/text';
import useAuth from '@Hook/useAuth';
import Class from 'classnames';

const ProfileBottomsheet = () => {
  const [press, setPress] = useState<boolean[]>([false, false]);
  const { logout } = useAuth();

  const handleFocus = (index: number) => {
    const updatedPress = [...press];
    updatedPress[index] = true;
    setPress(updatedPress);
  }

  const handleLogout = async (index: number) => {
    handleRelease(index);
    await logout();
  }

  const handleUpdateProfil = (index: number) => {
    handleRelease(index);
  }

  const handleRelease = (index: number) => {
    const updatedPress = [...press];
    updatedPress[index] = false;
    setPress(updatedPress);
  };

  return (
    <View className="mt-4">
      <Pressable onPressIn={() => handleFocus(0)} onPressOut={() => handleUpdateProfil(0)} style={{height: 55}} className={Class('flex-row items-center px-4 pb-3 gap-3 mb-3', press[0] && 'bg-slate-200')}>
        <View className={Class('rounded-full h-10 w-10 justify-center items-center pl-1 bg-slate-300')}>
          <Icon name="create" color="#334155" size={24}/>
        </View>
        <P size={17} weight="semibold" className="text-slate-700" style={{lineHeight: 19}}>Modifier mon profil</P>
      </Pressable>
      <Pressable onPressIn={() => handleFocus(1)} onPressOut={() => handleLogout(1)} style={{height: 55}} className={Class('flex-row items-center px-4 pb-3 gap-3', press[1] && 'bg-slate-200')}>
        <View className={Class('rounded-full h-10 w-10 justify-center items-center pl-1 bg-slate-300')}>
          <Icon name="log-out" color="#334155" size={24}/>
        </View>
        <P size={17} weight="semibold" className="text-slate-700" style={{lineHeight: 19}}>Se déconnecter</P>
      </Pressable>
    </View>
  );
}

export default ProfileBottomsheet;
