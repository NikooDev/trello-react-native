import React, { useEffect, useState } from 'react';
import { AvatarInterface } from '@Type/ui';
import { ActivityIndicator, View } from 'react-native';
import { theme } from '@Asset/theme/default';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import Class from 'classnames';

const Avatar: React.FC<AvatarInterface> = ({
	size = 45,
	className,
	style,
	avatarID
}) => {
	const [avatarURI, setAvatarURI] = useState<string | null>(null);
	const [isError, setIsError] = useState(false);
	const [loading, setLoading] = useState(true);
	const viewSize = { height: size, width: size };

	useEffect(() => {
		setLoading(true);

		if (avatarID) {
			if (avatarID.startsWith('https://')) {
				setAvatarURI(avatarID);
			} else {
				setAvatarURI(`https://api.multiavatar.com/${avatarID}.png?apiKey=3xbMDRlBuYdc8T`);
			}
		}
	}, [avatarID])

	const onLoadStart = () => {
		setLoading(true);
	}

	const onLoadEnd = () => {
		setLoading(false);
	}

	const handleError = () => {
		setIsError(true);
	}

	return (
		<View className={Class('relative justify-center', className)} style={[style, viewSize]}>
			{
				avatarURI && !isError && (
					<FastImage source={{uri: avatarURI}}
										 resizeMode="contain"
										 onLoadEnd={onLoadEnd}
										 onError={handleError}
										 onLoadStart={onLoadStart}
										 className="bg-white rounded-full border-2 border-white"
										 style={viewSize}/>
				)
			}
			{
				isError && (
					<View className="bg-slate-200 rounded-full border-2 items-center justify-center border-white pb-0.5 top-0 left-0 absolute" style={viewSize}>
						<Icon name="person" size={size - 24} color="#475569"/>
					</View>
				)
			}
			{
				loading && (
					<View className="bg-white items-center justify-center rounded-full absolute" style={viewSize}>
						<ActivityIndicator size={size < 50 ? 'small' : 'large'} color={theme.primary}/>
					</View>
				)
			}
		</View>
	);
}

export default Avatar;
