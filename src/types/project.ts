import { UserInterface } from '@Type/user';
import { Photo } from 'pexels';

export enum MemberRole {
	ADMIN = 'ADMIN',
	MEMBER = 'MEMBER',
}

export enum PriorityEnum {
	LOW = 'LOW',
	MEDIUM = 'MEDIUM',
	HIGH = 'HIGH'
}

export type MembersInterface = UserInterface & { role: MemberRole };

export interface ProjectInterface {
	uid?: string | null;
	adminUID: string;
	membersUID: string[];
	author: string;
	priority: PriorityEnum
	title: string;
	cover: {
		landscape: string;
		portrait: string;
	};
	nbTasks: number;
	nbTasksEnd: number;
	members: MembersInterface[];
	created: Date;
}

export interface ProjectStateInterface {
	projects: ProjectInterface[];
	project: ProjectInterface | null;
	loading: boolean;
	error: string | null;
	tmpMembers: MembersInterface[];
	tmpCoverID: string | null;
	tmpCoverURI: Photo['src'];
	sortPriority: PriorityEnum | undefined;
}
