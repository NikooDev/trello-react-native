import CommonInterface from '@Type/common';
import StatusStateInterface from '@Type/store';

export interface UserInterface extends CommonInterface {
	firstname: string;
	lastname: string;
	email: string;
	avatarID: string;
	badgeChat: number;
}

export interface UserStateInterface extends StatusStateInterface {
	user: UserInterface;
}
