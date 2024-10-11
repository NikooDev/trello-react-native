import React, { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { theme } from '@Asset/theme/trello';

const loadComponent = (componentName: string | null) => {
	switch (componentName) {
		case 'Home':
			return lazy(() => import('@Component/bottomsheets/HomeOptions'));
		case 'Projects':
			return lazy(() => import('@Component/bottomsheets/ProjectsOptions'));
		case 'Calendar':
			return lazy(() => import('@Component/bottomsheets/CalendarOptions'));
		case 'Profile':
			return lazy(() => import('@Component/bottomsheets/ProjectsOptions'));
		case 'CreateProjectCovers':
			return lazy(() => import('@Component/bottomsheets/CreateProjectCovers'));
		case 'CreateProjectAddMembers':
			return lazy(() => import('@Component/bottomsheets/CreateProjectAddMembers'));
		default:
			return null;
	}
};

const LayoutBottomsheet = ({ componentName }: { componentName: string | null }) => {
	const LazyComponent = componentName ? loadComponent(componentName) : null;

	return (
		<Suspense fallback={<ActivityIndicator size="large" className="mt-10" color={theme.primary} />}>
			<View className="flex-1">
				{ LazyComponent ? <LazyComponent /> : null }
			</View>
		</Suspense>
	);
}

export default LayoutBottomsheet;
