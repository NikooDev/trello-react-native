import React from 'react';
import { ParagraphInterface } from '@Type/ui';
import { Text } from 'react-native';
import { twMerge } from 'tailwind-merge';

const P: React.FC<ParagraphInterface> = ({
	children,
	className,
	style,
	size = 15,
	numberOfLines = 1,
	weight = 'regular',
	light = false
}) => {
	const lightClass = light ? 'text-white/90' : 'text-slate-700';

	const weightStyle = (): string => {
		let weightClass: string;

		switch (weight) {
			case 'light':
				weightClass = 'font-text-light';
				break;
			case 'regular':
				weightClass = 'font-text-regular';
				break;
			case 'semibold':
				weightClass = 'font-text-semibold';
				break;
			case 'bold':
				weightClass = 'font-text-bold';
				break;
			default:
				weightClass = 'font-text-regular';
				break;
		}

		return weightClass;
	}

  return (
		<Text numberOfLines={numberOfLines} className={twMerge(weightStyle(), lightClass, className)} style={[style, {fontSize: size, lineHeight: size + 3}]}>
			{ children }
		</Text>
  );
}

export default P;
