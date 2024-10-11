import { UserInterface } from '@Type/user';

export enum MemberRole {
	ADMIN = 'ADMIN',
	MEMBER = 'MEMBER',
}

export type MembersInterface = UserInterface & { role: MemberRole };

export interface ProjectInterface {
	uid?: string | null;
	adminUID: string;
	membersUID: string[];
	title: string;
	cover: string;
	members: MembersInterface[];
	created: Date;
}

export interface ProjectStateInterface {
	projects: ProjectInterface[];
	project: ProjectInterface | null;
	loading: boolean;
	error: string | null;
	tmpMembers: MembersInterface[];
	tmpCover: string | null;
}
