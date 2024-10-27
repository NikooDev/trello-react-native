import Firebase from '@Service/firebase/init';
import FirstoreService from '@Service/firebase/store';
import { FirebaseError } from '@firebase/util';
import { DateTime } from 'luxon';
import { GoogleSignin, isErrorWithCode } from '@react-native-google-signin/google-signin';
import firebaseConfig from '@Config/firebase';
import { UserInterface } from '@Type/user';
import { AuthInterface, SignupInterface } from '@Type/auth';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, signOut as logout } from 'firebase/auth';

/**
 * @description Sign up user
 * @param email
 * @param password
 * @param firstname
 * @param lastname
 * @param avatarID
 */
export const signup = async ({ email, password, firstname, lastname, avatarID }: SignupInterface) => {
	if (!email || !password || !firstname || !lastname || !avatarID) return;

	const auth = new Firebase().auth;
	const firestore = new FirstoreService<UserInterface>('users');

	try {
		const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);

		if (newUser) {
			const user = {
				uid: newUser.uid,
				firstname: firstname.trim(),
				lastname: lastname.trim(),
				email: email.trim(),
				badgeChat: 0,
				created: DateTime.now(),
				avatarID
			} as UserInterface

			const userCreated = await firestore.createDocument(user);

			if (userCreated.valid) {
				return await newUser.getIdToken();
			}
		}
	} catch (err) {
		console.log(err);

		if (err instanceof FirebaseError) {
			switch (err.code) {
				case 'auth/email-already-in-use':
					throw new Error('Cette adresse e-mail est déjà utilisée par un autre compte.');
				case 'auth/weak-password':
					throw new Error('Le mot de passe est trop faible. Veuillez choisir un mot de passe de 6 caractères minimum.');
				case 'auth/network-request-failed':
					throw new Error('Problème de connexion réseau. Veuillez vérifier votre connexion et réessayer.');
				case 'auth/too-many-requests':
					throw new Error('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
				default:
					throw new Error('Une erreur inattendue s\'est produite.');
			}
		} else {
			throw new Error('Une erreur s\'est produite lors de l\'inscription.');
		}
	}
}

/**
 * @description Sign in user
 * @param email
 * @param password
 */
export const signIn = async ({email, password}: AuthInterface) => {
	const auth = new Firebase().auth;

	try {
		const { user } = await signInWithEmailAndPassword(auth, email, password);

		return await user.getIdToken();
	} catch (err) {
		console.log(err);

		if (err instanceof FirebaseError) {
			switch (err.code) {
				case 'auth/invalid-credential':
					throw new Error('Aucun compte ne correspond à cette adresse e-mail.');
				case 'auth/invalid-email':
					throw new Error("L'adresse e-mail est invalide.");
				case 'auth/user-disabled':
					throw new Error('Ce compte a été désactivé.');
				case 'auth/user-not-found':
					throw new Error('Aucun compte ne correspond à cette adresse e-mail.');
				case 'auth/wrong-password':
					throw new Error('Le mot de passe est incorrect.');
				default:
					throw new Error('Une erreur inattendue s\'est produite.');
			}
		} else {
			throw new Error('Une erreur s\'est produite lors de la connexion.');
		}
	}
};

/**
 * @description Sign up or sign in user with Google
 */
export const signInWithGoogle = async () => {
	const auth = new Firebase().auth;
	const firestore = new FirstoreService<UserInterface>('users');

	GoogleSignin.configure({
		webClientId: firebaseConfig.webClientId
	});

	try {
		await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
		const { data } = await GoogleSignin.signIn();

		if (!data) {
			return false;
		}

		if (data && !data.idToken) {
			return false;
		}

		const googleCredential = GoogleAuthProvider.credential(data.idToken);
		const { user } = await signInWithCredential(auth, googleCredential);
		const token = await user.getIdToken();

		const userDoc = await firestore.getDocument<UserInterface>(user.uid);

		if (!userDoc) {
			const newUser = {
				uid: user.uid,
				firstname: data.user.givenName,
				lastname: data.user.familyName || '',
				email: data.user.email,
				badgeChat: 0,
				created: DateTime.now(),
				avatarID: (data.user.photo as string).replace(/(=s\d+)(-c-no)?/, `=s${250}$2`)
			};

			const userCreated = await firestore.createDocument(newUser);

			if (userCreated.valid) {
				return token;
			} else {
				return false
			}
		} else {
			return token;
		}
	} catch (err) {
		console.error(err);

		if (isErrorWithCode(err)) {
			console.log(err);
			switch (err.code) {
				case 'auth/network-request-failed':
					throw new Error('Problème de connexion réseau. Veuillez vérifier votre connexion et réessayer.');
				case 'auth/too-many-requests':
					throw new Error('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
				default:
					throw new Error('Une erreur inattendue s\'est produite.');
			}
		} else {
			throw new Error('Une erreur s\'est produite lors de la connexion avec Google.');
		}
	}
};

/**
 * @description Sign out user
 */
export const signOut = async () => {
	const auth = new Firebase().auth;

	GoogleSignin.configure({
		webClientId: firebaseConfig.webClientId
	});

	try {
		await logout(auth);
		await GoogleSignin.revokeAccess();
		await GoogleSignin.signOut();

		return true;
	} catch (err) {
		console.log(err);
	}
}
