import React, { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { theme } from '@Asset/theme/trello';

const loadComponent = (componentName: string | null) => {
	switch (componentName) {
		case 'Project':
			return lazy(() => import('@Component/bottomsheets/projectSettings'));
		case 'Projects':
			return lazy(() => import('@Component/bottomsheets/projectsOptions'));
		case 'Calendar':
			return lazy(() => import('@Component/bottomsheets/calendarOptions'));
		case 'Profile':
			return lazy(() => import('@Component/bottomsheets/profileSettings'));
		case 'Task':
			return lazy(() => import('@Component/bottomsheets/taskSettings'));
		case 'CreateProjectCovers':
			return lazy(() => import('@Component/bottomsheets/createProjectCovers'));
		case 'CreateProjectAddMembers':
			return lazy(() => import('@Component/bottomsheets/createProjectAddMembers'));
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
