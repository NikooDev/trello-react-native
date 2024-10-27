import React, { createContext, useEffect, useMemo, useRef, PropsWithChildren, useCallback } from 'react';
import { RootStateType } from '@Type/store';
import { Keyboard } from 'react-native';
import { BottomSheetStyles } from '@Util/constants';
import { closeBottomSheet } from '@Store/reducers/app.reducer';
import { Easing } from 'react-native-reanimated';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import LayoutBottomsheet from '@Component/layouts/bottomsheet.layout';

export const BottomSheetContext = createContext({});

/**
 * @description BottomSheetProvider
 * @param children
 * @constructor
 */
const BottomSheetProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const { height, open, name, enablePanDownToClose, handleStyle } = useSelector((state: RootStateType) => state.app.bottomSheet, shallowEqual);
	const snapPoints = useMemo(() => [height+'%'], [height]);
	const bottomSheetRef = useRef<BottomSheet>(null);
	const dispatch = useDispatch();

	useEffect(() => {
		if (!bottomSheetRef.current) return;

		if (open) {
			bottomSheetRef.current.collapse();
		} else {
			Keyboard.dismiss();
			bottomSheetRef.current.close();
		}
	}, [open]);

	const renderBackdrop = useMemo(
		() => (props: BottomSheetBackdropProps) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={-1}
				appearsOnIndex={0}
				onPress={() => dispatch(closeBottomSheet({}))}/>
		), [dispatch]
	);

	return (
		<BottomSheetContext.Provider value={{}}>
			{ children }
			<BottomSheet ref={bottomSheetRef}
									 onClose={() => dispatch(closeBottomSheet({}))}
									 enablePanDownToClose={enablePanDownToClose}
									 handleStyle={{display: handleStyle ? 'flex' : 'none'}}
									 animationConfigs={{ duration: 250, easing: Easing.out(Easing.quad) }}
									 backdropComponent={renderBackdrop}
									 snapPoints={snapPoints}
									 {...BottomSheetStyles}>
				<LayoutBottomsheet componentName={name}/>
			</BottomSheet>
		</BottomSheetContext.Provider>
	)
}

export default BottomSheetProvider;
