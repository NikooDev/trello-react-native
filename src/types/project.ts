import CommonInterface from '@Type/common';
import { UserInterface } from '@Type/user';
import StatusStateInterface from '@Type/store';
import { RootStackUserType } from '@Type/stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export enum MemberRoleEnum {
	ADMIN = 'ADMIN',
	MEMBER = 'MEMBER',
}

export enum PriorityEnum {
	LOW = 'LOW',
	MEDIUM = 'MEDIUM',
	HIGH = 'HIGH'
}

export interface ProjectInterface extends CommonInterface {
	adminUID: string;
	membersUID: string[];
	author: string;
	title: string;
	priority: PriorityEnum | null;
	cover: {
		coverID: number;
		landscape: string;
		portrait: string;
	};
	members: MembersInterface[];
	nbTasks: number;
	nbTasksEnd: number;
}

export type CreateProjectInterface = Omit<ProjectInterface, 'uid'>;
export type MembersInterface = UserInterface & { role: MemberRoleEnum };

export interface ProjectStateInterface extends StatusStateInterface {
	projects: ProjectInterface[];
	project: ProjectInterface | null;
	sortPriority: PriorityEnum | null;
	tmp: ProjectStateTmpInterface;
}

export interface ProjectStateTmpInterface {
	members: MembersInterface[];
	coverID: number;
	coverURI: {
		landscape: string;
		portrait: string;
	};
	sortPriority: PriorityEnum | null,
}

export interface ProjectItemInterface {
	project: ProjectInterface;
	index: number;
	user: UserInterface;
	loading: boolean;
	navigation: NativeStackNavigationProp<RootStackUserType, 'Projects', undefined>;
}

export interface PriorityInterface {
	sortPriority: PriorityEnum | null;
	enableTitle?: boolean;
	isToggle?: boolean;
}

export interface CoverInterface {
	coverID: number | null;
	isCreate: boolean;
}

export interface MembersManagerInterface {
	members: MembersInterface[];
	isCreate: boolean;
}
