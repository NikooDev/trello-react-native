import React, { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { theme } from '@Asset/theme/default';

const loadComponent = (componentName: string | null) => {
	switch (componentName) {
		case 'Project':
			return lazy(() => import('@Component/bottomsheets/project.bottomsheet'));
		case 'Projects':
			return lazy(() => import('@Component/bottomsheets/projects.bottomsheet'));
		case 'Calendar':
			return lazy(() => import('@Component/bottomsheets/calendar.bottomsheet'));
		case 'Profile':
			return lazy(() => import('@Component/bottomsheets/profile.bottomsheet'));
		case 'Task':
			return lazy(() => import('@Component/bottomsheets/task.bottomsheet'));
		case 'Covers':
			return lazy(() => import('@Component/bottomsheets/cover.bottomsheet'));
		case 'AddMembers':
			return lazy(() => import('@Component/bottomsheets/addMembers.bottomsheet'));
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
