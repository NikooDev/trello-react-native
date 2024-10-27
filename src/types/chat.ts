import CommonInterface from '@Type/common';
import { MemberRoleEnum, ProjectInterface } from '@Type/project';
import StatusStateInterface from '@Type/store';

export interface ChatInterface extends CommonInterface {
	userUID: string;
	avatarID: string;
	author: string;
	role: MemberRoleEnum;
	content: string;
	read: boolean;
	newMessage: boolean;
}

export interface ChatStateInterface extends StatusStateInterface {
	messages: ChatInterface[];
	chatProject: ProjectInterface | null;
}
