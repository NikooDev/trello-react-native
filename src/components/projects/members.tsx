import React from 'react';
import { TextInput, View } from 'react-native';
import { openBottomSheet } from '@Store/reducers/app.reducer';
import { MembersManagerInterface } from '@Type/project';
import { useDispatch } from 'react-redux';
import Avatar from '@Component/ui/avatar';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '@Asset/theme/default';

const Members: React.FC<MembersManagerInterface> = ({
  members
}) => {
  const dispatch = useDispatch();

  const handleSearchMembers = () => {
    dispatch(openBottomSheet({
      enablePanDownToClose: false,
      handleStyle: false,
      name: 'AddMembers',
      height: 100
    }));
  }

  return (
    <View>
      <TextInput className="bg-white border border-slate-200 h-14 pr-4 pl-12 font-text-regular text-base text-black/80 rounded-2xl"
                 textContentType="oneTimeCode"
                 placeholder={members.length > 0 ? '' : 'Adresse email ou nom et prénom'}
                 placeholderTextColor="#cbd5e1"
                 cursorColor="#0000008f"
                 value=""
                 defaultValue=""
                 autoComplete="off"
                 textAlignVertical="center"
                 showSoftInputOnFocus={false}
                 onFocus={handleSearchMembers}/>
      <View className="flex-row items-center w-full ml-1.5" style={{marginTop: members.length < 10 ? -48 : -46}}>
        {
          members.length > 0 && members.map((member, index) => (
            <Avatar size={36} key={index} avatarID={member.avatarID} className="-mr-3"/>
          ))
        }
        {
          members.length < 10 && (
            <View className="flex-row items-center">
              <Icon name="add-circle" color={theme.primary} size={40}/>
            </View>
          )
        }
      </View>
    </View>
  );
}

export default Members;
