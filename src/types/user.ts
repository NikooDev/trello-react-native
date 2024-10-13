import { CreatedInterface } from '@Type/firestore';

export interface UserInterface extends CreatedInterface {
	uid: string;
	firstname: string;
	lastname: string;
	email: string;
	avatarID: string;
	badgeChat: number;
}

export interface UserStateInterface {
	user: UserInterface;
	loading: boolean;
	error: string | null;
}
