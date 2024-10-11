import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebaseConfig from '@Config/firebase';

/**
 * @description Firebase initialization
 * @author Nicolas Tual
 */
class Firebase {
	private instance: Firebase | null = null;
	public app: FirebaseApp;
	public db: Firestore;
	public auth: Auth;

	constructor() {
		const apps = getApps();

		if (apps.length === 0) {
			this.app = initializeApp(firebaseConfig);
			this.auth = initializeAuth(this.app, {
				persistence: getReactNativePersistence(AsyncStorage),
			});
			this.db = getFirestore(this.app);
		} else {
			this.app = getApp();
			this.auth = getAuth(this.app);
			this.db = getFirestore(this.app);
		}
	}

	public init(): Firebase {
		if (!this.instance) {
			this.instance = new Firebase();
		}

		return this.instance;
	}
}

export const authKey = `firebase:authUser:${firebaseConfig.apiKey}:[DEFAULT]`;

export default Firebase;
