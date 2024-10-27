import { useCallback, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { getUser, setUser } from '@Action/user.action';
import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from '@Action/auth.action';
import { RootDispatch, RootStateType } from '@Type/store';
import Firebase, { authKey } from '@Service/firebase/init';
import { setLoginError, setLoginSuccess, setLogout } from '@Store/reducers/auth.reducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetStore } from '@Store/reducers';
import { UserInterface } from '@Type/user';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

/**
 * @description Hook for authentication -> Checks the user's authentication state
 */
const useAuth = () => {
	const dispatch = useDispatch<RootDispatch>();
	const { user: currentUser } = useSelector((state: RootStateType) => state.user);
	const auth = new Firebase().auth;
	let unsubscribeUserDoc: (() => void) | null = null;

	/**
	 * @description Listens for authentication state changes
	 */
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
			try {
				if (user) {
					const token = await user.getIdToken();

					if (token) {
						dispatch(getUser(user.uid));
						loginState();
						onUserStateChange(user.uid);
					} else {
						await logout();
					}
				} else {
					await logout();
				}
			} catch (error) {
				console.error('Error during authentication:', error);
				await logout();
			}
		});

		return () => {
			unsubscribe();
		}
	}, [dispatch]);

	/**
	 * @description Listens for user state changes
	 * @param userUID
	 */
	const onUserStateChange = useCallback((userUID: string) => {
		const db = new Firebase().db;

		const userDocRef = doc(db, 'users', userUID);

		unsubscribeUserDoc = onSnapshot(userDocRef, async (doc) => {
			if (doc.exists()) {
				const user = doc.data() as UserInterface;

				if (user !== currentUser) {
					dispatch(setUser(user));
				}
			}
		}, (error) => {
			console.log(error);
		});
	}, [currentUser])

	/**
	 * @description Checks the user's authentication only once
	 */
	const checkAuth = useCallback(() => {
		new Promise(resolve => setTimeout(resolve, 500)).then(async () => {
			try {
				const storedUser = await AsyncStorage.getItem(authKey);
				if (storedUser) {
					const parsedData = JSON.parse(storedUser);
					const token = parsedData.stsTokenManager.accessToken;

					if (token) {
						loginState();
					} else {
						await logout();
					}
				} else {
					await logout();
				}
			} catch (error) {
				console.error('Error during authentication:', error);
				dispatch(setLoginError());
			}
		});
	}, [dispatch]);

	/**
	 * @description Logs in the user
	 */
	const loginState = () => {
		dispatch(setLoginSuccess());
	}

	/**
	 * @description Logs out the user
	 */
	const logout = async () => {
		dispatch(setLogout());
		dispatch(resetStore());

		if (unsubscribeUserDoc) {
			unsubscribeUserDoc();
		}

		await signOut();
	}

	return {
		checkAuth, logout
	}
}

export default useAuth;
